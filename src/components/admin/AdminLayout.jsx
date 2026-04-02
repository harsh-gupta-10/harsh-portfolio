import { NavLink, Outlet, useNavigate } from "react-router-dom";
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
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

const links = [
  { to: "/admin", icon: LayoutDashboard, label: "Dashboard", end: true },
          { to: "/admin/analytics", icon: BarChart2, label: "Analytics" },
          { to: "/admin/projects", icon: FolderKanban, label: "Projects" },
  { to: "/admin/tasks", icon: ListTodo, label: "Tasks" },
  { to: "/admin/messages", icon: MessageSquare, label: "Messages" },
  { to: "/admin/leads", icon: Target, label: "Leads" },
  { to: "/admin/clients", icon: Users, label: "Clients" },
  { to: "/admin/proposals", icon: FileSignature, label: "Proposals" },
  { to: "/admin/invoices", icon: Receipt, label: "Invoices" },
  { to: "/admin/expenses", icon: Wallet, label: "Expenses" },
  { to: "/admin/email-tracker", icon: Radar, label: "Email Tracking" },
];

export default function AdminLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

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
        <nav className="flex-1 py-4 px-3 space-y-1">
          {links.map((link) => (
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
          <p className="text-[11px]" style={{ color: "#64748b" }}>Admin Panel v1.0</p>
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
            <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg" style={{ background: "#1e293b", border: "1px solid #334155" }}>
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <User size={14} className="text-white" />
              </div>
              <span className="text-sm" style={{ color: "#94a3b8" }}>{user?.email}</span>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all hover:bg-red-500/10"
              style={{ color: "#94a3b8" }}
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </header>

        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
