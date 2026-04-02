import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { usePermissions } from "../../hooks/usePermissions";
import { Trash2, Mail, MessageSquare, Circle, CheckCircle2, Calendar, Target } from "lucide-react";

export default function Messages() {
  const { hasPermission } = usePermissions();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [converting, setConverting] = useState(false);

  useEffect(() => { fetchMessages(); }, []);

  async function fetchMessages() {
    const { data } = await supabase.from("messages").select("*").order("created_at", { ascending: false });
    if (data) setMessages(data);
    setLoading(false);
  }

  async function toggleRead(id, current) {
    await supabase.from("messages").update({ is_read: !current }).eq("id", id);
    setMessages(prev => prev.map(m => m.id === id ? { ...m, is_read: !current } : m));
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, is_read: !current } : null);
  }

  async function deleteMessage(id) {
    if (!window.confirm("Delete this message?")) return;
    await supabase.from("messages").delete().eq("id", id);
    setMessages(prev => prev.filter(m => m.id !== id));
    if (selected?.id === id) setSelected(null);
  }

  async function convertToLead(msg) {
    setConverting(true);
    const newLead = {
      contact_name: msg.name,
      email: msg.email,
      source: "Contact Form",
      status: "new",
      notes: [{ text: `Converted from Message:\n${msg.subject || "No Subject"}\n\n${msg.message}`, created_at: new Date().toISOString() }]
    };

    const { error: leadErr } = await supabase.from("leads").insert(newLead);
    if (leadErr) {
      alert("Failed to convert lead: " + leadErr.message);
      setConverting(false);
      return;
    }

    // Mark read
    await supabase.from("messages").update({ is_read: true }).eq("id", msg.id);
    setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, is_read: true } : m));
    setSelected(prev => ({ ...prev, is_read: true }));
    alert("Message successfully converted to a New Lead!");
    setConverting(false);
  }

  async function openMessage(msg) {
    setSelected(msg);
    if (!msg.is_read) {
      await supabase.from("messages").update({ is_read: true }).eq("id", msg.id);
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, is_read: true } : m));
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-white">Messages</h1><p className="text-sm mt-1" style={{ color: "#94a3b8" }}>Contact form submissions ({messages.filter(m => !m.is_read).length} unread)</p></div>

      {messages.length === 0 ? (
        <div className="rounded-2xl py-16 text-center" style={{ background: "#1e293b", border: "1px solid #334155" }}>
          <MessageSquare size={48} className="mx-auto mb-4" style={{ color: "rgba(148,163,184,0.3)" }} />
          <h3 className="text-lg font-semibold text-white mb-2">No messages yet</h3>
          <p className="text-sm" style={{ color: "#94a3b8" }}>Messages from your contact form will appear here</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 space-y-2">
            {messages.map(msg => (
              <button key={msg.id} onClick={() => openMessage(msg)} className="w-full text-left p-4 rounded-xl transition-all" style={{
                background: selected?.id === msg.id ? "rgba(59,130,246,0.1)" : "#1e293b",
                border: `1px solid ${selected?.id === msg.id ? "rgba(59,130,246,0.3)" : "#334155"}`,
                borderLeft: !msg.is_read ? "3px solid #3b82f6" : undefined,
              }}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {msg.is_read ? <CheckCircle2 size={14} style={{ color: "#94a3b8" }} /> : <Circle size={14} fill="#3b82f6" style={{ color: "#3b82f6" }} />}
                    <p className="text-sm truncate" style={{ color: msg.is_read ? "#94a3b8" : "#fff", fontWeight: msg.is_read ? 400 : 600 }}>{msg.name}</p>
                  </div>
                  <span className="text-[10px] shrink-0" style={{ color: "#94a3b8" }}>{new Date(msg.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-xs mt-1 truncate pl-[22px]" style={{ color: "#94a3b8" }}>{msg.subject || msg.message.slice(0, 60)}</p>
              </button>
            ))}
          </div>

          <div className="lg:col-span-3">
            {selected ? (
              <div className="rounded-2xl p-6 space-y-4 sticky top-24" style={{ background: "#1e293b", border: "1px solid #334155" }}>
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-white">{selected.subject || "No Subject"}</h2>
                    <div className="flex items-center gap-3 mt-1"><span className="text-sm" style={{ color: "#94a3b8" }}>From:</span><span className="text-sm text-white font-medium">{selected.name}</span></div>
                    <div className="flex items-center gap-2 mt-1"><Mail size={12} style={{ color: "#94a3b8" }} /><a href={`mailto:${selected.email}`} className="text-sm text-blue-400 hover:underline">{selected.email}</a></div>
                    <div className="flex items-center gap-2 mt-1"><Calendar size={12} style={{ color: "#94a3b8" }} /><span className="text-xs" style={{ color: "#94a3b8" }}>{new Date(selected.created_at).toLocaleString()}</span></div>
                  </div>
                  <div className="flex items-center gap-2">
                    {hasPermission("leads", "can_create") && <button onClick={() => convertToLead(selected)} disabled={converting} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 disabled:opacity-50"><Target size={14} />Convert to Lead</button>}
                    {hasPermission("messages", "can_edit") && <button onClick={() => toggleRead(selected.id, selected.is_read)} className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:bg-white/10" style={{ color: "#94a3b8" }}>{selected.is_read ? "Mark Unread" : "Mark Read"}</button>}
                    {hasPermission("messages", "can_delete") && <button onClick={() => deleteMessage(selected.id)} className="p-2 rounded-lg transition-all hover:bg-red-500/10" style={{ color: "#94a3b8" }}><Trash2 size={16} /></button>}
                  </div>
                </div>
                <hr style={{ borderColor: "#334155" }} />
                <div className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "#f1f5f9" }}>{selected.message}</div>
              </div>
            ) : (
              <div className="rounded-2xl py-24 text-center" style={{ background: "#1e293b", border: "1px solid #334155" }}>
                <Mail size={40} className="mx-auto mb-3" style={{ color: "rgba(148,163,184,0.2)" }} />
                <p className="text-sm" style={{ color: "#94a3b8" }}>Select a message to read</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
