import { useEffect, useState, useMemo } from "react";
import { supabase } from "../../lib/supabase";
import Papa from "papaparse";
import { Link, useLocation } from "react-router-dom";
import {
  Plus, Wallet, TrendingDown, DollarSign, Search, Filter, Download as DownloadIcon,
  FileText, X, Save, Trash2, Calendar
} from "lucide-react";

const CATEGORIES = [
  { id: "tools", label: "Tools & Software", color: "#3b82f6" },
  { id: "hosting", label: "Hosting", color: "#8b5cf6" },
  { id: "design", label: "Design Assets", color: "#ec4899" },
  { id: "marketing", label: "Marketing", color: "#f59e0b" },
  { id: "hardware", label: "Hardware", color: "#10b981" },
  { id: "travel", label: "Travel", color: "#06b6d4" },
  { id: "other", label: "Other", color: "#64748b" }
];

const CAT_COLORS = Object.fromEntries(CATEGORIES.map(c => [c.id, c.color]));
const CAT_LABELS = Object.fromEntries(CATEGORIES.map(c => [c.id, c.label]));

const EMPTY_FORM = {
  title: "", amount: "", category: "tools", date: new Date().toISOString().split('T')[0], project_id: "", notes: ""
};

export default function Expenses() {
  const location = useLocation();
  const [expenses, setExpenses] = useState([]);
  const [projects, setProjects] = useState([]);
  const [paidInvoicesTotal, setPaidInvoicesTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");

  // Sheet
  const [sheetOpen, setSheetOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [receiptFile, setReceiptFile] = useState(null);
  const [saving, setSaving] = useState(false);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const [expRes, invRes, projRes] = await Promise.all([
      supabase.from("expenses").select("*").order("date", { ascending: false }),
      supabase.from("invoices").select("total").eq("status", "paid"),
      supabase.from("projects").select("id, title")
    ]);
    
    if (expRes.data) setExpenses(expRes.data);
    if (projRes.data) setProjects(projRes.data);
    
    if (invRes.data) {
      const sum = invRes.data.reduce((acc, inv) => acc + (Number(inv.total) || 0), 0);
      setPaidInvoicesTotal(sum);
    }
    
    // Check if coming from Project Detail to auto-open Add Expense
    if (location.state?.newExp && location.state?.projectId) {
      setForm(prev => ({ ...prev, project_id: location.state.projectId }));
      setSheetOpen(true);
      // Clean up state so refresh doesn't pop sheet again
      window.history.replaceState({}, document.title);
    }

    setLoading(false);
  }

  // --- Calculations ---
  const filtered = expenses.filter(e => {
    if (filterCat !== "all" && e.category !== filterCat) return false;
    if (search && !e.title.toLowerCase().includes(search.toLowerCase()) && !(e.notes || "").toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalSpentAll = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const spentThisMonth = expenses
    .filter(e => {
       const d = new Date(e.date);
       return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((sum, e) => sum + Number(e.amount), 0);
    
  const netProfit = paidInvoicesTotal - totalSpentAll;

  // Chart Data
  const chartData = useMemo(() => {
    const map = {};
    expenses.forEach(e => {
      map[e.category] = (map[e.category] || 0) + Number(e.amount);
    });
    return Object.entries(map).map(([cat, val]) => ({
      name: CAT_LABELS[cat] || cat,
      value: val,
      color: CAT_COLORS[cat] || "#64748b"
    })).sort((a,b) => b.value - a.value);
  }, [expenses]);

  // --- Handlers ---
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let url = null;
      
      // Upload Receipt
      if (receiptFile) {
        const ext = receiptFile.name.split('.').pop();
        const filename = `${Date.now()}_${Math.random().toString(36).substr(2, 5)}.${ext}`;
        const { data, error } = await supabase.storage.from("receipts").upload(filename, receiptFile);
        if (error) throw error;
        const urlReq = supabase.storage.from("receipts").getPublicUrl(filename);
        url = urlReq.data.publicUrl;
      }

      const payload = {
        title: form.title,
        amount: Number(form.amount),
        category: form.category,
        date: form.date,
        project_id: form.project_id || null,
        notes: form.notes
      };
      if (url) payload.receipt_url = url;

      const { data, error } = await supabase.from("expenses").insert(payload).select().single();
      if (error) throw error;
      
      setExpenses([data, ...expenses].sort((a,b) => new Date(b.date) - new Date(a.date)));
      setSheetOpen(false);
      setForm(EMPTY_FORM);
      setReceiptFile(null);
    } catch (err) {
      console.error(err);
      alert("Error saving expense: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const { error } = await supabase.from("expenses").delete().eq("id", deleteTarget.id);
    setDeleting(false);
    if (error) {
      alert("Error deleting: " + error.message);
      return;
    }
    setExpenses(prev => prev.filter(e => e.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const downloadCSV = () => {
    const csv = Papa.unparse(filtered.map(e => ({
      ID: e.id,
      Date: e.date,
      Title: e.title,
      Category: CAT_LABELS[e.category] || e.category,
      Amount: e.amount,
      Currency: e.currency,
      Project: projects.find(p => p.id === e.project_id)?.title || "",
      Receipt: e.receipt_url || "",
      Notes: e.notes || ""
    })));
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `expenses_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const inputStyle = { background: "#111827", border: "1px solid #334155", color: "#f1f5f9" };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"/></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Expense Tracker</h1>
          <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>Manage and track your business expenditures.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={downloadCSV} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:bg-white/5" style={{ color: "#e2e8f0", border: "1px solid #334155" }}>
            <DownloadIcon size={16} /> Export CSV
          </button>
          <button onClick={() => { setForm(EMPTY_FORM); setReceiptFile(null); setSheetOpen(true); }} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-semibold hover:opacity-90 transition-opacity">
            <Plus size={18} /> Add Expense
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl flex items-center justify-between shadow-xl" style={{ background: "linear-gradient(135deg, #1e293b, #0f172a)", border: "1px solid #334155" }}>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Spent This Month</p>
            <h3 className="text-2xl font-black text-white mt-1">₹{spentThisMonth.toLocaleString("en-IN")}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-500/10 text-blue-400"><Calendar size={20}/></div>
        </div>
        
        <div className="p-6 rounded-2xl flex items-center justify-between shadow-xl" style={{ background: "linear-gradient(135deg, #1e293b, #0f172a)", border: "1px solid #334155" }}>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Expenses</p>
            <h3 className="text-2xl font-black text-rose-400 mt-1">₹{totalSpentAll.toLocaleString("en-IN")}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-rose-500/10 text-rose-400"><TrendingDown size={20}/></div>
        </div>

        <div className="p-6 rounded-2xl flex items-center justify-between shadow-xl" style={{ background: "linear-gradient(135deg, #10b98115, #0f172a)", border: "1px solid rgba(16,185,129,0.3)" }}>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Net Profit (All-Time)</p>
            <h3 className="text-2xl font-black text-emerald-400 mt-1">₹{netProfit.toLocaleString("en-IN")}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-emerald-500/10 text-emerald-400"><Wallet size={20}/></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main List */}
        <div className="col-span-2 rounded-2xl flex flex-col" style={{ background: "#1e293b", border: "1px solid #334155" }}>
          <div className="p-4 flex items-center justify-between border-b border-[#334155]">
            <div className="flex items-center gap-3 w-full">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search expenses..." className="w-full pl-9 pr-3 py-2 rounded-lg text-sm bg-[#0f172a] border border-[#334155] text-white focus:outline-none focus:border-blue-500" />
              </div>
              <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="w-40 py-2 px-3 rounded-lg text-sm bg-[#0f172a] border border-[#334155] text-white focus:outline-none focus:border-blue-500">
                <option value="all">All Categories</option>
                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
          </div>
          
          <div className="flex-1 overflow-x-auto min-h-[400px]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#334155] bg-[#0f172a]">
                  <th className="px-5 py-4 text-left font-semibold text-slate-400">Expense</th>
                  <th className="px-5 py-4 text-left font-semibold text-slate-400 w-32">Category</th>
                  <th className="px-5 py-4 text-left font-semibold text-slate-400 w-32">Date</th>
                  <th className="px-5 py-4 text-right font-semibold text-slate-400 w-32">Amount</th>
                  <th className="px-5 py-4 text-right font-semibold text-slate-400 w-16"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={5} className="py-12 text-center text-slate-500">No expenses found.</td></tr>
                ) : filtered.map(exp => (
                  <tr key={exp.id} className="border-b border-[#334155] hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-medium text-white">{exp.title}</p>
                      {exp.project_id && <p className="text-[11px] text-blue-400 mt-1 uppercase tracking-wider opacity-80">{projects.find(p => p.id === exp.project_id)?.title}</p>}
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-medium" style={{ background: `${CAT_COLORS[exp.category]}15`, color: CAT_COLORS[exp.category] }}>
                        {CAT_LABELS[exp.category] || exp.category}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-400">{new Date(exp.date).toLocaleDateString()}</td>
                    <td className="px-5 py-4 text-right font-semibold text-white">₹{Number(exp.amount).toLocaleString("en-IN")}</td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {exp.receipt_url && <a href={exp.receipt_url} target="_blank" rel="noreferrer" title="View Receipt" className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"><FileText size={15}/></a>}
                        <button onClick={() => setDeleteTarget(exp)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors"><Trash2 size={15}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Charts & Breakdown */}
        <div className="col-span-1 space-y-6">
          <div className="rounded-2xl p-6" style={{ background: "#1e293b", border: "1px solid #334155" }}>
            <h3 className="text-white font-semibold mb-6">Category Breakdown</h3>
            {chartData.length > 0 ? (
              <div className="flex flex-col items-center py-4">
                <svg width="200" height="200" viewBox="0 0 200 200" className="transform -rotate-90">
                  {(() => {
                    let currentOffset = 0;
                    const total = chartData.reduce((sum, d) => sum + d.value, 0);
                    const r = 65;
                    const c = 2 * Math.PI * r;
                    return chartData.map((d, i) => {
                      const strokeLength = (d.value / total) * c;
                      const gapLength = c - strokeLength;
                      const dasharray = `${strokeLength} ${gapLength}`;
                      const dashoffset = -currentOffset;
                      currentOffset += strokeLength;
                      return (
                        <circle
                          key={i}
                          cx="100"
                          cy="100"
                          r={r}
                          fill="transparent"
                          stroke={d.color}
                          strokeWidth="35"
                          strokeDasharray={dasharray}
                          strokeDashoffset={dashoffset}
                          className="transition-all duration-300 hover:stroke-[40px] cursor-pointer"
                        >
                          <title>{d.name}: ₹{d.value.toLocaleString("en-IN")}</title>
                        </circle>
                      );
                    });
                  })()}
                </svg>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-500 text-sm">No data to chart</div>
            )}
            
            <div className="space-y-3 mt-4">
              {chartData.map((d, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-slate-300">
                    <span className="w-3 h-3 rounded-full" style={{ background: d.color }}></span>
                    {d.name}
                  </div>
                  <span className="font-semibold text-white">₹{d.value.toLocaleString("en-IN")}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Sheet */}
      {sheetOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]" onClick={() => setSheetOpen(false)} />
          <div className="fixed top-0 right-0 bottom-0 w-full max-w-md z-[61] flex flex-col overflow-y-auto shadow-2xl" style={{ background: "#0f172a", borderLeft: "1px solid #334155", animation: "slideIn .2s ease-out" }}>
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#334155]">
              <h2 className="text-lg font-bold text-white">Add Expense</h2>
              <button onClick={() => setSheetOpen(false)} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400"><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="flex-1 px-6 py-6 space-y-5">
              <div><label className="block text-sm font-medium mb-1.5 text-slate-400">Expense Title</label><input type="text" value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} required placeholder="e.g. AWS Invoice" className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-colors" style={inputStyle} /></div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-slate-400">Date</label>
                  <input type="date" value={form.date} onChange={e => setForm(p => ({...p, date: e.target.value}))} required className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-blue-500 placeholder-slate-500" style={inputStyle} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-slate-400">Amount (₹)</label>
                  <input type="number" step="0.01" value={form.amount} onChange={e => setForm(p => ({...p, amount: e.target.value}))} required placeholder="1000.00" className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-blue-500" style={inputStyle} />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1.5 text-slate-400">Category</label>
                  <select value={form.category} onChange={e => setForm(p => ({...p, category: e.target.value}))} className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none" style={inputStyle}>
                    {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-slate-400">Link to Project (Optional)</label>
                <select value={form.project_id} onChange={e => setForm(p => ({...p, project_id: e.target.value}))} className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none" style={inputStyle}>
                  <option value="">None</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
              </div>

              <div>
                 <label className="block text-sm font-medium mb-1.5 text-slate-400">Receipt Upload (Optional)</label>
                 <input type="file" onChange={e => setReceiptFile(e.target.files[0])} accept="image/*,.pdf" className="w-full px-4 py-2.5 rounded-xl text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-500/10 file:text-blue-400 hover:file:bg-blue-500/20" style={inputStyle} />
              </div>

              <div><label className="block text-sm font-medium mb-1.5 text-slate-400">Notes</label><textarea value={form.notes} onChange={e => setForm(p => ({...p, notes: e.target.value}))} rows={3} placeholder="Any extra details..." className="w-full px-4 py-3 rounded-xl text-sm resize-none focus:outline-none focus:border-blue-500" style={inputStyle} /></div>

              <div className="pt-4">
                <button type="submit" disabled={saving} className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-bold shadow-lg shadow-blue-500/25 hover:opacity-90 disabled:opacity-50 transition-opacity">
                  <Save size={16} /> {saving ? "Saving..." : "Save Expense"}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* Delete Dialog */}
      {deleteTarget && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70]" onClick={() => setDeleteTarget(null)} />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm rounded-2xl p-6 z-[71] space-y-4" style={{ background: "#1e293b", border: "1px solid #334155", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
            <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center bg-rose-500/10"><Trash2 size={22} className="text-rose-400" /></div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-white">Delete Expense</h3>
              <p className="text-sm mt-2 text-slate-400">Delete <span className="text-white font-medium">{deleteTarget.title}</span>? This permanently removes the record.</p>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-white/5 border border-[#334155]">Cancel</button>
              <button onClick={handleDelete} disabled={deleting} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-rose-500 hover:bg-rose-600 disabled:opacity-50">{deleting ? "Deleting..." : "Delete"}</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
