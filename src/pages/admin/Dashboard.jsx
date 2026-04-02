import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { FolderKanban, FileText, MessageSquare, Star, TrendingUp, Clock } from "lucide-react";

export default function Dashboard() {
  const [stats, setStats] = useState({ activeLeads: 0, activeClients: 0, unreadMessages: 0, revenue: 0, pendingProposals: 0 });
  const [recentItems, setRecentItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchStats(); }, []);

  async function fetchStats() {
    try {
      const [leads, clients, messages, invoices] = await Promise.all([
        supabase.from("leads").select("id, status, business_name, created_at"),
        supabase.from("clients").select("id, status, name, created_at"),
        supabase.from("messages").select("id, is_read, created_at, name, subject"),
        supabase.from("invoices").select("id, total, status, invoice_number, created_at"),
      ]);
      const ll = leads.data || [], cl = clients.data || [], ml = messages.data || [], il = invoices.data || [];
      
      const totalRevenue = il.filter(i => i.status === "paid").reduce((sum, inv) => sum + (Number(inv.total) || 0), 0);
      const pendingProps = ll.filter(l => l.status === "proposal_sent").length;

      setStats({
        activeLeads: ll.filter(l => l.status !== "lost" && l.status !== "converted").length,
        activeClients: cl.length,
        unreadMessages: ml.filter(m => !m.is_read).length,
        revenue: totalRevenue,
        pendingProposals: pendingProps,
      });

      const recent = [
        ...ll.map(l => ({ id: l.id, type: "lead", title: l.business_name || l.contact_name || "Unknown Lead", created_at: l.created_at })),
        ...il.map(i => ({ id: i.id, type: "invoice", title: i.invoice_number, created_at: i.created_at })),
        ...ml.map(m => ({ id: m.id, type: "message", title: `${m.name}: ${m.subject || "No subject"}`, created_at: m.created_at })),
      ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 8);
      
      setRecentItems(recent);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  const cards = [
    { label: "Total Revenue", value: `₹${stats.revenue.toLocaleString()}`, icon: TrendingUp, color: "from-emerald-500 to-emerald-700", sub: "Paid invoices" },
    { label: "Active Clients", value: stats.activeClients, icon: Star, color: "from-blue-500 to-blue-700", sub: "Total managed clients" },
    { label: "Unread Messages", value: stats.unreadMessages, icon: MessageSquare, color: "from-amber-500 to-orange-600", sub: "Priority inbox" },
    { label: "Active Leads", value: stats.activeLeads, icon: FolderKanban, color: "from-purple-500 to-purple-700", sub: `${stats.pendingProposals} pending proposals` },
  ];

  const typeIcon = { lead: FolderKanban, invoice: FileText, message: MessageSquare };
  const typeColor = {
    lead: { color: "#60a5fa", background: "rgba(59,130,246,0.1)" },
    invoice: { color: "#c084fc", background: "rgba(168,85,247,0.1)" },
    message: { color: "#34d399", background: "rgba(16,185,129,0.1)" },
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-8">
      <div><h1 className="text-2xl font-bold text-white">Dashboard</h1><p className="text-sm mt-1" style={{ color: "#94a3b8" }}>Overview of your agency pipeline</p></div>

      {/* Quick Actions Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "New Lead", to: "/admin/leads", icon: FolderKanban, border: "rgba(59,130,246,0.3)", hover: "rgba(59,130,246,0.1)", text: "#60a5fa" },
          { label: "New Proposal", to: "/admin/proposals", icon: FileText, border: "rgba(168,85,247,0.3)", hover: "rgba(168,85,247,0.1)", text: "#c084fc" },
          { label: "New Invoice", to: "/admin/invoices/new", icon: TrendingUp, border: "rgba(16,185,129,0.3)", hover: "rgba(16,185,129,0.1)", text: "#34d399" },
          { label: "View Analytics", to: "/admin/analytics", icon: Star, border: "rgba(245,158,11,0.3)", hover: "rgba(245,158,11,0.1)", text: "#fbbf24" },
        ].map(btn => (
          <a key={btn.label} href={btn.to} className="flex items-center justify-center gap-2 py-3 rounded-xl transition-all font-semibold text-sm group" style={{ border: `1px solid ${btn.border}`, color: btn.text }}>
            <btn.icon size={16} className="group-hover:scale-110 transition-transform" />
            {btn.label}
          </a>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map(c => (
          <div key={c.label} className="rounded-2xl p-6 transition-all hover:border-blue-500/30" style={{ background: "#1e293b", border: "1px solid #334155" }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm" style={{ color: "#94a3b8" }}>{c.label}</p>
                <p className="text-3xl font-bold text-white mt-1">{c.value}</p>
                <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>{c.sub}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center shadow-lg`}>
                <c.icon size={20} className="text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl" style={{ background: "#1e293b", border: "1px solid #334155" }}>
        <div className="px-6 py-4 flex items-center gap-2" style={{ borderBottom: "1px solid #334155" }}>
          <TrendingUp size={18} className="text-blue-500" />
          <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
        </div>
        <div>
          {recentItems.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Clock size={40} className="mx-auto mb-3" style={{ color: "rgba(148,163,184,0.3)" }} />
              <p className="text-sm" style={{ color: "#94a3b8" }}>No activity yet. Start by adding projects or blogs!</p>
            </div>
          ) : recentItems.map(item => {
            const Icon = typeIcon[item.type];
            const c = typeColor[item.type];
            return (
              <div key={`${item.type}-${item.id}`} className="px-6 py-4 flex items-center gap-4 transition-colors hover:bg-white/[0.02]" style={{ borderBottom: "1px solid #334155" }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={c}><Icon size={16} /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{item.title}</p>
                  <p className="text-xs" style={{ color: "#94a3b8" }}>{item.type.charAt(0).toUpperCase() + item.type.slice(1)}</p>
                </div>
                <p className="text-xs shrink-0" style={{ color: "#94a3b8" }}>{new Date(item.created_at).toLocaleDateString()}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
