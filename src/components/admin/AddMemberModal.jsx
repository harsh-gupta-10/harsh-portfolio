import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { X, UserPlus, Copy, Check, Loader2, Key } from "lucide-react";
import { ROLE_COLORS, getPresetPermissions, MODULES } from "../../lib/permissions";
import { createClient } from "@supabase/supabase-js";

export default function AddMemberModal({ open, onClose, onAdded }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("manager");
  // Default generated password
  const [password, setPassword] = useState(() => Math.random().toString(36).slice(-8));

  const [creating, setCreating] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !name || !password) return;
    setCreating(true);

    try {
      // 1. Initialize a detached client to prevent resetting the admin's session!
      // DO NOT USE the main supabase client for signUp, it will log the admin out!
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      const detachedClient = createClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        }
      });

      const { data: authData, error: signupErr } = await detachedClient.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name
          }
        }
      });

      if (signupErr) throw signupErr;

      const userId = authData.user?.id;
      if (!userId) throw new Error("Failed to create user account.");

      if (authData.user?.identities?.length === 0) {
          throw new Error("A user with this email already exists in the system.");
      }

      // At this point, `auth.users` row is created. 
      // The Postgres Trigger `handle_new_user` will have fired, creating a profile with role 'manager'.
      
      // 2. Update the profile with the CORRECT role using our main authenticated client
      const { error: profileErr } = await supabase.from("profiles").update({
        full_name: name,
        role: role,
        is_active: true
      }).eq('id', userId);

      if (profileErr) throw profileErr;

      // 3. Setup default granular permissions
      const preset = getPresetPermissions(role);
      const permRows = MODULES.map(m => ({
        profile_id: userId,
        module: m.key,
        can_view: preset[m.key]?.can_view || false,
        can_create: preset[m.key]?.can_create || false,
        can_edit: preset[m.key]?.can_edit || false,
        can_delete: preset[m.key]?.can_delete || false,
      }));

      // Delete existing just in case
      await supabase.from("permissions").delete().eq("profile_id", userId);
      const { error: permErr } = await supabase.from("permissions").insert(permRows);
      
      if (permErr) throw permErr;

      setSuccessData({ email, password, name });
      if (onAdded) onAdded();
    } catch (err) {
      alert("Failed to create user: " + err.message);
    } finally {
      setCreating(false);
    }
  };

  const copyCredentials = async () => {
    if (!successData) return;
    const text = `Hey ${successData.name},\nHere are your login credentials for the Admin panel:\n\nURL: ${window.location.origin}/admin/login\nEmail: ${successData.email}\nPassword: ${successData.password}\n\nPlease change your password after logging in.`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setEmail("");
    setName("");
    setRole("manager");
    setPassword(Math.random().toString(36).slice(-8));
    setSuccessData(null);
    setCopied(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
      
      <div className="relative bg-slate-900 border border-slate-700/50 p-6 md:p-8 rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95">
        <button onClick={handleClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold text-white mb-6">
          {successData ? "User Created!" : "Add New User Directly"}
        </h2>

        {successData ? (
          <div className="space-y-6">
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
              <p className="text-sm text-slate-400 mb-4 whitespace-pre-line">
                The account has been created. 
                Copy the secure message below and send it to the user so they can log in.
              </p>
              
              <div className="bg-slate-900 p-3 rounded-lg text-xs font-mono text-slate-300 select-all border border-slate-700/50 flex flex-col gap-1">
                <span>Hey {successData.name},</span>
                <span>Here are your login credentials:</span>
                <span className="mt-2 text-blue-400">URL: <span className="text-slate-300">{window.location.origin}/admin/login</span></span>
                <span className="text-blue-400">Email: <span className="text-slate-300">{successData.email}</span></span>
                <span className="text-blue-400">Password: <span className="text-slate-300">{successData.password}</span></span>
              </div>
            </div>

            <button
              onClick={copyCredentials}
              className={`w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                copied ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40"
              }`}
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
              {copied ? "Copied to Clipboard!" : "Copy Details"}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Member Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="team@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Temporary Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Key size={16} />
                </div>
                <input
                    type="text"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl pl-10 px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors font-mono"
                    placeholder="password"
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1.5 ml-1">You may let them log in using this, then ask them to reset it.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Role Initial Preset</label>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(ROLE_COLORS)
                  .filter(([r]) => r !== "owner")
                  .map(([r, c]) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`py-3 px-2 rounded-xl text-xs font-bold uppercase transition-all capitalize border ${
                      role === r 
                        ? "" 
                        : "bg-slate-800 text-slate-400 border-transparent hover:bg-slate-700"
                    }`}
                    style={role === r ? { background: c.bg, color: c.color, borderColor: c.color } : {}}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-2">
                They will be securely inserted into the CRM instantly, so they don't have to go through an email flow.
              </p>
            </div>

            <button
              type="submit"
              disabled={creating || !email || !password || !name}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all mt-4 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40"
            >
              {creating ? <Loader2 size={18} className="animate-spin" /> : <UserPlus size={18} />}
              {creating ? "Creating..." : "Create Account"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
