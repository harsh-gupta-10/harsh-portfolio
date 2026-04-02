import { useNavigate } from "react-router-dom";
import { ShieldX } from "lucide-react";

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <div className="w-20 h-20 rounded-2xl bg-red-500/10 flex items-center justify-center mb-6">
        <ShieldX size={40} className="text-red-400" />
      </div>
      <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
      <p className="text-sm text-slate-400 max-w-md mb-8">
        You don't have permission to access this page. Contact the admin to request access.
      </p>
      <button
        onClick={() => navigate("/admin")}
        className="px-6 py-2.5 rounded-xl text-sm font-medium text-slate-300 border border-slate-700 hover:bg-slate-800 transition-colors"
      >
        Back to Dashboard
      </button>
    </div>
  );
}
