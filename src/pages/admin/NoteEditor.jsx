import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { ArrowLeft, Save, Loader2, Pin, Clock, MoreVertical, LayoutPanelLeft, Hash, Trash2 } from "lucide-react";
import TextEditor from "../../components/admin/notes/TextEditor";
import WhiteboardEditor from "../../components/admin/notes/WhiteboardEditor";
import ChecklistEditor from "../../components/admin/notes/ChecklistEditor";
import CodeEditor from "../../components/admin/notes/CodeEditor";
import VersionHistory from "../../components/admin/notes/VersionHistory";

const COLORS = [
  "#3b82f6", "#8b5cf6", "#ec4899", "#ef4444", 
  "#f59e0b", "#10b981", "#14b8a6", "#64748b"
];

export default function NoteEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Save State
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  
  // Versions
  const [showVersions, setShowVersions] = useState(false);
  const [versions, setVersions] = useState([]);
  
  // Unsaved Content Reference
  const unsavedContent = useRef(null);
  const saveTimeout = useRef(null);
  const versionTimeout = useRef(null);

  // Load Note
  useEffect(() => {
    loadNote();
    return () => {
      clearTimeout(saveTimeout.current);
      clearTimeout(versionTimeout.current);
    };
  }, [id]);

  const loadNote = async () => {
    setLoading(true);
    const { data: n, error } = await supabase.from("notes").select("*").eq("id", id).single();
    if (error) {
      console.error(error);
      navigate("/admin/notes");
      return;
    }
    setNote(n);
    unsavedContent.current = n.content;
    setLastSaved(new Date(n.updated_at));
    setLoading(false);
    
    // Also load whiteboard data if it's a whiteboard note
    if (n.note_type === "whiteboard") {
      const { data: wb } = await supabase.from("whiteboards").select("*").eq("note_id", id).maybeSingle();
      if (wb && wb.excalidraw_data) {
        unsavedContent.current = wb.excalidraw_data;
      }
    }
  };

  // Auto-save logic
  const handleContentChange = (contentData, thumbnailBlob = null) => {
    unsavedContent.current = contentData;
    
    // Clear old timeout
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    
    setSaving(true);
    
    // Debounce 2s
    saveTimeout.current = setTimeout(async () => {
      await performSave(contentData, thumbnailBlob);
    }, 2000);
  };

  const performSave = async (contentToSave, thumbnailBlob = null) => {
    if (!note) return;
    
    try {
      if (note.note_type === "whiteboard") {
        // Find existing whiteboard row
        const { data: existingWb } = await supabase.from("whiteboards").select("id").eq("note_id", note.id).maybeSingle();
        let thumbUrl = null;

        // If blob provided, upload it to storage
        if (thumbnailBlob) {
          const fileName = `thumb_${note.id}_${Date.now()}.png`;
          const { data: fileData, error: fileErr } = await supabase.storage.from("notes_media").upload(fileName, thumbnailBlob, { upsert: true });
          if (!fileErr) {
            const { data: publicUrlData } = supabase.storage.from("notes_media").getPublicUrl(fileName);
            thumbUrl = publicUrlData.publicUrl;
          }
        }

        const wbUpdate = {
          note_id: note.id,
          excalidraw_data: contentToSave,
          updated_at: new Date()
        };
        if (thumbUrl) wbUpdate.thumbnail_url = thumbUrl;

        if (existingWb) {
          await supabase.from("whiteboards").update(wbUpdate).eq("id", existingWb.id);
        } else {
          await supabase.from("whiteboards").insert(wbUpdate);
        }
        
        // Update updated_at of main note
        await supabase.from("notes").update({ updated_at: new Date() }).eq("id", note.id);
      } else {
        // Regular note save
        await supabase.from("notes").update({ content: contentToSave, updated_at: new Date() }).eq("id", note.id);
      }
      
      setLastSaved(new Date());
      setSaving(false);
      
      // Attempt Version Snapshot every 10 min
      scheduleVersionSnapshot(contentToSave);
    } catch (err) {
      console.error("Auto-save failed", err);
    }
  };

  const scheduleVersionSnapshot = async (content) => {
    if (versionTimeout.current) return; // already queued
    
    versionTimeout.current = setTimeout(async () => {
      await supabase.from("note_versions").insert({
        note_id: note.id,
        content: content
      });
      versionTimeout.current = null;
    }, 10 * 60 * 1000); // 10 minutes
  };

  // Direct Meta Updates (Title, Color, is_pinned, tags)
  const updateMeta = async (updates) => {
    setNote(n => ({...n, ...updates})); // optimistic
    await supabase.from("notes").update(updates).eq("id", note.id);
  };

  const addTag = (val) => {
    if (!val || !val.trim()) return;
    const tag = val.trim().toLowerCase();
    const currentTags = note.tags || [];
    if (!currentTags.includes(tag)) {
        updateMeta({ tags: [...currentTags, tag] });
    }
  };

  const removeTag = (tag) => {
    updateMeta({ tags: (note.tags || []).filter(t => t !== tag) });
  };

  // Versions Panel
  const fetchVersions = async () => {
    const { data } = await supabase.from("note_versions").select("*").eq("note_id", id).order("saved_at", { ascending: false });
    setVersions(data || []);
    setShowVersions(true);
  };

  const renderEditor = () => {
    const key = note.updated_at; // Force re-mount on restore for Tiptap
    switch (note.note_type) {
      case "text":
        return <TextEditor key={key} initialContent={unsavedContent.current} onChange={handleContentChange} />;
      case "checklist":
        return <ChecklistEditor initialContent={unsavedContent.current} onChange={handleContentChange} />;
      case "code":
        return <CodeEditor initialContent={unsavedContent.current} onChange={handleContentChange} />;
      case "whiteboard":
        // Whiteboard auto-generates thumbnails when saving
        return <WhiteboardEditor initialContent={unsavedContent.current} onChange={(d) => handleContentChange(d)} setThumbnailBlob={(b) => performSave(unsavedContent.current, b)} />;
      default:
        return null;
    }
  };

  if (loading) return <div className="h-screen w-full flex items-center justify-center bg-[#0f172a]"><Loader2 size={32} className="text-blue-500 animate-spin" /></div>;
  if (!note) return null;

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-[#0f172a]">
      {/* Top Bar */}
      <div className="h-16 border-b border-slate-800 bg-slate-900 flex items-center justify-between px-4 sticky top-0 z-40">
        <div className="flex items-center gap-4 flex-1">
          <button onClick={() => { if(saveTimeout.current) performSave(unsavedContent.current); navigate('/admin/notes'); }} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
            <ArrowLeft size={18} />
          </button>
          
          <input
            type="text"
            value={note.title || ""}
            onChange={(e) => updateMeta({ title: e.target.value })}
            placeholder="Untitled Note"
            className="bg-transparent text-lg font-bold text-white focus:outline-none focus:bg-slate-800/50 px-2 py-1 rounded w-full max-w-md placeholder-slate-600 transition-colors"
          />

          <span className="hidden md:inline-block px-2 py-1 bg-slate-800 border border-slate-700 rounded-md text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {note.note_type}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 hidden sm:inline-block">
            {saving ? <span className="flex items-center gap-1"><Loader2 size={12} className="animate-spin"/> Saving...</span> : (lastSaved ? `Saved ${lastSaved.toLocaleTimeString()}` : '')}
          </span>

          <div className="flex items-center gap-1 border-l pl-3 border-slate-800 ml-1">
            {COLORS.map(c => (
              <button 
                key={c} 
                onClick={() => updateMeta({ color: c })}
                className={`w-5 h-5 rounded-full transition-transform ${note.color === c ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-slate-900 border border-black/20' : 'hover:scale-110 opacity-70 hover:opacity-100 border border-black/20'}`}
                style={{ background: c }}
              />
            ))}
          </div>

          <div className="flex items-center gap-1 border-l pl-3 border-slate-800 ml-1">
            <button onClick={() => updateMeta({ is_pinned: !note.is_pinned })} className={`p-2 rounded-lg transition-colors ${note.is_pinned ? 'bg-amber-500/10 text-amber-500' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`} title="Pin Note">
              <Pin size={18} className={note.is_pinned ? "fill-amber-500/20" : ""} />
            </button>
            <button onClick={fetchVersions} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors" title="Version History">
              <Clock size={18} />
            </button>
            <button onClick={() => { updateMeta({ is_archived: !note.is_archived, is_pinned: false }); navigate('/admin/notes'); }} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors" title="Archive Note">
              <LayoutPanelLeft size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Editor & Sidebar layout */}
      <div className="flex flex-1 overflow-hidden relative">
        <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-5xl mx-auto h-full min-h-[500px]">
            {renderEditor()}
          </div>
        </div>

        {/* Right Sidebar for Tags & Metadata */}
        <div className="w-64 border-l border-slate-800 bg-slate-900/50 p-6 hidden lg:block overflow-y-auto">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
            <Hash size={14} /> Tags
          </h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {(note.tags || []).map(tag => (
              <span key={tag} className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
                {tag}
                <button onClick={() => removeTag(tag)} className="hover:text-white bg-blue-500/20 rounded-full p-0.5"><X size={10} /></button>
              </span>
            ))}
          </div>
          <input
            type="text"
            placeholder="Add a tag and press Enter..."
            onKeyDown={(e) => { 
                if(e.key === 'Enter') { e.preventDefault(); addTag(e.target.value); e.target.value = ''; }
            }}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-blue-500"
          />

          <div className="w-full h-px bg-slate-800 my-8" />
          
          <button 
            onClick={async () => {
              if (confirm("Move to Trash?")) {
                await supabase.from("notes").delete().eq("id", id);
                navigate('/admin/notes');
              }
            }}
            className="w-full py-2.5 rounded-xl border border-red-500/30 text-red-400 text-sm font-bold hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2"
          >
            <Trash2 size={16} /> Delete Note
          </button>
        </div>
      </div>

      <VersionHistory 
        open={showVersions} 
        onClose={() => setShowVersions(false)} 
        versions={versions}
        onRestore={(content) => {
          updateMeta({ content });
          unsavedContent.current = content;
          setShowVersions(false);
        }}
      />
    </div>
  );
}
