import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Shield, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) {
      setError(error);
      setLoading(false);
    } else {
      navigate("/admin");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#111827" }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mb-4" style={{ boxShadow: "0 8px 32px rgba(59,130,246,0.3)" }}>
            <Shield size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
          <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>Sign in to manage your portfolio</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl p-8 space-y-5" style={{ background: "#1e293b", border: "1px solid #334155", boxShadow: "0 16px 48px rgba(0,0,0,0.3)" }}>
          {error && (
            <div className="px-4 py-3 rounded-lg text-sm" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }}>
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "#94a3b8" }}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@email.com"
              className="w-full px-4 py-3 rounded-xl text-sm text-white transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              style={{ background: "#111827", border: "1px solid #334155" }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "#94a3b8" }}>Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl text-sm text-white transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50 pr-12"
                style={{ background: "#111827", border: "1px solid #334155" }}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors" style={{ color: "#94a3b8" }}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold text-sm transition-all disabled:opacity-50"
            style={{ boxShadow: loading ? "none" : "0 4px 16px rgba(59,130,246,0.25)" }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Signing in...
              </span>
            ) : "Sign In"}
          </button>
        </form>

        <div className="text-center mt-6">
          <a href="/" className="text-sm transition-colors hover:text-blue-400" style={{ color: "#64748b" }}>
            ← Back to portfolio
          </a>
        </div>
      </div>
    </div>
  );
}
