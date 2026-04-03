import React from "react";

export default function OnlineUsers({ users, currentUserId }) {
  const displayUsers = users.slice(0, 5);
  const extraCount = users.length - 5;

  return (
    <div className="flex items-center -space-x-2">
      {displayUsers.map((u, i) => (
        <div 
          key={u.userId || i}
          className="relative group shrink-0"
          title={`${u.userName} • ${u.userId === currentUserId ? 'You' : 'Online'}`}
        >
          <div 
            className="w-8 h-8 rounded-full border-2 bg-slate-800 flex items-center justify-center text-[10px] font-bold text-white shadow-lg transition-transform hover:scale-110 hover:z-10"
            style={{ borderColor: u.color || '#3b82f6' }}
          >
            {u.userName?.substring(0, 2).toUpperCase()}
          </div>
          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-slate-900 rounded-full" />
        </div>
      ))}
      {extraCount > 0 && (
        <div className="w-8 h-8 rounded-full border-2 border-slate-700 bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400 z-0">
          +{extraCount}
        </div>
      )}
    </div>
  );
}
