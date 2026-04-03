import React, { useEffect, useRef } from "react";
import { Copy, Lock, Unlock, ArrowUpToLine, ArrowDownToLine, Trash2, Paintbrush, MousePointer2, ClipboardPaste, ClipboardCopy, RotateCcw } from "lucide-react";

export default function ContextMenu({ x, y, visible, hasSelection, hasClipboardObject, hasStyleClipboard, onAction, onClose }) {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };
    if (visible) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [visible, onClose]);

  if (!visible) return null;

  // Prevent menu from going off-screen
  const style = {
    top: Math.min(y, window.innerHeight - 300),
    left: Math.min(x, window.innerWidth - 200),
  };

  const btnClass = "w-full text-left px-4 py-2 hover:bg-slate-700/50 flex items-center gap-3 text-sm text-slate-200 transition-colors";
  
  return (
    <div 
      ref={menuRef}
      style={style}
      className="fixed z-50 w-56 bg-slate-800 border border-slate-700/50 rounded-xl shadow-2xl py-2 flex flex-col overflow-hidden backdrop-blur-md"
      onContextMenu={(e) => e.preventDefault()}
    >
      {hasSelection ? (
        <>
          <button onClick={() => onAction("copy")} className={btnClass}>
            <ClipboardCopy size={14} /> Copy
          </button>
          <button onClick={() => onAction("duplicate")} className={btnClass}>
            <Copy size={14} /> Duplicate
          </button>
          <button onClick={() => onAction("toggle_lock")} className={btnClass}>
            <Lock size={14} /> Lock / Unlock
          </button>
          <button onClick={() => onAction("bring_forward")} className={btnClass}>
            <ArrowUpToLine size={14} /> Bring to Front
          </button>
          <button onClick={() => onAction("send_backward")} className={btnClass}>
            <ArrowDownToLine size={14} /> Send to Back
          </button>
          <button onClick={() => onAction("delete")} className={`${btnClass} text-red-400 hover:text-red-300 hover:bg-red-500/10`}>
            <Trash2 size={14} /> Delete
          </button>
          <div className="w-full h-px bg-slate-700/50 my-1"></div>
          <button onClick={() => onAction("copy_style")} className={btnClass}>
            <Paintbrush size={14} /> Copy Style
          </button>
          {hasStyleClipboard && (
            <button onClick={() => onAction("paste_style")} className={btnClass}>
              <ClipboardPaste size={14} /> Paste Style
            </button>
          )}
        </>
      ) : (
        <>
          <button onClick={() => onAction("paste")} disabled={!hasClipboardObject} className={`${btnClass} ${!hasClipboardObject && 'opacity-50 cursor-not-allowed'}`}>
            <ClipboardPaste size={14} /> Paste
          </button>
          <button onClick={() => onAction("select_all")} className={btnClass}>
            <MousePointer2 size={14} /> Select All
          </button>
          <div className="w-full h-px bg-slate-700/50 my-1"></div>
          <button onClick={() => onAction("clear_all")} className={`${btnClass} text-red-400 hover:text-red-300 hover:bg-red-500/10`}>
            <RotateCcw size={14} /> Clear All
          </button>
        </>
      )}
    </div>
  );
}
