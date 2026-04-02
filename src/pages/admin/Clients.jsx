import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import {
  Plus, Search, Pencil, Trash2, X, Save, Users, Building2,
  MapPin, Mail, Phone, SlidersHorizontal, ArrowUpDown, ChevronRight,
} from "lucide-react";

const STATUS_OPTIONS = ["active", "inactive", "prospect"];
const STATUS_COLORS = {
  active: { bg: "rgba(34,197,94,0.1)", color: "#4ade80", border: "rgba(34,197,94,0.2)" },
  inactive: { bg: "rgba(239,68,68,0.1)", color: "#f87171", border: "rgba(239,68,68,0.2)" },
  prospect: { bg: "rgba(59,130,246,0.1)", color: "#60a5fa", border: "rgba(59,130,246,0.2)" },
};

const EMPTY = { name: "", email: "", phone: "", company: "", city: "", status: "prospect", notes: "" };

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortAsc, setSortAsc] = useState(false);

  // Sheet state
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  // Delete dialog state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const sheetRef = useRef(null);

  useEffect(() => { fetchClients(); }, []);

  async function fetchClients() {
    const { data } = await supabase.from("clients").select("*").order("created_at", { ascending: false });
    if (data) setClients(data);
    setLoading(false);
  }

  function openAdd() {
    setEditingClient(null);
    setForm(EMPTY);
    setSheetOpen(true);
  }

  function openEdit(client) {
    setEditingClient(client);
    setForm({
      name: client.name || "",
      email: client.email || "",
      phone: client.phone || "",
      company: client.company || "",
      city: client.city || "",
      status: client.status || "prospect",
      notes: client.notes || "",
    });
    setSheetOpen(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    if (editingClient) {
      const { data } = await supabase.from("clients").update(form).eq("id", editingClient.id).select().single();
      if (data) setClients(prev => prev.map(c => c.id === data.id ? data : c));
    } else {
      const { data } = await supabase.from("clients").insert(form).select().single();
      if (data) setClients(prev => [data, ...prev]);
    }
    setSaving(false);
    setSheetOpen(false);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    await supabase.from("clients").delete().eq("id", deleteTarget.id);
    setClients(prev => prev.filter(c => c.id !== deleteTarget.id));
    setDeleting(false);
    setDeleteTarget(null);
  }

  function toggleSort(field) {
    if (sortBy === field) setSortAsc(!sortAsc);
    else { setSortBy(field); setSortAsc(true); }
  }

  // Filter + Search + Sort
  const filtered = clients
    .filter(c => filterStatus === "all" || c.status === filterStatus)
    .filter(c => {
      if (!search) return true;
      const s = search.toLowerCase();
      return (c.name || "").toLowerCase().includes(s) || (c.email || "").toLowerCase().includes(s) || (c.company || "").toLowerCase().includes(s) || (c.city || "").toLowerCase().includes(s);
    })
    .sort((a, b) => {
      let va = a[sortBy], vb = b[sortBy];
      if (sortBy === "name") { va = (va || "").toLowerCase(); vb = (vb || "").toLowerCase(); }
      if (va < vb) return sortAsc ? -1 : 1;
      if (va > vb) return sortAsc ? 1 : -1;
      return 0;
    });

  const inputStyle = { background: "#111827", border: "1px solid #334155", color: "#f1f5f9" };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Clients</h1>
          <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>{clients.length} total clients</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-semibold transition-all" style={{ boxShadow: "0 4px 16px rgba(59,130,246,0.25)" }}>
          <Plus size={18} />Add Client
        </button>
      </div>

      {/* Search + Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#64748b" }} />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, company, city..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            style={inputStyle}
          />
        </div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={14} style={{ color: "#64748b" }} />
          {["all", ...STATUS_OPTIONS].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: filterStatus === s ? (s === "all" ? "rgba(59,130,246,0.15)" : STATUS_COLORS[s]?.bg || "rgba(59,130,246,0.15)") : "transparent",
                color: filterStatus === s ? (s === "all" ? "#60a5fa" : STATUS_COLORS[s]?.color || "#60a5fa") : "#64748b",
                border: `1px solid ${filterStatus === s ? (s === "all" ? "rgba(59,130,246,0.3)" : STATUS_COLORS[s]?.border || "rgba(59,130,246,0.3)") : "transparent"}`,
              }}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "#1e293b", border: "1px solid #334155" }}>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: "1px solid #334155" }}>
              {[
                { key: "name", label: "Name" },
                { key: "company", label: "Company" },
                { key: "city", label: "City" },
                { key: "status", label: "Status" },
                { key: "created_at", label: "Added" },
              ].map(col => (
                <th key={col.key} className="px-5 py-3.5 text-left text-xs font-semibold cursor-pointer select-none transition-colors hover:text-white" style={{ color: "#94a3b8" }} onClick={() => toggleSort(col.key)}>
                  <span className="flex items-center gap-1.5">
                    {col.label}
                    <ArrowUpDown size={12} style={{ opacity: sortBy === col.key ? 1 : 0.3 }} />
                  </span>
                </th>
              ))}
              <th className="px-5 py-3.5 text-right text-xs font-semibold" style={{ color: "#94a3b8" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-5 py-16 text-center">
                <Users size={40} className="mx-auto mb-3" style={{ color: "rgba(148,163,184,0.2)" }} />
                <p className="text-sm" style={{ color: "#94a3b8" }}>{search || filterStatus !== "all" ? "No matching clients" : "No clients yet"}</p>
              </td></tr>
            ) : filtered.map(client => {
              const sc = STATUS_COLORS[client.status] || STATUS_COLORS.prospect;
              return (
                <tr key={client.id} className="transition-colors hover:bg-white/[0.02]" style={{ borderBottom: "1px solid #334155" }}>
                  <td className="px-5 py-4">
                    <Link to={`/admin/clients/${client.id}`} className="group flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {(client.name || "?").charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate group-hover:text-blue-400 transition-colors flex items-center gap-1">{client.name} <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" /></p>
                        {client.email && <p className="text-xs truncate" style={{ color: "#64748b" }}>{client.email}</p>}
                      </div>
                    </Link>
                  </td>
                  <td className="px-5 py-4">
                    {client.company && <span className="flex items-center gap-1.5 text-sm" style={{ color: "#94a3b8" }}><Building2 size={13} />{client.company}</span>}
                  </td>
                  <td className="px-5 py-4">
                    {client.city && <span className="flex items-center gap-1.5 text-sm" style={{ color: "#94a3b8" }}><MapPin size={13} />{client.city}</span>}
                  </td>
                  <td className="px-5 py-4">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold" style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
                      {client.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm" style={{ color: "#64748b" }}>{new Date(client.created_at).toLocaleDateString()}</td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(client)} className="p-2 rounded-lg transition-all hover:bg-blue-500/10" style={{ color: "#94a3b8" }} title="Edit"><Pencil size={15} /></button>
                      <button onClick={() => setDeleteTarget(client)} className="p-2 rounded-lg transition-all hover:bg-red-500/10" style={{ color: "#94a3b8" }} title="Delete"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Sheet (slide-over panel) ── */}
      {sheetOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]" onClick={() => setSheetOpen(false)} />
          <div ref={sheetRef} className="fixed top-0 right-0 bottom-0 w-full max-w-md z-[61] flex flex-col overflow-y-auto" style={{ background: "#0f172a", borderLeft: "1px solid #334155", animation: "slideIn .25s ease-out" }}>
            <style>{`@keyframes slideIn{from{transform:translateX(100%)}to{transform:translateX(0)}}`}</style>

            <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: "1px solid #334155" }}>
              <h2 className="text-lg font-bold text-white">{editingClient ? "Edit Client" : "New Client"}</h2>
              <button onClick={() => setSheetOpen(false)} className="p-1.5 rounded-lg transition-all hover:bg-white/10" style={{ color: "#94a3b8" }}><X size={20} /></button>
            </div>

            <form onSubmit={handleSave} className="flex-1 px-6 py-6 space-y-5 overflow-y-auto">
              {[
                { key: "name", label: "Name *", type: "text", icon: Users, required: true, placeholder: "John Doe" },
                { key: "email", label: "Email", type: "email", icon: Mail, placeholder: "john@example.com" },
                { key: "phone", label: "Phone", type: "tel", icon: Phone, placeholder: "+91 98765 43210" },
                { key: "company", label: "Company", type: "text", icon: Building2, placeholder: "Acme Inc." },
                { key: "city", label: "City", type: "text", icon: MapPin, placeholder: "Mumbai" },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-sm font-medium mb-2" style={{ color: "#94a3b8" }}>{f.label}</label>
                  <div className="relative">
                    <f.icon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#475569" }} />
                    <input
                      type={f.type} value={form[f.key]} required={f.required}
                      onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      className="w-full pl-10 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      style={inputStyle}
                    />
                  </div>
                </div>
              ))}

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#94a3b8" }}>Status</label>
                <div className="flex gap-2">
                  {STATUS_OPTIONS.map(s => {
                    const sc = STATUS_COLORS[s];
                    const sel = form.status === s;
                    return (
                      <button type="button" key={s} onClick={() => setForm(prev => ({ ...prev, status: s }))}
                        className="flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all"
                        style={{ background: sel ? sc.bg : "transparent", color: sel ? sc.color : "#64748b", border: `1px solid ${sel ? sc.border : "#334155"}` }}
                      >
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#94a3b8" }}>Notes</label>
                <textarea
                  value={form.notes} onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
                  rows={4} placeholder="Additional notes..."
                  className="w-full px-4 py-3 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  style={inputStyle}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setSheetOpen(false)} className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-white/10" style={{ color: "#94a3b8", border: "1px solid #334155" }}>Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-semibold transition-all disabled:opacity-50">
                  <Save size={15} />{saving ? "Saving..." : editingClient ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* ── Delete Dialog ── */}
      {deleteTarget && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70]" onClick={() => setDeleteTarget(null)} />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm rounded-2xl p-6 z-[71] space-y-4" style={{ background: "#1e293b", border: "1px solid #334155", boxShadow: "0 20px 60px rgba(0,0,0,0.5)", animation: "fadeUp .2s ease-out" }}>
            <style>{`@keyframes fadeUp{from{opacity:0;transform:translate(-50%,-48%)}to{opacity:1;transform:translate(-50%,-50%)}}`}</style>
            <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center" style={{ background: "rgba(239,68,68,0.1)" }}>
              <Trash2 size={22} style={{ color: "#f87171" }} />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-white">Delete Client</h3>
              <p className="text-sm mt-2" style={{ color: "#94a3b8" }}>
                Are you sure you want to delete <span className="text-white font-medium">{deleteTarget.name}</span>? This will also remove all linked invoices.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2.5 rounded-xl text-sm font-medium" style={{ color: "#94a3b8", border: "1px solid #334155" }}>Cancel</button>
              <button onClick={handleDelete} disabled={deleting} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50" style={{ background: "#ef4444" }}>
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
