import React from "react";
import { UserPlus, UserMinus, Info } from "lucide-react";

export default function LiveToast({ toasts }) {
  if (toasts.length === 0) return null;

  return (
    <div className="absolute bottom-6 left-6 z-[60] flex flex-col gap-2 max-w-xs transition-all animate-in fade-in slide-in-from-bottom-5">
      {toasts.map(t => (
        <div 
          key={t.id}
          className="flex items-center gap-3 bg-slate-900/90 backdrop-blur-md border border-slate-700/50 p-3 rounded-2xl shadow-2xl text-white text-xs animate-in slide-in-from-left-5 duration-300"
        >
          <div className={`p-1.5 rounded-lg ${
            t.type === 'join' ? 'bg-green-500/20 text-green-400' : 
            t.type === 'leave' ? 'bg-red-500/20 text-red-400' : 
            'bg-blue-500/20 text-blue-400'
          }`}>
            {t.type === 'join' && <UserPlus size={14} />}
            {t.type === 'leave' && <UserMinus size={14} />}
            {t.type === 'info' && <Info size={14} />}
          </div>
          <span className="font-medium">{t.msg}</span>
        </div>
      ))}
    </div>
  );
}
