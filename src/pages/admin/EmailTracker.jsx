import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import {
  Mail, Radar, Copy, Check, Eye, EyeOff, Search, Clock, Trash2, 
  BarChart, Activity, X, List, Link2, RefreshCcw
} from "lucide-react";

export default function EmailTracker() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [form, setForm] = useState({ recipient: "", subject: "" });
  const [generating, setGenerating] = useState(false);
  const [generatedHtml, setGeneratedHtml] = useState(null);
  const [generatedUrl, setGeneratedUrl] = useState(null);
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedRowId, setCopiedRowId] = useState(null);

  // Logs Modal
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Stats
  const [stats, setStats] = useState({ total: 0, opened: 0, unopened: 0, rate: 0 });

  useEffect(() => {
    fetchEmails();
    // Set up realtime subscription for opens
    const channel = supabase
      .channel('email_tracking_changes')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'email_tracking' }, payload => {
        setEmails(prev => prev.map(e => e.id === payload.new.id ? payload.new : e));
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'email_tracking' }, payload => {
        setEmails(prev => [payload.new, ...prev]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    const total = emails.length;
    const opened = emails.filter(e => e.opened).length;
    setStats({
      total,
      opened,
      unopened: total - opened,
      rate: total > 0 ? Math.round((opened / total) * 100) : 0
    });
  }, [emails]);

  async function fetchEmails() {
    const { data } = await supabase.from("email_tracking").select("*").order("created_at", { ascending: false });
    if (data) setEmails(data);
    setLoading(false);
  }

  async function handleGenerate(e) {
    e.preventDefault();
    if (!form.recipient.trim() || !form.subject.trim()) return;
    
    setGenerating(true);
    const trackingId = crypto.randomUUID();
    
    const { data, error } = await supabase.from("email_tracking").insert({
      tracking_id: trackingId,
      recipient_email: form.recipient.trim(),
      subject: form.subject.trim(),
    }).select().single();

    if (!error && data) {
      const baseUrl = import.meta.env.VITE_SUPABASE_URL;
      const pixelUrl = `${baseUrl}/functions/v1/track?id=${trackingId}`;
      const htmlSnippet = `<img src="${pixelUrl}" width="1" height="1" style="display:none; visibility:hidden;" alt="tracker" />`;
      setGeneratedHtml(htmlSnippet);
      setGeneratedUrl(pixelUrl);
      setForm({ recipient: "", subject: "" });
    }
    setGenerating(false);
  }

  function handleCopyHtml() {
    if (!generatedHtml) return;
    navigator.clipboard.writeText(generatedHtml);
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2000);
  }

  function handleCopyUrl() {
    if (!generatedUrl) return;
    navigator.clipboard.writeText(generatedUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  }

  async function handleDelete(id) {
    await supabase.from("email_tracking").delete().eq("id", id);
    setEmails(prev => prev.filter(e => e.id !== id));
  }

  async function handleMarkUnread(id) {
    await supabase.from("email_tracking").update({ opened: false }).eq("id", id);
    setEmails(prev => prev.map(e => e.id === id ? { ...e, opened: false } : e));
  }

  function handleCopyRowUrl(trackingId) {
    const baseUrl = import.meta.env.VITE_SUPABASE_URL;
    const pixelUrl = `${baseUrl}/functions/v1/track?id=${trackingId}`;
    navigator.clipboard.writeText(pixelUrl);
    setCopiedRowId(trackingId);
    setTimeout(() => setCopiedRowId(null), 2000);
  }

  async function viewLogs(email) {
    setSelectedEmail(email);
    setLoadingLogs(true);
    const { data } = await supabase
      .from("email_tracking_logs")
      .select("*")
      .eq("tracking_id", email.tracking_id)
      .order("opened_at", { ascending: false });
    setLogs(data || []);
    setLoadingLogs(false);
  }

  const filtered = emails
    .filter(e => filter === "all" || (filter === "opened" ? e.opened : !e.opened))
    .filter(e => {
      if (!search) return true;
      const s = search.toLowerCase();
      return (e.recipient_email || "").toLowerCase().includes(s) || (e.subject || "").toLowerCase().includes(s);
    });

  const inputStyle = { background: "#111827", border: "1px solid #334155", color: "#f1f5f9" };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Radar size={24} className="text-blue-500" /> Email Tracking</h1>
        <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>Monitor when your outward emails get read.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Sent", value: stats.total, icon: Mail, gradient: "from-blue-500 to-blue-700" },
          { label: "Opened", value: stats.opened, icon: Eye, gradient: "from-emerald-500 to-emerald-700" },
          { label: "Unopened", value: stats.unopened, icon: EyeOff, gradient: "from-slate-500 to-slate-700" },
          { label: "Open Rate", value: `${stats.rate}%`, icon: BarChart, gradient: "from-purple-500 to-purple-700" },
        ].map(c => (
          <div key={c.label} className="rounded-2xl p-5" style={{ background: "#1e293b", border: "1px solid #334155" }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs" style={{ color: "#64748b" }}>{c.label}</p>
                <p className="text-2xl font-bold text-white mt-1">{c.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.gradient} flex items-center justify-center`}><c.icon size={18} className="text-white" /></div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Generate Pixel UI */}
        <div className="rounded-2xl overflow-hidden self-start" style={{ background: "#1e293b", border: "1px solid #334155" }}>
          <div className="px-6 py-4" style={{ borderBottom: "1px solid #334155" }}>
            <h2 className="text-sm font-semibold text-white flex items-center gap-2"><Activity size={16} /> Generate Pixel</h2>
            <p className="text-xs mt-1" style={{ color: "#64748b" }}>Create a hidden pixel to embed in your email.</p>
          </div>
          
          <form onSubmit={handleGenerate} className="px-6 py-5 space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "#94a3b8" }}>Recipient Email</label>
              <input type="email" value={form.recipient} required onChange={e => setForm(p => ({ ...p, recipient: e.target.value }))} placeholder="client@example.com" className="w-full px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "#94a3b8" }}>Email Subject</label>
              <input type="text" value={form.subject} required onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} placeholder="Invoice #001 / Welcome" className="w-full px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" style={inputStyle} />
            </div>
            <button type="submit" disabled={generating} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity">
              <Radar size={16} /> {generating ? "Generating..." : "Generate Tracker"}
            </button>
          </form>

          {generatedHtml && (
            <div className="px-6 py-5" style={{ borderTop: "1px solid #334155", background: "#0f172a" }}>
              <p className="text-xs font-semibold mb-3 flex items-center justify-between" style={{ color: "#4ade80" }}>
                Pixel Generated Successfully!
              </p>
              
              <div className="space-y-3">
                {/* HTML Snippet */}
                <div>
                  <p className="text-[10px] font-semibold mb-1 uppercase tracking-wider" style={{ color: "#94a3b8" }}>HTML Tag (for emails)</p>
                  <div className="relative group">
                    <textarea readOnly value={generatedHtml} rows={3} className="w-full px-3 py-2 rounded-lg text-xs font-mono opacity-80 resize-none" style={{ background: "#111827", color: "#64748b", border: "1px solid #334155" }} />
                    <button onClick={handleCopyHtml} className="absolute top-2 right-2 p-1.5 rounded-md bg-[#1e293b] text-white hover:bg-blue-600 transition-colors shadow-lg">
                      {copiedHtml ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                {/* Raw URL */}
                <div>
                  <p className="text-[10px] font-semibold mb-1 uppercase tracking-wider" style={{ color: "#94a3b8" }}>Raw Image URL</p>
                  <div className="relative group">
                    <input readOnly value={generatedUrl} className="w-full px-3 py-2 rounded-lg text-xs font-mono opacity-80" style={{ background: "#111827", color: "#64748b", border: "1px solid #334155" }} />
                    <button onClick={handleCopyUrl} className="absolute top-1/2 -translate-y-1/2 right-2 p-1.5 rounded-md bg-[#1e293b] text-white hover:bg-blue-600 transition-colors shadow-lg">
                      {copiedUrl ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
              </div>

              <p className="text-[10px] mt-3 leading-relaxed" style={{ color: "#64748b" }}>
                Use the <strong>HTML Tag</strong> to paste directly into your email composer (Gmail/Apple Mail). 
                Use the <strong>Raw URL</strong> if your software has an "Insert Image by Link" feature.
              </p>
            </div>
          )}
        </div>

        {/* Tracking List */}
        <div className="lg:col-span-2 rounded-2xl overflow-hidden" style={{ background: "#1e293b", border: "1px solid #334155" }}>
          <div className="px-5 py-3.5 flex flex-wrap items-center justify-between gap-3" style={{ borderBottom: "1px solid #334155" }}>
            <div className="relative flex-1 min-w-[200px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#64748b" }} />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search recipient..." className="w-full pl-9 pr-3 py-1.5 rounded-lg text-xs focus:outline-none" style={inputStyle} />
            </div>
            <div className="flex bg-[#111827] rounded-lg p-1" style={{ border: "1px solid #334155" }}>
               {["all", "opened", "unopened"].map(f => (
                 <button key={f} onClick={() => setFilter(f)} className="px-3 py-1 rounded-md text-[11px] font-medium capitalize transition-colors" style={{ background: filter === f ? "#1e293b" : "transparent", color: filter === f ? "#fff" : "#64748b" }}>
                   {f}
                 </button>
               ))}
            </div>
          </div>

          <table className="w-full text-left">
            <thead>
              <tr style={{ borderBottom: "1px solid #334155" }}>
                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#64748b" }}>Recipient</th>
                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#64748b" }}>Status</th>
                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-center" style={{ color: "#64748b" }}>Opens</th>
                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-right" style={{ color: "#64748b" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={4} className="px-5 py-12 text-center text-sm" style={{ color: "#64748b" }}>No tracking records found.</td></tr>
              ) : filtered.map(email => (
                <tr key={email.id} className="transition-colors hover:bg-white/[0.02]" style={{ borderBottom: "1px solid #334155" }}>
                  <td className="px-5 py-4">
                    <p className="text-sm font-medium text-white">{email.recipient_email}</p>
                    <p className="text-xs truncate max-w-[200px] mt-0.5" style={{ color: "#94a3b8" }}>{email.subject}</p>
                    <div className="flex items-center gap-1 mt-1 text-[10px]" style={{ color: "#64748b" }}><Clock size={10} /> Created: {new Date(email.created_at).toLocaleDateString()}</div>
                  </td>
                  <td className="px-5 py-4">
                    {email.opened ? (
                      <div>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold" style={{ background: "rgba(34,197,94,0.1)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.2)" }}>
                          <Check size={10} /> OPENED
                        </span>
                        <p className="text-[10px] mt-1.5" style={{ color: "#94a3b8" }}>{new Date(email.opened_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({new Date(email.opened_at).toLocaleDateString()})</p>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold" style={{ background: "rgba(100,116,139,0.1)", color: "#64748b", border: "1px solid rgba(100,116,139,0.2)" }}>
                        <EyeOff size={10} /> UNREAD
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className="text-sm font-semibold inline-block min-w-[24px]" style={{ color: email.open_count > 0 ? "#fff" : "#475569" }}>{email.open_count}</span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => handleCopyRowUrl(email.tracking_id)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" title="Copy Pixel Link" style={{ color: "#94a3b8" }}>{copiedRowId === email.tracking_id ? <Check size={16} className="text-green-400" /> : <Link2 size={16} />}</button>
                      {email.opened && (
                        <>
                          <button onClick={() => handleMarkUnread(email.id)} className="p-1.5 rounded-lg hover:bg-orange-500/10 transition-colors" title="Mark Unread" style={{ color: "#f97316" }}><RefreshCcw size={16} /></button>
                          <button onClick={() => viewLogs(email)} className="p-1.5 rounded-lg hover:bg-blue-500/10 transition-colors" title="View Logs" style={{ color: "#60a5fa" }}><List size={16} /></button>
                        </>
                      )}
                      <button onClick={() => handleDelete(email.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors" title="Delete" style={{ color: "#64748b" }}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Logs Modal */}
      {selectedEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl" style={{ background: "#1e293b", border: "1px solid #334155" }}>
            <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid #334155" }}>
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">Open History</h3>
                <p className="text-xs" style={{ color: "#94a3b8" }}>{selectedEmail.recipient_email}</p>
              </div>
              <button onClick={() => setSelectedEmail(null)} className="p-2 rounded-xl hover:bg-white/5 transition-colors" style={{ color: "#94a3b8" }}><X size={20} /></button>
            </div>
            
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {loadingLogs ? (
                <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>
              ) : logs.length === 0 ? (
                <p className="text-center text-sm" style={{ color: "#64748b" }}>No detailed logs found for this email.</p>
              ) : (
                <div className="space-y-4">
                  {logs.map((log, i) => (
                    <div key={log.id} className="relative pl-6 pb-4" style={{ borderLeft: "2px solid #334155" }}>
                      <div className="absolute left-[-5px] top-1 w-2 h-2 rounded-full bg-blue-500 ring-4 ring-[#1e293b]" />
                      <div className="bg-[#0f172a] p-3 rounded-lg border border-[#334155]">
                        <p className="text-sm font-semibold text-white mb-1">
                          {new Date(log.opened_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                        </p>
                        {log.ip_address && (
                          <p className="text-xs" style={{ color: "#94a3b8" }}>IP: {log.ip_address}</p>
                        )}
                        {log.user_agent && (
                          <p className="text-xs mt-1 truncate" title={log.user_agent} style={{ color: "#64748b" }}>
                           {log.user_agent}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="px-6 py-4 bg-[#0f172a] text-right" style={{ borderTop: "1px solid #334155" }}>
              <button onClick={() => setSelectedEmail(null)} className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/5" style={{ color: "#e2e8f0" }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
