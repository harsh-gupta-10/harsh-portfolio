import { useState } from "react";
import { X, Share2, Copy, Check, Lock, Globe, EyeOff } from "lucide-react";
import { supabase } from "../../../lib/supabase";

export default function ShareModal({ note, open, onClose, onUpdate }) {
  const [isPublic, setIsPublic] = useState(note?.is_public || false);
  const [password, setPassword] = useState(note?.share_password || "");
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!open || !note) return null;

  const publicUrl = `${window.location.origin}/view/whiteboard/${note.share_token}`;

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = {
        is_public: isPublic,
        share_password: password || null,
      };
      const { error } = await supabase
        .from("notes")
        .update(updates)
        .eq("id", note.id);

      if (error) throw error;
      onUpdate(updates);
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to update sharing settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden shadow-black/50">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Share2 className="text-blue-500" size={20} />
            Share Whiteboard
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1 rounded-full hover:bg-slate-800">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Public Toggle */}
          <div className="flex items-start justify-between gap-4 p-4 rounded-xl border border-slate-700/50 bg-slate-800/20">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
                {isPublic ? <Globe size={16} className="text-green-400" /> : <EyeOff size={16} className="text-slate-500" />}
                Public Link Access
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {isPublic ? "Anyone with the link can view this whiteboard. It is strictly read-only." : "This whiteboard is private. The public link is inactive."}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-1">
              <input type="checkbox" className="sr-only peer" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
              <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500 shadow-inner"></div>
            </label>
          </div>

          {/* Password Protection (Only relevant if public) */}
          <div className={`space-y-3 transition-opacity ${!isPublic ? 'opacity-50 pointer-events-none' : ''}`}>
             <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Lock size={16} className="text-amber-500" />
                Password Protection (Optional)
             </h3>
             <input
               type="text"
               value={password}
               onChange={(e) => setPassword(e.target.value)}
               placeholder="Leave empty for open access"
               className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
             />
             <p className="text-xs text-slate-500">
               If set, visitors must enter this password to view the whiteboard.
             </p>
          </div>

          {/* Link Copy */}
          <div className={`pt-2 transition-opacity ${!isPublic ? 'opacity-50 pointer-events-none' : ''}`}>
            <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Public Link</label>
            <div className="flex gap-2">
              <input
                 type="text"
                 readOnly
                 value={publicUrl}
                 className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-blue-500 font-mono"
              />
              <button 
                onClick={handleCopy}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center justify-center gap-2 transition-colors font-bold text-xs"
              >
                {copied ? <Check size={16}/> : <Copy size={16}/>}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/50 flex justify-end gap-3">
           <button 
             onClick={onClose}
             className="px-4 py-2 text-sm font-bold text-slate-300 hover:text-white transition-colors"
           >
             Cancel
           </button>
           <button 
             onClick={handleSave}
             disabled={saving}
             className="px-6 py-2 bg-white text-slate-900 hover:bg-slate-200 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
           >
             {saving ? "Saving..." : "Save Changes"}
           </button>
        </div>

      </div>
    </div>
  );
}
