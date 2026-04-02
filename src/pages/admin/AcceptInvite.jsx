import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { getPresetPermissions, MODULES, ROLE_COLORS } from "../../lib/permissions";
import { Shield, Loader2, CheckCircle2, XCircle } from "lucide-react";

export default function AcceptInvite() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [invite, setInvite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({ name: "", password: "", confirmPassword: "" });

  useEffect(() => {
    if (token) validateToken();
    else setError("No invite token provided.");
  }, [token]);

  async function validateToken() {
    setLoading(true);
    const { data, error: fetchErr } = await supabase
      .from("team_invites")
      .select("*")
      .eq("token", token)
      .maybeSingle();

    if (fetchErr || !data) {
      setError("Invalid invite link.");
    } else if (data.accepted) {
      setError("This invite has already been accepted.");
    } else if (new Date(data.expires_at) < new Date()) {
      setError("This invite has expired. Please ask the admin for a new one.");
    } else {
      setInvite(data);
    }
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    if (form.password.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    setSubmitting(true);
    try {
      // 1. Create auth user
      const { data: authData, error: signupErr } = await supabase.auth.signUp({
        email: invite.email,
        password: form.password,
      });
      if (signupErr) throw signupErr;

      const userId = authData.user?.id;
      if (!userId) throw new Error("Failed to create user account.");

      // 2. Create profile
      const { error: profileErr } = await supabase.from("profiles").insert({
        id: userId,
        full_name: form.name,
        email: invite.email,
        role: invite.role,
        is_active: true,
      });
      if (profileErr) throw profileErr;

      // 3. Insert default permissions based on role
      const preset = getPresetPermissions(invite.role);
      const permRows = MODULES.map(m => ({
        profile_id: userId,
        module: m.key,
        can_view: preset[m.key]?.can_view || false,
        can_create: preset[m.key]?.can_create || false,
        can_edit: preset[m.key]?.can_edit || false,
        can_delete: preset[m.key]?.can_delete || false,
      }));

      const { error: permErr } = await supabase.from("permissions").insert(permRows);
      if (permErr) throw permErr;

      // 4. Mark invite as accepted
      await supabase.from("team_invites").update({ accepted: true }).eq("id", invite.id);

      setSuccess(true);
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0f172a" }}>
        <Loader2 className="animate-spin text-blue-500" size={40} />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0f172a" }}>
        <div className="max-w-md w-full p-8 rounded-2xl text-center" style={{ background: "#1e293b", border: "1px solid #334155" }}>
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <XCircle size={32} className="text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Invite Error</h2>
          <p className="text-sm text-slate-400 mb-6">{error}</p>
          <a href="/" className="inline-block px-6 py-2.5 rounded-xl text-sm font-medium text-slate-300 border border-slate-700 hover:bg-slate-800 transition-colors">
            Go to Homepage
          </a>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0f172a" }}>
        <div className="max-w-md w-full p-8 rounded-2xl text-center" style={{ background: "#1e293b", border: "1px solid #334155" }}>
          <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} className="text-green-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Welcome to the Team!</h2>
          <p className="text-sm text-slate-400 mb-6">Your account has been created. You can now log in to the admin panel.</p>
          <button
            onClick={() => navigate("/login")}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-bold shadow-lg shadow-blue-500/25 hover:opacity-90 transition-opacity"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Invite form
  const rc = ROLE_COLORS[invite.role] || ROLE_COLORS.viewer;

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#0f172a" }}>
      <div className="max-w-md w-full p-8 rounded-2xl shadow-2xl" style={{ background: "#1e293b", border: "1px solid #334155" }}>
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mx-auto mb-4">
            <Shield size={28} className="text-white" />
          </div>
          <h2 className="text-xl font-bold text-white mb-1">You've Been Invited!</h2>
          <p className="text-sm text-slate-400">Join the admin panel as a team member.</p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl" style={{ background: rc.bg, border: `1px solid ${rc.border}` }}>
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: rc.color }}>Role: {invite.role}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-slate-400">Email</label>
            <input
              readOnly
              value={invite.email}
              className="w-full px-4 py-3 rounded-xl text-sm bg-slate-900/50 border border-slate-700 text-slate-400"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-slate-400">Your Name</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              required
              placeholder="John Doe"
              className="w-full px-4 py-3 rounded-xl text-sm bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-blue-500 placeholder-slate-600"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-slate-400">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              required
              minLength={6}
              placeholder="Min 6 characters"
              className="w-full px-4 py-3 rounded-xl text-sm bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-blue-500 placeholder-slate-600"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-slate-400">Confirm Password</label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
              required
              placeholder="Repeat password"
              className="w-full px-4 py-3 rounded-xl text-sm bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-blue-500 placeholder-slate-600"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-bold shadow-lg shadow-blue-500/25 hover:opacity-90 transition-opacity disabled:opacity-50 mt-6"
          >
            {submitting ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
            {submitting ? "Creating Account..." : "Accept & Join Team"}
          </button>
        </form>
      </div>
    </div>
  );
}
