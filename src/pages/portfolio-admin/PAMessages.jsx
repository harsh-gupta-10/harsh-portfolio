import { useEffect, useState } from "react";
import { Mail, Trash2, Circle, CheckCircle2, Calendar, RefreshCw, AlertTriangle, X } from "lucide-react";
import { supabase } from "../../lib/supabase";

export default function PAMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("all"); // all | unread | read
  const [deleteConfirm, setDeleteConfirm] = useState(null); // id to confirm delete
  const [deleting, setDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchMessages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) setErrorMsg("Failed to load messages: " + error.message);
    if (data) setMessages(data);
    setLoading(false);
  };

  useEffect(() => { fetchMessages(); }, []);

  const openMessage = async (msg) => {
    setSelected(msg);
    setDeleteConfirm(null);
    if (!msg.is_read) {
      await supabase.from("messages").update({ is_read: true }).eq("id", msg.id);
      setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, is_read: true } : m));
    }
  };

  const toggleRead = async (id, current) => {
    const { error } = await supabase.from("messages").update({ is_read: !current }).eq("id", id);
    if (error) { setErrorMsg("Failed to update: " + error.message); return; }
    setMessages((prev) => prev.map((m) => m.id === id ? { ...m, is_read: !current } : m));
    if (selected?.id === id) setSelected((p) => p ? { ...p, is_read: !current } : null);
  };

  const confirmDelete = (id) => {
    setDeleteConfirm(id);
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  const executeDelete = async (id) => {
    setDeleting(true);
    setErrorMsg("");
    const { error } = await supabase.from("messages").delete().eq("id", id);
    if (error) {
      setErrorMsg("Delete failed: " + error.message);
      setDeleting(false);
      setDeleteConfirm(null);
      return;
    }
    setMessages((prev) => prev.filter((m) => m.id !== id));
    if (selected?.id === id) setSelected(null);
    setDeleteConfirm(null);
    setDeleting(false);
  };

  const filtered = messages.filter((m) => {
    if (filter === "unread") return !m.is_read;
    if (filter === "read") return m.is_read;
    return true;
  });

  const unreadCount = messages.filter((m) => !m.is_read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Messages</h1>
          <p className="text-sm text-slate-400 mt-1">
            Contact form submissions · {messages.length} total ·
            <span className={`ml-1 font-medium ${unreadCount > 0 ? "text-blue-400" : "text-slate-500"}`}>
              {unreadCount} unread
            </span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Filter tabs */}
          <div className="flex rounded-xl overflow-hidden text-xs font-semibold" style={{ border: "1px solid #334155" }}>
            {["all", "unread", "read"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="px-3 py-2 capitalize transition-colors"
                style={{
                  background: filter === f ? "rgba(59,130,246,0.15)" : "transparent",
                  color: filter === f ? "#60a5fa" : "#64748b",
                }}
              >
                {f}
              </button>
            ))}
          </div>
          <button onClick={fetchMessages} disabled={loading} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all disabled:opacity-50">
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Error banner */}
      {errorMsg && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-300" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
          <AlertTriangle size={15} className="text-red-400 shrink-0" />
          <span className="flex-1">{errorMsg}</span>
          <button onClick={() => setErrorMsg("")} className="text-red-400 hover:text-red-300"><X size={14} /></button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl py-20 text-center" style={{ background: "#1e293b", border: "1px solid #334155" }}>
          <Mail size={40} className="mx-auto mb-3 text-slate-600" />
          <p className="text-slate-400">{filter === "all" ? "No messages yet" : `No ${filter} messages`}</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Message list */}
          <div className="lg:col-span-2 space-y-2">
            {filtered.map((msg) => (
              <div key={msg.id} className="relative group">
                {/* Delete confirmation overlay */}
                {deleteConfirm === msg.id ? (
                  <div
                    className="flex items-center justify-between p-4 rounded-xl"
                    style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)" }}
                  >
                    <span className="text-sm text-red-300">Delete this message?</span>
                    <div className="flex gap-2">
                      <button
                        onClick={cancelDelete}
                        className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => executeDelete(msg.id)}
                        disabled={deleting}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-red-600 hover:bg-red-500 transition-all disabled:opacity-50"
                      >
                        {deleting ? "Deleting…" : "Yes, Delete"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-stretch gap-0">
                    <button
                      onClick={() => openMessage(msg)}
                      className="flex-1 text-left p-4 rounded-l-xl transition-all"
                      style={{
                        background: selected?.id === msg.id ? "rgba(59,130,246,0.1)" : "#1e293b",
                        border: `1px solid ${selected?.id === msg.id ? "rgba(59,130,246,0.3)" : msg.is_read ? "#334155" : "rgba(59,130,246,0.25)"}`,
                        borderRight: "none",
                        borderLeft: !msg.is_read ? "3px solid #3b82f6" : undefined,
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          {msg.is_read
                            ? <CheckCircle2 size={13} className="text-slate-600 shrink-0" />
                            : <Circle size={13} className="text-blue-400 shrink-0" fill="currentColor" />}
                          <span className="text-sm truncate" style={{ color: msg.is_read ? "#94a3b8" : "#fff", fontWeight: msg.is_read ? 400 : 600 }}>
                            {msg.name}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 shrink-0">{new Date(msg.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs mt-1 truncate pl-[21px] text-slate-500">{msg.subject || msg.message}</p>
                    </button>
                    {/* Delete button on list item */}
                    <button
                      onClick={(e) => { e.stopPropagation(); confirmDelete(msg.id); }}
                      className="px-3 rounded-r-xl text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all flex items-center"
                      style={{
                        background: selected?.id === msg.id ? "rgba(59,130,246,0.07)" : "#1e293b",
                        border: `1px solid ${selected?.id === msg.id ? "rgba(59,130,246,0.3)" : msg.is_read ? "#334155" : "rgba(59,130,246,0.25)"}`,
                        borderLeft: "1px solid #334155",
                      }}
                      title="Delete message"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Message detail */}
          <div className="lg:col-span-3">
            {selected ? (
              <div className="rounded-2xl p-6 space-y-4 sticky top-24" style={{ background: "#1e293b", border: "1px solid #334155" }}>
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-white">{selected.subject || "No Subject"}</h2>
                    <div className="flex items-center gap-2 mt-1 text-sm text-slate-400">
                      <span>From:</span><span className="text-white font-medium">{selected.name}</span>
                    </div>
                    <a href={`mailto:${selected.email}`} className="text-sm text-blue-400 hover:underline flex items-center gap-1 mt-0.5">
                      <Mail size={12} />{selected.email}
                    </a>
                    <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
                      <Calendar size={11} />
                      {new Date(selected.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleRead(selected.id, selected.is_read)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-white/10 transition-all border border-slate-700"
                    >
                      {selected.is_read ? "Mark Unread" : "Mark Read"}
                    </button>
                    {deleteConfirm === selected.id ? (
                      <div className="flex items-center gap-2">
                        <button onClick={cancelDelete} className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:bg-white/10 transition-all border border-slate-700">Cancel</button>
                        <button
                          onClick={() => executeDelete(selected.id)}
                          disabled={deleting}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-red-600 hover:bg-red-500 transition-all disabled:opacity-50"
                        >
                          {deleting ? "Deleting…" : "Confirm Delete"}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => confirmDelete(selected.id)}
                        className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                        title="Delete message"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
                <hr style={{ borderColor: "#334155" }} />
                <p className="text-sm leading-relaxed whitespace-pre-wrap text-slate-200">{selected.message}</p>
                <a
                  href={`mailto:${selected.email}?subject=Re: ${selected.subject || ""}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-blue-400 border border-blue-500/30 hover:bg-blue-500/10 transition-all"
                >
                  <Mail size={15} /> Reply via Email
                </a>
              </div>
            ) : (
              <div className="rounded-2xl py-24 text-center" style={{ background: "#1e293b", border: "1px solid #334155" }}>
                <Mail size={36} className="mx-auto mb-3 text-slate-700" />
                <p className="text-sm text-slate-500">Select a message to read</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
