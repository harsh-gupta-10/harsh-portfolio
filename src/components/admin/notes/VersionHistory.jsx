import { X, Clock, RotateCcw } from "lucide-react";
import { format } from "date-fns";

export default function VersionHistory({ open, onClose, versions, onRestore }) {
  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-96 bg-slate-900 border-l border-slate-800 z-50 flex flex-col shadow-2xl transform transition-transform duration-300">
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock size={18} className="text-blue-400" />
            Version History
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {versions.length === 0 ? (
            <p className="text-sm text-slate-500 text-center mt-10">No previous versions saved yet.</p>
          ) : (
            versions.map((ver, idx) => (
              <div key={ver.id} className="relative pl-6 pb-4 border-l border-slate-800 last:border-transparent">
                <div className="absolute left-[-5px] top-1 w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-slate-900" />
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-300">
                      {format(new Date(ver.saved_at), "MMM d, yyyy")}
                    </span>
                    <span className="text-xs text-slate-500">
                      {format(new Date(ver.saved_at), "h:mm a")}
                    </span>
                  </div>
                  
                  {idx === 0 && <span className="inline-block px-2 py-0.5 rounded text-[10px] bg-green-500/10 text-green-400 mb-3 border border-green-500/20">Current Version</span>}
                  
                  <button 
                    onClick={() => onRestore(ver.content)}
                    disabled={idx === 0}
                    className="w-full flex items-center justify-center gap-2 py-2 bg-slate-800 hover:bg-blue-600 border border-slate-700 hover:border-blue-500 text-slate-300 hover:text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RotateCcw size={14} />
                    {idx === 0 ? "Current" : "Restore Version"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
