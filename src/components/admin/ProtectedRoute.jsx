import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { PermissionsProvider } from "../../hooks/usePermissions";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: "#111827" }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <PermissionsProvider>
      {children}
    </PermissionsProvider>
  );
}
