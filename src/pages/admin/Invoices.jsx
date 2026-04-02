import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import {
  Plus, Search, FileText, DollarSign, Clock, AlertTriangle,
  CheckCircle2, XCircle, Send, Eye, SlidersHorizontal, ArrowUpDown,
  TrendingUp, Trash2
} from "lucide-react";

const STATUS_META = {
  draft: { label: "Draft", color: "#94a3b8", bg: "rgba(148,163,184,0.1)", border: "rgba(148,163,184,0.2)", icon: FileText },
  sent: { label: "Sent", color: "#60a5fa", bg: "rgba(59,130,246,0.1)", border: "rgba(59,130,246,0.2)", icon: Send },
  paid: { label: "Paid", color: "#4ade80", bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.2)", icon: CheckCircle2 },
  overdue: { label: "Overdue", color: "#f87171", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.2)", icon: AlertTriangle },
  cancelled: { label: "Cancelled", color: "#64748b", bg: "rgba(100,116,139,0.1)", border: "rgba(100,116,139,0.2)", icon: XCircle },
};

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortAsc, setSortAsc] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    const [iRes, cRes] = await Promise.all([
      supabase.from("invoices").select("*").order("created_at", { ascending: false }),
      supabase.from("clients").select("id, name"),
    ]);
    if (iRes.data) setInvoices(iRes.data);
    if (cRes.data) setClients(cRes.data);
    setLoading(false);
  }

  const clientMap = useMemo(() => Object.fromEntries(clients.map(c => [c.id, c.name])), [clients]);

  async function markPaid(id) {
    await supabase.from("invoices").update({ status: "paid" }).eq("id", id);
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status: "paid" } : inv));
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    
    const { error } = await supabase.from("invoices").delete().eq("id", deleteTarget.id);
    if (error) {
       console.error("Delete error:", error);
       alert("Could not delete invoice: " + error.message);
    } else {
       setInvoices(prev => prev.filter(inv => inv.id !== deleteTarget.id));
    }
    
    setDeleting(false);
    setDeleteTarget(null);
  }

  // Summary
  const totalEarned = invoices.filter(i => i.status === "paid").reduce((s, i) => s + (Number(i.total) || 0), 0);
  const pendingAmount = invoices.filter(i => ["draft", "sent"].includes(i.status)).reduce((s, i) => s + (Number(i.total) || 0), 0);
  const overdueCount = invoices.filter(i => i.status === "overdue").length;
  const totalInvoices = invoices.length;

  // Filter + sort
  const filtered = invoices
    .filter(i => filterStatus === "all" || i.status === filterStatus)
    .filter(i => {
      if (!search) return true;
      const s = search.toLowerCase();
      return (i.invoice_number || "").toLowerCase().includes(s) || clientMap[i.client_id]?.toLowerCase().includes(s);
    })
    .sort((a, b) => {
      let va = a[sortBy], vb = b[sortBy];
      if (typeof va === "string") { va = va.toLowerCase(); vb = (vb || "").toLowerCase(); }
      if (va < vb) return sortAsc ? -1 : 1;
      if (va > vb) return sortAsc ? 1 : -1;
      return 0;
    });

  function toggleSort(f) { if (sortBy === f) setSortAsc(!sortAsc); else { setSortBy(f); setSortAsc(true); } }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">Invoices</h1><p className="text-sm mt-1" style={{ color: "#94a3b8" }}>{totalInvoices} total invoices</p></div>
        <Link to="/admin/invoices/new" className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-semibold" style={{ boxShadow: "0 4px 16px rgba(59,130,246,0.25)" }}>
          <Plus size={18} />Create Invoice
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Earned", value: `₹${totalEarned.toLocaleString()}`, icon: DollarSign, gradient: "from-emerald-500 to-emerald-700", sub: "Paid invoices" },
          { label: "Pending", value: `₹${pendingAmount.toLocaleString()}`, icon: Clock, gradient: "from-amber-500 to-orange-600", sub: "Draft + Sent" },
          { label: "Overdue", value: overdueCount, icon: AlertTriangle, gradient: "from-red-500 to-red-700", sub: "Needs attention" },
          { label: "All Invoices", value: totalInvoices, icon: TrendingUp, gradient: "from-blue-500 to-blue-700", sub: "Total created" },
        ].map(c => (
          <div key={c.label} className="rounded-2xl p-5" style={{ background: "#1e293b", border: "1px solid #334155" }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs" style={{ color: "#64748b" }}>{c.label}</p>
                <p className="text-2xl font-bold text-white mt-1">{c.value}</p>
                <p className="text-[11px] mt-0.5" style={{ color: "#475569" }}>{c.sub}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.gradient} flex items-center justify-center`}><c.icon size={18} className="text-white" /></div>
            </div>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#64748b" }} />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by invoice # or client..." className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" style={{ background: "#111827", border: "1px solid #334155", color: "#f1f5f9" }} />
        </div>
        <div className="flex items-center gap-1.5">
          <SlidersHorizontal size={14} style={{ color: "#64748b" }} />
          {["all", "draft", "sent", "paid", "overdue", "cancelled"].map(s => {
            const m = STATUS_META[s];
            return (
              <button key={s} onClick={() => setFilterStatus(s)} className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all" style={{
                background: filterStatus === s ? (m?.bg || "rgba(59,130,246,0.1)") : "transparent",
                color: filterStatus === s ? (m?.color || "#60a5fa") : "#475569",
                border: `1px solid ${filterStatus === s ? (m?.border || "rgba(59,130,246,0.3)") : "transparent"}`,
              }}>
                {s === "all" ? "All" : m?.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "#1e293b", border: "1px solid #334155" }}>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: "1px solid #334155" }}>
              {[{ k: "invoice_number", l: "Invoice #" }, { k: "client_id", l: "Client" }, { k: "issue_date", l: "Date" }, { k: "due_date", l: "Due" }, { k: "total", l: "Amount" }, { k: "status", l: "Status" }].map(c => (
                <th key={c.k} onClick={() => toggleSort(c.k)} className="px-5 py-3.5 text-left text-xs font-semibold cursor-pointer select-none hover:text-white transition-colors" style={{ color: "#94a3b8" }}>
                  <span className="flex items-center gap-1.5">{c.l}<ArrowUpDown size={12} style={{ opacity: sortBy === c.k ? 1 : 0.3 }} /></span>
                </th>
              ))}
              <th className="px-5 py-3.5 text-right text-xs font-semibold" style={{ color: "#94a3b8" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="px-5 py-16 text-center">
                <FileText size={40} className="mx-auto mb-3" style={{ color: "rgba(148,163,184,0.2)" }} />
                <p className="text-sm" style={{ color: "#94a3b8" }}>No invoices found</p>
              </td></tr>
            ) : filtered.map(inv => {
              const m = STATUS_META[inv.status] || STATUS_META.draft;
              const Icon = m.icon;
              return (
                <tr key={inv.id} className="transition-colors hover:bg-white/[0.02]" style={{ borderBottom: "1px solid #334155" }}>
                  <td className="px-5 py-4">
                    <Link to={`/admin/invoices/${inv.id}`} className="text-sm font-semibold text-white hover:text-blue-400 transition-colors">{inv.invoice_number}</Link>
                  </td>
                  <td className="px-5 py-4 text-sm" style={{ color: "#94a3b8" }}>{clientMap[inv.client_id] || "—"}</td>
                  <td className="px-5 py-4 text-xs" style={{ color: "#64748b" }}>{inv.issue_date ? new Date(inv.issue_date).toLocaleDateString() : "—"}</td>
                  <td className="px-5 py-4 text-xs" style={{ color: inv.status === "overdue" ? "#f87171" : "#64748b" }}>{inv.due_date ? new Date(inv.due_date).toLocaleDateString() : "—"}</td>
                  <td className="px-5 py-4 text-sm font-semibold text-white">₹{Number(inv.total || 0).toLocaleString()}</td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold" style={{ background: m.bg, color: m.color, border: `1px solid ${m.border}` }}>
                      <Icon size={11} />{m.label}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link to={`/admin/invoices/${inv.id}`} className="p-2 rounded-lg hover:bg-blue-500/10" style={{ color: "#94a3b8" }} title="View"><Eye size={15} /></Link>
                      {inv.status !== "paid" && inv.status !== "cancelled" && (
                        <button onClick={() => markPaid(inv.id)} className="p-2 rounded-lg hover:bg-emerald-500/10" style={{ color: "#94a3b8" }} title="Mark Paid"><CheckCircle2 size={15} /></button>
                      )}
                      <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDeleteTarget(inv); }} className="p-2 rounded-lg hover:bg-red-500/10 text-[#94a3b8] hover:text-red-400 transition-colors" title="Delete"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Delete Dialog */}
      {deleteTarget && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70]" onClick={() => setDeleteTarget(null)} />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm rounded-2xl p-6 z-[71] space-y-4 shadow-2xl" style={{ background: "#1e293b", border: "1px solid #334155" }}>
            <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center bg-red-500/10"><Trash2 size={24} className="text-red-400" /></div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-white">Delete Invoice</h3>
              <p className="text-sm mt-2 text-slate-400">Are you sure you want to delete <span className="text-white">{deleteTarget.invoice_number}</span>?</p>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2.5 rounded-xl border border-slate-600 text-slate-300 font-medium hover:bg-slate-800">Cancel</button>
              <button onClick={handleDelete} disabled={deleting} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 disabled:opacity-50">Delete</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
