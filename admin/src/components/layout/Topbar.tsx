import { LogOut, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export function Topbar() {
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-40 h-16 bg-[var(--color-surface)]/80 backdrop-blur-xl border-b border-[var(--color-border)] flex items-center justify-between px-8">
      <div>
        <h2 className="text-lg font-semibold text-white">
          Welcome back 👋
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-[var(--color-card)] border border-[var(--color-border)]">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <User size={14} className="text-white" />
          </div>
          <span className="text-sm text-[var(--color-text-muted)]">
            {user?.email}
          </span>
        </div>

        <button
          onClick={signOut}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[var(--color-text-muted)] hover:text-[var(--color-danger)] hover:bg-red-500/10 transition-all"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </header>
  );
}
