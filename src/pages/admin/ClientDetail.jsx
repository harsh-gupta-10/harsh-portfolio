import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import {
  ArrowLeft, Mail, Phone, Building2, MapPin, Calendar, Users,
  FolderKanban, FileText, DollarSign, Clock, ExternalLink, Plus
} from "lucide-react";

const STATUS_COLORS = {
  active: { bg: "rgba(34,197,94,0.1)", color: "#4ade80", border: "rgba(34,197,94,0.2)" },
  inactive: { bg: "rgba(239,68,68,0.1)", color: "#f87171", border: "rgba(239,68,68,0.2)" },
  prospect: { bg: "rgba(59,130,246,0.1)", color: "#60a5fa", border: "rgba(59,130,246,0.2)" },
};

const INV_STATUS = {
  draft: { bg: "rgba(148,163,184,0.1)", color: "#94a3b8" },
  sent: { bg: "rgba(59,130,246,0.1)", color: "#60a5fa" },
  paid: { bg: "rgba(34,197,94,0.1)", color: "#4ade80" },
  overdue: { bg: "rgba(245,158,11,0.1)", color: "#fbbf24" },
  cancelled: { bg: "rgba(239,68,68,0.1)", color: "#f87171" },
};

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [projects, setProjects] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAll(); }, [id]);

  async function fetchAll() {
    const [clientRes, projRes, invRes] = await Promise.all([
      supabase.from("clients").select("*").eq("id", id).single(),
      supabase.from("projects").select("*").eq("client_id", id).order("created_at", { ascending: false }),
      supabase.from("invoices").select("*").eq("client_id", id).order("created_at", { ascending: false }),
    ]);
    if (clientRes.data) setClient(clientRes.data);
    if (projRes.data) setProjects(projRes.data);
    if (invRes.data) setInvoices(invRes.data);
    setLoading(false);
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!client) return <div className="text-center py-20"><p className="text-sm" style={{ color: "#94a3b8" }}>Client not found.</p></div>;

  const sc = STATUS_COLORS[client.status] || STATUS_COLORS.prospect;
  const totalBilled = invoices.reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);
  const paidAmount = invoices.filter(i => i.status === "paid").reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);

  const summaryCards = [
    { label: "Projects", value: projects.length, icon: FolderKanban, gradient: "from-blue-500 to-blue-700" },
    { label: "Invoices", value: invoices.length, icon: FileText, gradient: "from-purple-500 to-purple-700" },
    { label: "Total Billed", value: `₹${totalBilled.toLocaleString()}`, icon: DollarSign, gradient: "from-emerald-500 to-emerald-700" },
    { label: "Paid", value: `₹${paidAmount.toLocaleString()}`, icon: DollarSign, gradient: "from-amber-500 to-orange-600" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate("/admin/clients")} className="p-2 rounded-lg transition-all hover:bg-white/10" style={{ color: "#94a3b8" }}><ArrowLeft size={20} /></button>
        <div className="flex-1 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
            {client.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{client.name}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold" style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>{client.status}</span>
              {client.company && <span className="flex items-center gap-1 text-sm" style={{ color: "#64748b" }}><Building2 size={13} />{client.company}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map(c => (
          <div key={c.label} className="rounded-2xl p-5" style={{ background: "#1e293b", border: "1px solid #334155" }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs" style={{ color: "#64748b" }}>{c.label}</p>
                <p className="text-xl font-bold text-white mt-1">{c.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.gradient} flex items-center justify-center`}>
                <c.icon size={18} className="text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Client Info Card */}
        <div className="rounded-2xl p-6 space-y-4" style={{ background: "#1e293b", border: "1px solid #334155" }}>
          <h2 className="text-sm font-semibold text-white flex items-center gap-2"><Users size={16} />Client Information</h2>
          <div className="space-y-3">
            {[
              { icon: Mail, label: "Email", value: client.email, href: `mailto:${client.email}` },
              { icon: Phone, label: "Phone", value: client.phone, href: `tel:${client.phone}` },
              { icon: Building2, label: "Company", value: client.company },
              { icon: MapPin, label: "City", value: client.city },
              { icon: Calendar, label: "Joined", value: client.created_at ? new Date(client.created_at).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" }) : null },
            ].map(item => item.value && (
              <div key={item.label} className="flex items-start gap-3">
                <item.icon size={15} className="mt-0.5 shrink-0" style={{ color: "#475569" }} />
                <div>
                  <p className="text-[11px] font-medium" style={{ color: "#475569" }}>{item.label}</p>
                  {item.href ? <a href={item.href} className="text-sm text-blue-400 hover:underline">{item.value}</a> : <p className="text-sm text-white">{item.value}</p>}
                </div>
              </div>
            ))}
          </div>
          {client.notes && (
            <div className="pt-3" style={{ borderTop: "1px solid #334155" }}>
              <p className="text-[11px] font-medium mb-1" style={{ color: "#475569" }}>Notes</p>
              <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "#94a3b8" }}>{client.notes}</p>
            </div>
          )}
        </div>

        {/* Linked Projects */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "#1e293b", border: "1px solid #334155" }}>
          <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid #334155" }}>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2"><FolderKanban size={16} />Projects</h2>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold" style={{ background: "rgba(59,130,246,0.1)", color: "#60a5fa" }}>{projects.length}</span>
            </div>
            <Link to="/admin/projects" state={{ newProj: true, clientId: client.id }} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors">
              <Plus size={14} /> New
            </Link>
          </div>
          {projects.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <FolderKanban size={28} className="mx-auto mb-2" style={{ color: "rgba(148,163,184,0.15)" }} />
              <p className="text-xs" style={{ color: "#475569" }}>No linked projects</p>
              <p className="text-[11px] mt-1" style={{ color: "#334155" }}>Assign projects via the project form</p>
            </div>
          ) : (
            <div>
              {projects.map(proj => (
                <Link to={`/admin/projects/${proj.id}`} key={proj.id} className="block px-6 py-3.5 transition-colors hover:bg-white/[0.02]" style={{ borderBottom: "1px solid #334155" }}>
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{proj.title}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(proj.tech_stack || []).slice(0, 3).map(t => <span key={t} className="px-1.5 py-0.5 rounded text-[10px]" style={{ background: "#111827", color: "#64748b" }}>{t}</span>)}
                      </div>
                    </div>
                    <ExternalLink size={14} style={{ color: "#475569" }} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Linked Invoices */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "#1e293b", border: "1px solid #334155" }}>
          <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid #334155" }}>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2"><FileText size={16} />Invoices</h2>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold" style={{ background: "rgba(168,85,247,0.1)", color: "#c084fc" }}>{invoices.length}</span>
            </div>
            <Link to="/admin/invoices/new" state={{ clientId: client.id }} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-colors">
              <Plus size={14} /> New
            </Link>
          </div>
          {invoices.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <FileText size={28} className="mx-auto mb-2" style={{ color: "rgba(148,163,184,0.15)" }} />
              <p className="text-xs" style={{ color: "#475569" }}>No invoices yet</p>
            </div>
          ) : (
            <div>
              {invoices.map(inv => {
                const is = INV_STATUS[inv.status] || INV_STATUS.draft;
                return (
                  <div key={inv.id} className="px-6 py-3.5 transition-colors hover:bg-white/[0.02]" style={{ borderBottom: "1px solid #334155" }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-white">{inv.invoice_number}</p>
                        <p className="text-xs mt-0.5" style={{ color: "#475569" }}>{inv.description || "—"}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-white">₹{Number(inv.amount).toLocaleString()}</p>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: is.bg, color: is.color }}>{inv.status}</span>
                      </div>
                    </div>
                    {inv.due_date && (
                      <div className="flex items-center gap-1 mt-1.5 text-[11px]" style={{ color: "#475569" }}>
                        <Clock size={11} />Due: {new Date(inv.due_date).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
