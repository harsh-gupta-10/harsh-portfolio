import { useState, useEffect } from "react";
import { Routes, Route, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard, FolderKanban, Briefcase, Code2, User,
  Award, MessageSquare, Download, ArrowLeft, Lock, LogOut,
  ChevronRight, Layers,
} from "lucide-react";
import PADashboard from "./PADashboard";
import PAProjects from "./PAProjects";
import PAExperience from "./PAExperience";
import PASkills from "./PASkills";
import PAAbout from "./PAAbout";
import PACertificates from "./PACertificates";
import PAMessages from "./PAMessages";
import PABackup from "./PABackup";

const ADMIN_PIN = "5678";
const PIN_KEY = "pa_unlocked";

const NAV = [
  { to: "", icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "projects", icon: FolderKanban, label: "Projects" },
  { to: "experience", icon: Briefcase, label: "Experience" },
  { to: "skills", icon: Code2, label: "Skills" },
  { to: "about", icon: User, label: "About" },
  { to: "certificates", icon: Award, label: "Certificates" },
  { to: "messages", icon: MessageSquare, label: "Messages" },
  { to: "backup", icon: Download, label: "Backup & Restore" },
];

function PinLock({ onUnlock }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pin === ADMIN_PIN) {
      sessionStorage.setItem(PIN_KEY, "1");
      onUnlock();
    } else {
      setError(true);
      setShake(true);
      setPin("");
      setTimeout(() => { setError(false); setShake(false); }, 700);
    }
  };

  const append = (d) => setPin((p) => p.length < 6 ? p + d : p);
  const backspace = () => setPin((p) => p.slice(0, -1));

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)" }}>
      <div className="w-full max-w-sm mx-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-blue-500/30">
            <Lock size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Portfolio Admin</h1>
          <p className="text-slate-400 text-sm mt-1">Enter your PIN to continue</p>
        </div>

        {/* PIN dots */}
        <div className={`flex justify-center gap-3 mb-6 transition-transform ${shake ? "animate-[wiggle_0.3s_ease-in-out_2]" : ""}`}>
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                pin.length > i
                  ? error ? "bg-red-500 border-red-500" : "bg-blue-500 border-blue-500"
                  : "border-slate-600 bg-transparent"
              }`}
            />
          ))}
        </div>

        {error && (
          <p className="text-center text-red-400 text-sm mb-4 animate-pulse">Incorrect PIN</p>
        )}

        {/* Number pad */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[1,2,3,4,5,6,7,8,9].map((d) => (
            <button
              key={d}
              onClick={() => append(String(d))}
              className="h-14 rounded-2xl text-white text-lg font-semibold transition-all active:scale-95 hover:shadow-lg"
              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              {d}
            </button>
          ))}
          <button
            onClick={backspace}
            className="h-14 rounded-2xl text-slate-400 text-sm font-medium transition-all active:scale-95 hover:bg-white/5"
          >
            ✕
          </button>
          <button
            onClick={() => append("0")}
            className="h-14 rounded-2xl text-white text-lg font-semibold transition-all active:scale-95 hover:shadow-lg"
            style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            0
          </button>
          <button
            onClick={handleSubmit}
            className="h-14 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 text-white text-sm font-bold transition-all active:scale-95 hover:shadow-lg hover:shadow-blue-500/30"
          >
            Enter
          </button>
        </div>

        <form onSubmit={handleSubmit} className="hidden">
          <input type="password" value={pin} onChange={e => setPin(e.target.value)} />
        </form>

        <div className="text-center mt-6">
          <a href="/" className="text-slate-500 text-xs hover:text-slate-300 transition-colors flex items-center justify-center gap-1">
            <ArrowLeft size={12} /> Back to Portfolio
          </a>
        </div>
      </div>
    </div>
  );
}

export default function PortfolioAdminApp() {
  const [unlocked, setUnlocked] = useState(() => !!sessionStorage.getItem(PIN_KEY));
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    sessionStorage.removeItem(PIN_KEY);
    setUnlocked(false);
  };

  if (!unlocked) return <PinLock onUnlock={() => setUnlocked(true)} />;

  const base = "/portfolio-admin";

  return (
    <div className="min-h-screen flex" style={{ background: "#0f172a", color: "#f1f5f9" }}>
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-60 flex flex-col z-50" style={{ background: "#080f1d", borderRight: "1px solid #1e293b" }}>
        {/* Brand */}
        <div className="h-16 flex items-center gap-3 px-5" style={{ borderBottom: "1px solid #1e293b" }}>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Layers size={15} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-tight">Portfolio Admin</p>
            <p className="text-[10px] text-slate-500">Offline Content Manager</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
          {NAV.map((link) => {
            const fullTo = `${base}${link.to ? "/" + link.to : ""}`;
            const isActive = link.end
              ? location.pathname === base || location.pathname === base + "/"
              : location.pathname.startsWith(base + "/" + link.to);
            return (
              <NavLink
                key={link.to}
                to={fullTo}
                end={link.end}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? "bg-blue-600/20 text-blue-400"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <link.icon size={17} className={isActive ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300"} />
                <span className="flex-1">{link.label}</span>
                {isActive && <ChevronRight size={14} className="text-blue-400/60" />}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 pb-4 space-y-1" style={{ borderTop: "1px solid #1e293b", paddingTop: "12px" }}>
          <a
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <ArrowLeft size={17} className="text-slate-500" />
            View Portfolio
          </a>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut size={17} />
            Lock Admin
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 ml-60 min-h-screen">
        {/* Topbar */}
        <header
          className="sticky top-0 z-40 h-14 flex items-center px-8"
          style={{ background: "rgba(8,15,29,0.9)", backdropFilter: "blur(16px)", borderBottom: "1px solid #1e293b" }}
        >
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Portfolio Admin</span>
            <ChevronRight size={12} />
            <span className="text-slate-300">
              {NAV.find(n => n.to && location.pathname.includes(n.to))?.label || "Dashboard"}
            </span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-[10px] px-2 py-1 rounded-full text-emerald-400 font-mono" style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}>
              ● DEV MODE
            </span>
          </div>
        </header>

        <main className="p-8">
          <Routes>
            <Route index element={<PADashboard />} />
            <Route path="projects" element={<PAProjects />} />
            <Route path="experience" element={<PAExperience />} />
            <Route path="skills" element={<PASkills />} />
            <Route path="about" element={<PAAbout />} />
            <Route path="certificates" element={<PACertificates />} />
            <Route path="messages" element={<PAMessages />} />
            <Route path="backup" element={<PABackup />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
