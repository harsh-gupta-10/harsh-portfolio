import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react";

const EMPTY_ITEM = { description: "", quantity: 1, rate: 0, amount: 0 };

export default function InvoiceForm() {
  const { id } = useParams();
  const location = useLocation();
  const isEditing = !!id && id !== "new";
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    invoice_number: "", client_id: "", project_id: "", status: "draft",
    issue_date: new Date().toISOString().split("T")[0], due_date: "",
    tax_percent: 18, notes: "",
  });
  const [items, setItems] = useState([{ ...EMPTY_ITEM }]);

  useEffect(() => { fetchInit(); }, []);

  async function fetchInit() {
    const { data: { user } } = await supabase.auth.getUser();
    
    const [cRes, pRes, sRes] = await Promise.all([
      supabase.from("clients").select("id, name"),
      supabase.from("projects").select("id, title, client_id"),
      user ? supabase.from("settings").select("*").eq("user_id", user.id).single() : Promise.resolve({ data: null })
    ]);
    
    if (cRes.data) setClients(cRes.data);
    if (pRes.data) setProjects(pRes.data);
    
    const defaultTax = sRes.data?.default_tax_percent ?? 18;
    const prefix = sRes.data?.invoice_prefix || "INV";

    if (isEditing) {
      const { data: inv } = await supabase.from("invoices").select("*").eq("id", id).single();
      if (inv) {
        setForm({
          invoice_number: inv.invoice_number || "", client_id: inv.client_id || "",
          project_id: inv.project_id || "", status: inv.status || "draft",
          issue_date: inv.issue_date || "", due_date: inv.due_date || "",
          tax_percent: inv.tax_percent ?? defaultTax, notes: inv.notes || "",
        });
        const { data: lineItems } = await supabase.from("invoice_items").select("*").eq("invoice_id", id);
        if (lineItems?.length) setItems(lineItems.map(li => ({ description: li.description, quantity: li.quantity, rate: li.rate, amount: li.amount })));
      }
    } else {
      // Auto-generate invoice number
      const { data: last } = await supabase.from("invoices").select("invoice_number").order("created_at", { ascending: false }).limit(1);
      let next = 1;
      if (last?.[0]?.invoice_number) {
        const match = last[0].invoice_number.match(/(\d+)$/);
        if (match) next = parseInt(match[1]) + 1;
      }
      
      let initialClient = location.state?.clientId || "";
      let initialTotal = location.state?.invoiceTotal || 0;
      let initialDesc = location.state?.proposalRef ? `Invoice for Proposal: ${location.state.proposalRef}` : "Web Design & Development";

      setForm(prev => ({ 
        ...prev, 
        tax_percent: defaultTax,
        invoice_number: `${prefix}-${String(next).padStart(3, "0")}`,
        client_id: initialClient
      }));

      // Pre-fill item if Total exists
      if (initialTotal > 0) {
        setItems([{
          description: initialDesc,
          quantity: 1,
          rate: initialTotal,
          amount: initialTotal
        }]);
      }
    }
    setLoading(false);
  }

  // Line item calculations
  function updateItem(index, field, value) {
    setItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      if (field === "quantity" || field === "rate") {
        updated[index].amount = (parseFloat(updated[index].quantity) || 0) * (parseFloat(updated[index].rate) || 0);
      }
      return updated;
    });
  }

  function addItem() { setItems(prev => [...prev, { ...EMPTY_ITEM }]); }
  function removeItem(i) { if (items.length > 1) setItems(prev => prev.filter((_, idx) => idx !== i)); }

  const subtotal = items.reduce((s, item) => s + (parseFloat(item.amount) || 0), 0);
  const taxAmount = subtotal * ((parseFloat(form.tax_percent) || 0) / 100);
  const total = subtotal + taxAmount;

  // Filter projects by selected client
  const filteredProjects = form.client_id ? projects.filter(p => p.client_id === form.client_id) : projects;

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);

    const payload = {
      invoice_number: form.invoice_number, client_id: form.client_id || null,
      project_id: form.project_id || null, status: form.status,
      issue_date: form.issue_date || null, due_date: form.due_date || null,
      tax_percent: parseFloat(form.tax_percent) || 0, notes: form.notes || null,
      subtotal, tax_amount: taxAmount, total,
      amount: total, // backward compat
    };

    let invoiceId = id;
    if (isEditing) {
      await supabase.from("invoices").update(payload).eq("id", id);
      await supabase.from("invoice_items").delete().eq("invoice_id", id);
    } else {
      const { data } = await supabase.from("invoices").insert(payload).select().single();
      invoiceId = data.id;
    }

    // Insert line items
    if (invoiceId) {
      const lineItems = items.filter(i => i.description).map(i => ({
        invoice_id: invoiceId, description: i.description,
        quantity: parseFloat(i.quantity) || 0, rate: parseFloat(i.rate) || 0,
        amount: parseFloat(i.amount) || 0,
      }));
      if (lineItems.length) await supabase.from("invoice_items").insert(lineItems);
    }

    setSaving(false);
    navigate(`/admin/invoices/${invoiceId}`);
  }

  const inputStyle = { background: "#111827", border: "1px solid #334155", color: "#f1f5f9" };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate("/admin/invoices")} className="p-2 rounded-lg hover:bg-white/10" style={{ color: "#94a3b8" }}><ArrowLeft size={20} /></button>
        <h1 className="text-2xl font-bold text-white">{isEditing ? "Edit Invoice" : "Create Invoice"}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Top info */}
        <div className="rounded-2xl p-6 space-y-5" style={{ background: "#1e293b", border: "1px solid #334155" }}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div><label className="block text-xs font-medium mb-1.5" style={{ color: "#94a3b8" }}>Invoice # *</label><input type="text" value={form.invoice_number} onChange={e => setForm(p => ({ ...p, invoice_number: e.target.value }))} required className="w-full px-3 py-2.5 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50" style={inputStyle} /></div>
            <div><label className="block text-xs font-medium mb-1.5" style={{ color: "#94a3b8" }}>Status</label>
              <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none" style={inputStyle}>
                {["draft", "sent", "paid", "overdue", "cancelled"].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
            <div><label className="block text-xs font-medium mb-1.5" style={{ color: "#94a3b8" }}>Issue Date</label><input type="date" value={form.issue_date} onChange={e => setForm(p => ({ ...p, issue_date: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none" style={inputStyle} /></div>
            <div><label className="block text-xs font-medium mb-1.5" style={{ color: "#94a3b8" }}>Due Date</label><input type="date" value={form.due_date} onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none" style={inputStyle} /></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-medium mb-1.5" style={{ color: "#94a3b8" }}>Client</label>
              <select value={form.client_id} onChange={e => setForm(p => ({ ...p, client_id: e.target.value, project_id: "" }))} className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none" style={inputStyle}>
                <option value="">Select client</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div><label className="block text-xs font-medium mb-1.5" style={{ color: "#94a3b8" }}>Project</label>
              <select value={form.project_id} onChange={e => setForm(p => ({ ...p, project_id: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none" style={inputStyle}>
                <option value="">Select project</option>
                {filteredProjects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "#1e293b", border: "1px solid #334155" }}>
          <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid #334155" }}>
            <h2 className="text-sm font-semibold text-white">Line Items</h2>
            <button type="button" onClick={addItem} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium"><Plus size={14} />Add Row</button>
          </div>

          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid #334155" }}>
                <th className="px-5 py-3 text-left text-xs font-semibold" style={{ color: "#64748b" }}>Description</th>
                <th className="px-3 py-3 text-center text-xs font-semibold w-24" style={{ color: "#64748b" }}>Qty</th>
                <th className="px-3 py-3 text-center text-xs font-semibold w-28" style={{ color: "#64748b" }}>Rate (₹)</th>
                <th className="px-3 py-3 text-right text-xs font-semibold w-28" style={{ color: "#64748b" }}>Amount</th>
                <th className="px-3 py-3 w-10" />
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #334155" }}>
                  <td className="px-5 py-2.5"><input type="text" value={item.description} onChange={e => updateItem(i, "description", e.target.value)} placeholder="Design services, Dev hours..." className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50" style={inputStyle} /></td>
                  <td className="px-3 py-2.5"><input type="number" min="0" step="0.01" value={item.quantity} onChange={e => updateItem(i, "quantity", e.target.value)} className="w-full px-2 py-2 rounded-lg text-sm text-center focus:outline-none" style={inputStyle} /></td>
                  <td className="px-3 py-2.5"><input type="number" min="0" step="0.01" value={item.rate} onChange={e => updateItem(i, "rate", e.target.value)} className="w-full px-2 py-2 rounded-lg text-sm text-center focus:outline-none" style={inputStyle} /></td>
                  <td className="px-3 py-2.5 text-right text-sm font-medium text-white">₹{Number(item.amount || 0).toLocaleString()}</td>
                  <td className="px-3 py-2.5"><button type="button" onClick={() => removeItem(i)} className="p-1.5 rounded hover:bg-red-500/10" style={{ color: "#475569" }}><Trash2 size={14} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="px-6 py-4 space-y-2" style={{ borderTop: "1px solid #334155", background: "#0f172a" }}>
            <div className="flex justify-end gap-16">
              <span className="text-sm" style={{ color: "#94a3b8" }}>Subtotal</span>
              <span className="text-sm font-medium text-white w-28 text-right">₹{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-end items-center gap-4">
              <span className="text-sm" style={{ color: "#94a3b8" }}>GST</span>
              <input type="number" min="0" step="0.5" value={form.tax_percent} onChange={e => setForm(p => ({ ...p, tax_percent: e.target.value }))} className="w-16 px-2 py-1 rounded-lg text-sm text-center focus:outline-none" style={inputStyle} />
              <span className="text-sm" style={{ color: "#94a3b8" }}>%</span>
              <span className="text-sm font-medium text-white w-28 text-right">₹{taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-end gap-16 pt-2" style={{ borderTop: "1px solid #334155" }}>
              <span className="text-base font-bold text-white">Total</span>
              <span className="text-base font-bold text-white w-28 text-right">₹{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        {/* Notes + Submit */}
        <div className="rounded-2xl p-6" style={{ background: "#1e293b", border: "1px solid #334155" }}>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "#94a3b8" }}>Notes</label>
          <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={3} placeholder="Payment terms, bank details..." className="w-full px-4 py-3 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50" style={inputStyle} />
        </div>

        <div className="flex items-center justify-end gap-3">
          <button type="button" onClick={() => navigate("/admin/invoices")} className="px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-white/10" style={{ color: "#94a3b8" }}>Cancel</button>
          <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-semibold disabled:opacity-50">
            <Save size={16} />{saving ? "Saving..." : isEditing ? "Update Invoice" : "Create Invoice"}
          </button>
        </div>
      </form>
    </div>
  );
}
