import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { X, Send, Copy, Check, Loader2 } from "lucide-react";
import { ROLE_COLORS } from "../../lib/permissions";

export default function InviteMemberModal({ open, onClose, onInvited, currentUserProfileId }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("viewer");
  const [sending, setSending] = useState(false);
  const [inviteLink, setInviteLink] = useState(null);
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setSending(true);

    try {
      // Generate a unique token
      const token = crypto.randomUUID() + "-" + Date.now().toString(36);
      const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(); // 48 hours

      const { error } = await supabase.from("team_invites").insert({
        email,
        role,
        invited_by: currentUserProfileId,
        token,
        expires_at: expiresAt,
      });

      if (error) throw error;

      const link = `${window.location.origin}/invite?token=${token}`;
      setInviteLink(link);
      if (onInvited) onInvited();
    } catch (err) {
      alert("Failed to send invite: " + err.message);
    } finally {
      setSending(false);
    }
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setEmail("");
    setRole("viewer");
    setInviteLink(null);
    setCopied(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative w-full max-w-md rounded-2xl p-6 shadow-2xl" style={{ background: "#1e293b", border: "1px solid #334155" }}>
        <button onClick={handleClose} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X size={20} /></button>

        <h2 className="text-lg font-bold text-white mb-1">Invite Team Member</h2>
        <p className="text-sm text-slate-400 mb-6">Send an invitation to join your admin panel.</p>

        {!inviteLink ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-slate-400">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="member@example.com"
                className="w-full px-4 py-3 rounded-xl text-sm bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-blue-500 placeholder-slate-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-slate-400">Role</label>
              <div className="grid grid-cols-3 gap-2">
                {["admin", "manager", "viewer"].map(r => {
                  const rc = ROLE_COLORS[r];
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`px-3 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all ${role === r ? "ring-2 ring-offset-1 ring-offset-slate-800" : "opacity-60 hover:opacity-100"}`}
                      style={{
                        background: rc.bg,
                        color: rc.color,
                        border: `1px solid ${rc.border}`,
                        ...(role === r ? { ringColor: rc.color } : {}),
                      }}
                    >
                      {r}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={sending}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-bold shadow-lg shadow-blue-500/25 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {sending ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
              {sending ? "Creating Invite..." : "Generate Invite Link"}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
              <p className="text-green-400 text-sm font-semibold mb-1">✓ Invite Created Successfully!</p>
              <p className="text-xs text-slate-400">Share this link with {email}. It expires in 48 hours.</p>
            </div>

            <div className="flex gap-2">
              <input
                readOnly
                value={inviteLink}
                className="flex-1 px-3 py-2.5 rounded-xl text-xs bg-slate-900 border border-slate-700 text-slate-300 focus:outline-none"
              />
              <button
                onClick={copyLink}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all ${copied ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30"}`}
                style={{ border: "1px solid" }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>

            <button onClick={handleClose} className="w-full py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors border border-slate-700">
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
