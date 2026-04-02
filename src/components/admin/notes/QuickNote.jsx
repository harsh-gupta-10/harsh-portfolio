import { useState, useRef, useEffect } from "react";
import { PenSquare, X, Check, Loader2 } from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../../hooks/useAuth";

export default function QuickNote({ profileId }) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const textareaRef = useRef(null);

  // Focus textarea when opened
  useEffect(() => {
    if (open && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [open]);

  const handleSave = async () => {
    if (!content.trim() || !profileId) return;
    setSaving(true);
    
    try {
      // Basic quick note goes as text note
      const titleText = content.split('\n')[0].substring(0, 40).trim();
      const title = titleText || "Quick Note";
      
      const { error } = await supabase.from("notes").insert({
        user_id: profileId,
        title,
        note_type: "text",
        content: `<p>${content.replace(/\n/g, '<br/>')}</p>`,
        color: "#3b82f6" // Default blue
      });
      
      if (error) throw error;
      
      setSaved(true);
      setTimeout(() => {
        setOpen(false);
        setContent("");
        setSaved(false);
      }, 1500);
    } catch (err) {
      console.error("Error saving quick note:", err);
      alert("Failed to save note");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {/* Popover */}
      {open && (
        <div className="mb-4 w-80 bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden transform origin-bottom-right transition-all animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-700">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <PenSquare size={14} className="text-amber-400" />
              Quick Note
            </h3>
            <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-white">
              <X size={16} />
            </button>
          </div>
          
          <div className="p-1">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Jot something down..."
              className="w-full h-32 bg-transparent text-slate-200 text-sm p-3 resize-none focus:outline-none placeholder-slate-500"
            />
          </div>

          <div className="px-3 py-2 border-t border-slate-700 flex justify-end bg-slate-900/50">
            <button
              onClick={handleSave}
              disabled={!content.trim() || saving || saved}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                saved 
                  ? "bg-green-500/20 text-green-400 hover:bg-green-500/20" 
                  : "bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white"
              }`}
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : (saved ? <Check size={14} /> : null)}
              {saved ? "Saved" : "Save Note"}
            </button>
          </div>
        </div>
      )}

      {/* FAB (Floating Action Button) */}
      <button
        onClick={() => setOpen(!open)}
        className="w-14 h-14 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-1 transition-all"
        title="Quick Note"
      >
        {open ? <X size={24} /> : <PenSquare size={24} />}
      </button>
    </div>
  );
}
