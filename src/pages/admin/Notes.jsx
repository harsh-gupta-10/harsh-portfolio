import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { Link, useNavigate } from "react-router-dom";
import Masonry from "react-masonry-css";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Plus, LayoutGrid, List as ListIcon, Columns } from "lucide-react";
import NoteCard from "../../components/admin/notes/NoteCard";
import NoteFilters from "../../components/admin/notes/NoteFilters";
import { usePermissions } from "../../hooks/usePermissions";

export default function Notes() {
  const { profile, hasPermission } = usePermissions();
  const navigate = useNavigate();

  const [notes, setNotes] = useState([]);
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [activeType, setActiveType] = useState("all");
  const [activeTag, setActiveTag] = useState("all");
  const [showArchived, setShowArchived] = useState(false);
  const [activeProject, setActiveProject] = useState("all");
  const [activeClient, setActiveClient] = useState("all");

  const [viewMode, setViewMode] = useState("grid"); // grid, list, board

  useEffect(() => {
    fetchData();
  }, [profile]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Notes
      const { data: notesData, error: nErr } = await supabase
        .from("notes")
        .select(`*, whiteboards(id, thumbnail_url)`)
        .order("is_pinned", { ascending: false })
        .order("updated_at", { ascending: false });

      if (nErr) throw nErr;

      // Fetch Relations for filters
      const { data: pData } = await supabase.from("projects").select("id, title");
      const { data: cData } = await supabase.from("clients").select("id, name");

      setNotes(notesData || []);
      setProjects(pData || []);
      setClients(cData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Unique Tags Extractor
  const uniqueTags = Array.from(new Set(notes.flatMap(n => n.tags || []))).sort();

  // Filtered Notes
  const filteredNotes = notes.filter(n => {
    if (n.is_archived !== showArchived) return false;
    if (activeType !== "all" && n.note_type !== activeType) return false;
    if (activeTag !== "all" && !(n.tags || []).includes(activeTag)) return false;
    if (activeProject !== "all" && n.linked_project_id !== activeProject) return false;
    if (activeClient !== "all" && n.linked_client_id !== activeClient) return false;
    if (searchQuery) {
      const sq = searchQuery.toLowerCase();
      const inTitle = (n.title || "").toLowerCase().includes(sq);
      // Rough content search (only strings)
      const inContent = typeof n.content === "string" ? n.content.toLowerCase().includes(sq) : false;
      if (!inTitle && !inContent) return false;
    }
    return true;
  });

  const pinnedNotes = filteredNotes.filter(n => n.is_pinned);
  const unpinnedNotes = filteredNotes.filter(n => !n.is_pinned);

  // Actions
  const handleCreateNote = async (type) => {
    if (!profile) return;
    const { data, error } = await supabase.from("notes").insert({
      user_id: profile.id,
      note_type: type,
      title: "",
      color: "#3b82f6"
    }).select().single();

    if (!error && data) {
      navigate(`/admin/notes/${data.id}`);
    }
  };

  const handleUpdate = async (id, updates) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, ...updates } : n));
    await supabase.from("notes").update(updates).eq("id", id);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this note?")) return;
    setNotes(prev => prev.filter(n => n.id !== id));
    await supabase.from("notes").delete().eq("id", id);
  };

  // Render Grid Layout
  const renderMasonry = (items) => (
    <Masonry
      breakpointCols={{ default: 3, 1100: 2, 700: 1 }}
      className="flex w-auto -ml-4"
      columnClassName="pl-4 bg-clip-padding"
    >
      {items.map(note => (
        <div key={note.id} className="mb-4">
          <NoteCard 
            note={note} 
            onDelete={handleDelete}
            onPin={(id, pin) => handleUpdate(id, { is_pinned: pin })}
            onArchive={(id, arc) => handleUpdate(id, { is_archived: arc, is_pinned: arc ? false : note.is_pinned })}
          />
        </div>
      ))}
    </Masonry>
  );

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar Filters */}
      <div className="w-64 border-r border-slate-800 bg-[#0f172a] p-4 overflow-y-auto hidden md:block">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Notes</h2>
          {hasPermission("notes", "can_create") && (
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => handleCreateNote("text")} className="col-span-2 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2">
                <Plus size={16} /> New Text Note
              </button>
              <button onClick={() => handleCreateNote("whiteboard")} className="py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold">Whiteboard</button>
              <button onClick={() => handleCreateNote("checklist")} className="py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold">Checklist</button>
              <button onClick={() => handleCreateNote("code")} className="col-span-2 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold border border-slate-700 cursor-pointer">Code Snippet</button>
            </div>
          )}
        </div>

        <NoteFilters 
          searchQuery={searchQuery} setSearchQuery={setSearchQuery}
          activeType={activeType} setActiveType={setActiveType}
          activeTag={activeTag} setActiveTag={setActiveTag}
          showArchived={showArchived} setShowArchived={setShowArchived}
          uniqueTags={uniqueTags} projects={projects} clients={clients}
          activeProject={activeProject} setActiveProject={setActiveProject}
          activeClient={activeClient} setActiveClient={setActiveClient}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-slate-900 overflow-y-auto p-6 md:p-8">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">
              {showArchived ? "Archived Notes" : activeType !== "all" ? `${activeType.charAt(0).toUpperCase() + activeType.slice(1)} Notes` : "All Notes"}
            </h1>
            <p className="text-sm text-slate-400">{filteredNotes.length} notes found</p>
          </div>

          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700">
            <button onClick={() => setViewMode("grid")} className={`p-1.5 rounded-md ${viewMode==="grid"?"bg-slate-700 text-white":"text-slate-400"}`}><LayoutGrid size={16} /></button>
            <button onClick={() => setViewMode("list")} className={`p-1.5 rounded-md ${viewMode==="list"?"bg-slate-700 text-white":"text-slate-400"}`}><ListIcon size={16} /></button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-500">Loading notes...</div>
        ) : filteredNotes.length === 0 ? (
          <div className="text-center py-20 bg-slate-800/20 rounded-2xl border border-slate-800 border-dashed">
            <h3 className="text-lg font-bold text-white mb-2">No notes found</h3>
            <p className="text-slate-400 text-sm">Create a new note or adjust your search filters.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Pinned Section */}
            {pinnedNotes.length > 0 && !showArchived && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 px-1 flex items-center gap-2">
                  📌 Pinned
                </h3>
                {viewMode === "grid" ? renderMasonry(pinnedNotes) : (
                  <div className="space-y-3">
                    {pinnedNotes.map(n => <div key={n.id}><NoteCard note={n} onArchive={(id,a)=>handleUpdate(id,{is_archived:a,is_pinned:false})} onPin={(id,p)=>handleUpdate(id,{is_pinned:p})} onDelete={handleDelete}/></div>)}
                  </div>
                )}
              </div>
            )}

            {/* Others Section */}
            {unpinnedNotes.length > 0 && (
              <div>
                {pinnedNotes.length > 0 && !showArchived && (
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 px-1 mt-6">
                    Others
                  </h3>
                )}
                {viewMode === "grid" ? renderMasonry(unpinnedNotes) : (
                  <div className="space-y-3">
                    {unpinnedNotes.map(n => <div key={n.id}><NoteCard note={n} onArchive={(id,a)=>handleUpdate(id,{is_archived:a,is_pinned:false})} onPin={(id,p)=>handleUpdate(id,{is_pinned:p})} onDelete={handleDelete}/></div>)}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
