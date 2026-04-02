import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  Zap,
  MessageSquare,
  Shield,
} from "lucide-react";

const links = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/projects", icon: FolderKanban, label: "Projects" },
  { to: "/blogs", icon: FileText, label: "Blogs" },
  { to: "/skills", icon: Zap, label: "Skills" },
  { to: "/messages", icon: MessageSquare, label: "Messages" },
];

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-[var(--color-sidebar)] border-r border-[var(--color-border)] flex flex-col z-50">
      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-6 border-b border-[var(--color-border)]">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
          <Shield size={16} className="text-white" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-white">Portfolio Admin</h1>
          <p className="text-[10px] text-[var(--color-text-muted)]">Content Manager</p>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
              ${
                isActive
                  ? "bg-[var(--color-primary)] text-white shadow-lg shadow-blue-500/20"
                  : "text-[var(--color-text-muted)] hover:text-white hover:bg-[var(--color-sidebar-hover)]"
              }`
            }
          >
            <link.icon size={18} />
            {link.label}
          </NavLink>
        ))}
      </nav>

      {/* Version */}
      <div className="px-6 py-4 border-t border-[var(--color-border)]">
        <p className="text-[11px] text-[var(--color-text-muted)]">
          Admin Panel v1.0
        </p>
      </div>
    </aside>
  );
}
