import { useState } from "react";
import { FileText, Edit3, Image, CheckSquare, Code, Pin, Trash2, Archive, Link as LinkIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

const TYPE_ICONS = {
  text: FileText,
  whiteboard: Image,
  checklist: CheckSquare,
  code: Code,
};

export default function NoteCard({ note, onDelete, onPin, onArchive }) {
  const navigate = useNavigate();
  const Icon = TYPE_ICONS[note.note_type] || FileText;

  // Render a tiny preview based on note type
  const renderPreview = () => {
    switch (note.note_type) {
      case "text": {
        // Strip HTML tags for preview and show first ~100 chars
        const docText = typeof note.content === "string" ? note.content : (note.content?.content ? JSON.stringify(note.content).replace(/<[^>]+>/g, "").slice(0, 100) : "");
        return <p className="text-sm text-slate-400 line-clamp-3 mt-2">{docText.replace(/[^a-zA-Z0-9.,?!\s]/g, "")}</p>;
      }
      case "whiteboard":
        // It has a thumbnail or a placeholder
        return (
          <div className="w-full h-32 bg-slate-800 rounded-lg mt-3 overflow-hidden border border-slate-700/50 flex items-center justify-center">
            {note.whiteboards?.[0]?.thumbnail_url ? (
              <img src={note.whiteboards[0].thumbnail_url} alt="Whiteboard preview" className="w-full h-full object-cover opacity-80" />
            ) : (
              <span className="text-xs text-slate-500 font-medium">Drawings inside</span>
            )}
          </div>
        );
      case "checklist": {
        const items = Array.isArray(note.content) ? note.content : [];
        const completed = items.filter(i => i.checked).length;
        return (
          <div className="mt-3 space-y-1.5">
            {items.slice(0, 3).map((item, idx) => (
              <div key={idx} className="flex items-start gap-2 max-w-full text-xs text-slate-400">
                <span className={`flex-shrink-0 ${item.checked ? "text-green-500" : "text-slate-600"}`}>
                  {item.checked ? "☑" : "☐"}
                </span>
                <span className={`truncate ${item.checked ? "line-through opacity-60" : ""}`}>{item.text}</span>
              </div>
            ))}
            {items.length > 3 && <div className="text-xs text-slate-500 pt-1">+{items.length - 3} more items...</div>}
            {items.length > 0 && (
              <div className="w-full bg-slate-800 rounded-full h-1 mt-2">
                <div className="bg-blue-500 h-1 rounded-full transition-all" style={{ width: `${(completed / items.length) * 100}%` }} />
              </div>
            )}
          </div>
        );
      }
      case "code":
        return (
          <div className="mt-3 p-2 bg-slate-900 rounded-md overflow-hidden text-xs font-mono text-blue-300 line-clamp-3 leading-relaxed">
            {note.content?.code || "// Code snippet here"}
          </div>
        );
      default:
        return null;
    }
  };

  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div 
      className="group relative flex flex-col bg-slate-800/50 hover:bg-slate-800 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-black/20 hover:-translate-y-0.5"
      style={{ border: "1px solid #334155" }}
      onMouseLeave={() => setConfirmDelete(false)}
    >
      {/* Top accent color bar */}
      <div className="h-1.5 w-full" style={{ background: note.color || "#3b82f6" }} />
      
      <div 
        className="p-5 flex-1 cursor-pointer flex flex-col"
        onClick={() => navigate(`/admin/notes/${note.id}`)}
      >
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-bold text-slate-200 leading-snug line-clamp-2">{note.title || "Untitled Note"}</h3>
          {note.is_pinned && <Pin size={14} className="text-amber-500 flex-shrink-0 mt-0.5 fill-amber-500/20" />}
        </div>
        
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mt-2 mb-1 uppercase tracking-wider">
          <Icon size={12} />
          {note.note_type}
        </div>

        {renderPreview()}

        <div className="mt-auto pt-4 flex flex-col gap-2">
          {/* Tags */}
          {note.tags && note.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {note.tags.map(tag => (
                <span key={tag} className="px-2 py-0.5 rounded-md bg-slate-700/50 text-[10px] uppercase font-bold text-slate-300">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Links */}
          {(note.linked_project_id || note.linked_client_id) && (
            <div className="flex items-center gap-1.5 text-xs text-blue-400 bg-blue-500/10 px-2 py-1 rounded w-max mt-1">
              <LinkIcon size={12} />
              <span className="truncate max-w-[120px]">
                {note.linked_project_id ? "Project" : "Client"} Linked
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="px-5 py-3 border-t border-slate-700/50 flex items-center justify-between text-xs text-slate-500 relative bg-slate-900/20">
        <span>{formatDistanceToNow(new Date(note.updated_at), { addSuffix: true })}</span>
        
        {/* Floating actions (visible on hover) */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 p-1.5 rounded-lg shadow-lg border border-slate-700">
          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onPin(note.id, !note.is_pinned); }} className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-700 rounded transition-colors" title={note.is_pinned ? "Unpin" : "Pin"}>
            <Pin size={14} className={note.is_pinned ? "fill-amber-400/20 text-amber-400" : ""} />
          </button>
          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate(`/admin/notes/${note.id}`); }} className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-700 rounded transition-colors" title="Edit">
            <Edit3 size={14} />
          </button>
          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onArchive(note.id, !note.is_archived); }} className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-700 rounded transition-colors" title={note.is_archived ? "Unarchive" : "Archive"}>
            <Archive size={14} />
          </button>
          <button 
            onClick={(e) => { 
              e.preventDefault(); 
              e.stopPropagation(); 
              if (confirmDelete) {
                onDelete(note.id);
              } else {
                setConfirmDelete(true);
                setTimeout(() => setConfirmDelete(false), 3000);
              }
            }} 
            className={`p-1.5 rounded transition-colors ${confirmDelete ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'text-slate-400 hover:text-red-400 hover:bg-slate-700'}`} 
            title={confirmDelete ? "Confirm Delete" : "Delete"}
          >
            {confirmDelete ? <CheckSquare size={14} /> : <Trash2 size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
}
