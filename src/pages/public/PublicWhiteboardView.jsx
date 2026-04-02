import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { Tldraw } from "tldraw";
import "tldraw/tldraw.css";
import { Loader2, Lock, ArrowRight, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

export default function PublicWhiteboardView() {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  
  // Password State
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [saving, setSaving] = useState(false);
  const saveTimeout = useRef(null);

  useEffect(() => {
    fetchWhiteboard();
  }, [token]);

  const fetchWhiteboard = async (pwd = null) => {
    try {
      if (!pwd) setLoading(true);
      else setVerifying(true);
      setPasswordError("");

      const edgeUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/view-whiteboard?token=${token}`;
      const payload = pwd ? { password: pwd } : {};
      
      const response = await fetch(edgeUrl, {
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401 && result.requiresPassword) {
            setRequiresPassword(true);
            if (pwd) setPasswordError("Incorrect password. Please try again.");
            return;
        }
        throw new Error(result.error || "Failed to load whiteboard");
      }

      setRequiresPassword(false);
      setData(result);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
      setVerifying(false);
    }
  };

  const saveWhiteboardData = async (snapshot) => {
    try {
      const edgeUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/view-whiteboard?token=${token}`;
      const payload = { action: "SAVE", whiteboard_data: snapshot };
      if (password) payload.password = password; 
      
      const response = await fetch(edgeUrl, {
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      const result = await response.json();
      if (!result.success) throw new Error("Failed to auto-save");
    } catch (err) {
      console.error("Auto-save failed", err);
    } finally {
      setSaving(false);
    }
  };

  const handleMount = (editor) => {
    if (data.whiteboard && typeof data.whiteboard === 'object' && Object.keys(data.whiteboard).length > 0) {
      try {
        if (data.whiteboard.elements || Array.isArray(data.whiteboard)) return; 
        
        editor.store.loadSnapshot(data.whiteboard);
      } catch (e) {
        console.warn("Failed to load tldraw snapshot", e);
      }
    }
    
    editor.store.listen(() => {
      try {
        const snapshot = editor.store.getSnapshot();
        const serialized = JSON.parse(JSON.stringify(snapshot));
        if (saveTimeout.current) clearTimeout(saveTimeout.current);
        setSaving(true);
        saveTimeout.current = setTimeout(() => {
           saveWhiteboardData(serialized);
        }, 2000);
      } catch (e) {}
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
          <AlertTriangle className="mx-auto text-red-500 mb-4" size={48} />
          <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-slate-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (requiresPassword) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
          <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="text-blue-500" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white text-center mb-2">Password Protected</h2>
          <p className="text-slate-400 text-sm text-center mb-8">
            This whiteboard requires a password to view.
          </p>
          
          <form onSubmit={(e) => { e.preventDefault(); fetchWhiteboard(password); }} className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
                autoFocus
              />
              {passwordError && <p className="text-red-400 text-xs mt-2 text-center">{passwordError}</p>}
            </div>
            <button
              disabled={!password || verifying}
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-3 font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {verifying ? <Loader2 size={18} className="animate-spin" /> : "Access Whiteboard"}
              {!verifying && <ArrowRight size={18} />}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { title, author, updated_at } = data;

  return (
    <div className="fixed inset-0 flex flex-col bg-[#121212] font-sans">
      <div className="h-14 bg-[#1a1a1a] border-b border-[#333] px-6 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-white font-bold text-sm truncate max-w-[300px]">{title}</h1>
          <span className="px-2 py-0.5 bg-green-500/20 text-green-400 uppercase tracking-widest text-[10px] font-bold rounded flex items-center gap-2">
            Public Session
            {saving && <Loader2 size={10} className="animate-spin" />}
          </span>
        </div>
        
        <div className="flex items-center gap-4 text-xs text-gray-400">
          {author && (
            <div className="flex items-center gap-2 border-r border-[#333] pr-4">
               <span>Created by</span>
               <span className="text-white font-medium">{author.full_name || 'Admin'}</span>
            </div>
          )}
          {updated_at && (
             <span>Auto-saving live</span>
          )}
        </div>
      </div>

      <div className="flex-1 relative tldraw-dark-brand pt-1">
        <Tldraw
          onMount={handleMount}
          inferDarkMode
          className="tldraw-dark-mode"
        />
      </div>

      <style>{`
        .tldraw-dark-brand {
          --color-background: #121212;
          width: 100%;
          height: 100%;
        }
      `}</style>
    </div>
  );
}
