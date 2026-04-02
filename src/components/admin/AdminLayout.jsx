import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  Zap,
  MessageSquare,
  Users,
  Shield,
  LogOut,
  User,
  ArrowLeft,
  Receipt,
  Radar,
  Target,
  FileSignature,
  Wallet,
  ListTodo,
  BarChart2,
  Settings as SettingsIcon,
  Lock,
  ChevronDown,
  ShieldAlert,
  ShieldCheck,
  Eye,
  StickyNote,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { usePermissions } from "../../hooks/usePermissions";
import { ROLE_COLORS } from "../../lib/permissions";
import QuickNote from "./notes/QuickNote";

// Each link maps to a permission module key
const links = [
  { to: "/admin", icon: LayoutDashboard, label: "Dashboard", end: true, module: "dashboard" },
  { to: "/admin/analytics", icon: BarChart2, label: "Analytics", module: "analytics" },
  { to: "/admin/projects", icon: FolderKanban, label: "Projects", module: "projects" },
  { to: "/admin/tasks", icon: ListTodo, label: "Tasks", module: "tasks" },
  { to: "/admin/messages", icon: MessageSquare, label: "Messages", module: "messages" },
  { to: "/admin/leads", icon: Target, label: "Leads", module: "leads" },
  { to: "/admin/clients", icon: Users, label: "Clients", module: "clients" },
  { to: "/admin/proposals", icon: FileSignature, label: "Proposals", module: "proposals" },
  { to: "/admin/invoices", icon: Receipt, label: "Invoices", module: "invoices" },
  { to: "/admin/expenses", icon: Wallet, label: "Expenses", module: "expenses" },
  { to: "/admin/notes", icon: StickyNote, label: "Notes & Whiteboard", module: "notes" },
  { to: "/admin/email-tracker", icon: Radar, label: "Email Tracking", module: "email_tracker" },
  { to: "/admin/settings", icon: SettingsIcon, label: "Settings", module: "settings" },
  { to: "/admin/team", icon: Shield, label: "Team", module: "team_settings" },
];

const ROLE_ICONS = { owner: ShieldAlert, admin: ShieldCheck, manager: Shield, viewer: Eye };

export default function AdminLayout() {
  const { user, signOut } = useAuth();
  const { profile, hasPermission, loading: permLoading, initialized } = usePermissions();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const rc = ROLE_COLORS[profile?.role] || ROLE_COLORS.viewer;
  const RoleIcon = ROLE_ICONS[profile?.role] || Eye;

  // Filter sidebar links based on permissions
  const visibleLinks = links.filter(link => {
    if (!initialized || permLoading) return true; // Show all while loading
    return hasPermission(link.module, "can_view");
  });

  return (
    <div className="min-h-screen flex" style={{ background: "#111827", color: "#f1f5f9" }}>
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 flex flex-col z-50" style={{ background: "#0f172a", borderRight: "1px solid #334155" }}>
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-6" style={{ borderBottom: "1px solid #334155" }}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
            <Shield size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white">Portfolio Admin</h1>
            <p className="text-[10px]" style={{ color: "#94a3b8" }}>Content Manager</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {visibleLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                    : "hover:bg-[#1e293b]"
                }`
              }
              style={({ isActive }) => ({
                color: isActive ? "#fff" : "#94a3b8",
              })}
            >
              <link.icon size={18} />
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Back to site */}
        <div className="px-3 pb-2">
          <a
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all hover:bg-[#1e293b]"
            style={{ color: "#94a3b8" }}
          >
            <ArrowLeft size={18} />
            Back to Site
          </a>
        </div>

        <div className="px-6 py-4" style={{ borderTop: "1px solid #334155" }}>
          <p className="text-[11px]" style={{ color: "#64748b" }}>Admin Panel v2.0</p>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 ml-64 flex flex-col min-w-0 bg-[#0f172a] min-h-screen">
        {/* Topbar */}
        <header
          className="sticky top-0 z-40 h-16 backdrop-blur-xl flex items-center justify-between px-8"
          style={{ background: "rgba(17,24,39,0.8)", borderBottom: "1px solid #334155" }}
        >
          <h2 className="text-lg font-semibold text-white">Welcome back 👋</h2>
          <div className="flex items-center gap-4">
            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-3 px-3 py-1.5 rounded-lg hover:bg-[#1e293b] transition-colors"
                style={{ border: "1px solid #334155" }}
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <User size={14} className="text-white" />
                  )}
                </div>
                <div className="text-left">
                  <span className="text-sm font-medium text-white block leading-tight">{profile?.full_name || user?.email}</span>
                  <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider" style={{ color: rc.color }}>
                    <RoleIcon size={10} /> {profile?.role || "user"}
                  </span>
                </div>
                <ChevronDown size={14} className={`text-slate-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-14 w-56 rounded-xl shadow-2xl py-1 z-50" style={{ background: "#1e293b", border: "1px solid #334155" }}>
                  <div className="px-4 py-3" style={{ borderBottom: "1px solid #334155" }}>
                    <p className="text-sm font-semibold text-white">{profile?.full_name || "User"}</p>
                    <p className="text-xs text-slate-400">{user?.email}</p>
                    <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase" style={{ background: rc.bg, color: rc.color, border: `1px solid ${rc.border}` }}>
                      <RoleIcon size={10} /> {profile?.role}
                    </span>
                  </div>
                  <button
                    onClick={() => { navigate("/admin/settings"); setDropdownOpen(false); }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                  >
                    <SettingsIcon size={14} /> Settings
                  </button>
                  {hasPermission("team_settings", "can_view") && (
                    <button
                      onClick={() => { navigate("/admin/team"); setDropdownOpen(false); }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                    >
                      <Shield size={14} /> Team Management
                    </button>
                  )}
                  <div style={{ borderTop: "1px solid #334155" }}>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut size={14} /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
      {/* Global Quick Note Float */}
      {initialized && profile && <QuickNote profileId={profile.id} />}
    </div>
  );
}
