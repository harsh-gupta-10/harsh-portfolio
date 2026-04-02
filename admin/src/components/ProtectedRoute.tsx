import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--color-surface)]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
          <p className="text-[var(--color-text-muted)] text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
