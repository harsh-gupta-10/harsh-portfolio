import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Trash2,
  Mail,
  MessageSquare,
  Circle,
  CheckCircle2,
  Calendar,
} from "lucide-react";

interface Contact {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function Messages() {
  const [messages, setMessages] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Contact | null>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  async function fetchMessages() {
    const { data } = await supabase
      .from("contacts")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setMessages(data);
    setLoading(false);
  }

  async function toggleRead(id: string, current: boolean) {
    await supabase.from("contacts").update({ is_read: !current }).eq("id", id);
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, is_read: !current } : m))
    );
    if (selected?.id === id) {
      setSelected((prev) => (prev ? { ...prev, is_read: !current } : null));
    }
  }

  async function deleteMessage(id: string) {
    if (!confirm("Delete this message?")) return;
    await supabase.from("contacts").delete().eq("id", id);
    setMessages((prev) => prev.filter((m) => m.id !== id));
    if (selected?.id === id) setSelected(null);
  }

  async function openMessage(msg: Contact) {
    setSelected(msg);
    if (!msg.is_read) {
      await supabase.from("contacts").update({ is_read: true }).eq("id", msg.id);
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, is_read: true } : m))
      );
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Messages</h1>
        <p className="text-[var(--color-text-muted)] text-sm mt-1">
          Contact form submissions ({messages.filter((m) => !m.is_read).length}{" "}
          unread)
        </p>
      </div>

      {messages.length === 0 ? (
        <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl py-16 text-center">
          <MessageSquare
            size={48}
            className="mx-auto text-[var(--color-text-muted)]/30 mb-4"
          />
          <h3 className="text-lg font-semibold text-white mb-2">
            No messages yet
          </h3>
          <p className="text-[var(--color-text-muted)] text-sm">
            Messages from your contact form will appear here
          </p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Message List */}
          <div className="lg:col-span-2 space-y-2">
            {messages.map((msg) => (
              <button
                key={msg.id}
                onClick={() => openMessage(msg)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  selected?.id === msg.id
                    ? "bg-[var(--color-primary)]/10 border-[var(--color-primary)]/30"
                    : "bg-[var(--color-card)] border-[var(--color-border)] hover:border-blue-500/20"
                } ${!msg.is_read ? "border-l-2 border-l-blue-500" : ""}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {msg.is_read ? (
                      <CheckCircle2
                        size={14}
                        className="text-[var(--color-text-muted)] shrink-0"
                      />
                    ) : (
                      <Circle
                        size={14}
                        fill="var(--color-primary)"
                        className="text-[var(--color-primary)] shrink-0"
                      />
                    )}
                    <p
                      className={`text-sm truncate ${
                        msg.is_read
                          ? "text-[var(--color-text-muted)]"
                          : "text-white font-semibold"
                      }`}
                    >
                      {msg.name}
                    </p>
                  </div>
                  <span className="text-[10px] text-[var(--color-text-muted)] shrink-0">
                    {new Date(msg.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-[var(--color-text-muted)] mt-1 truncate pl-[22px]">
                  {msg.subject || msg.message.slice(0, 60)}
                </p>
              </button>
            ))}
          </div>

          {/* Message Detail */}
          <div className="lg:col-span-3">
            {selected ? (
              <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl p-6 space-y-4 sticky top-24">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-white">
                      {selected.subject || "No Subject"}
                    </h2>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm text-[var(--color-text-muted)]">
                        From:
                      </span>
                      <span className="text-sm text-white font-medium">
                        {selected.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Mail size={12} className="text-[var(--color-text-muted)]" />
                      <a
                        href={`mailto:${selected.email}`}
                        className="text-sm text-blue-400 hover:underline"
                      >
                        {selected.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar
                        size={12}
                        className="text-[var(--color-text-muted)]"
                      />
                      <span className="text-xs text-[var(--color-text-muted)]">
                        {new Date(selected.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        toggleRead(selected.id, selected.is_read)
                      }
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--color-text-muted)] hover:text-white bg-white/5 hover:bg-white/10 transition-all"
                    >
                      {selected.is_read
                        ? "Mark Unread"
                        : "Mark Read"}
                    </button>
                    <button
                      onClick={() => deleteMessage(selected.id)}
                      className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-danger)] hover:bg-red-500/10 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <hr className="border-[var(--color-border)]" />

                <div className="text-sm text-[var(--color-text)] leading-relaxed whitespace-pre-wrap">
                  {selected.message}
                </div>
              </div>
            ) : (
              <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl py-24 text-center">
                <Mail
                  size={40}
                  className="mx-auto text-[var(--color-text-muted)]/20 mb-3"
                />
                <p className="text-[var(--color-text-muted)] text-sm">
                  Select a message to read
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
