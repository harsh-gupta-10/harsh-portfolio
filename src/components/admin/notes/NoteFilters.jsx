import { Search, Hash, FileText, Image, CheckSquare, Code, Archive, Pin, FolderOpen, Users } from "lucide-react";

export default function NoteFilters({ 
  searchQuery, setSearchQuery, 
  activeType, setActiveType, 
  activeTag, setActiveTag, 
  showArchived, setShowArchived,
  uniqueTags = [],
  projects = [],
  clients = [],
  activeProject, setActiveProject,
  activeClient, setActiveClient
}) {
  const TYPES = [
    { id: "all", label: "All Notes", icon: null },
    { id: "text", label: "Text Notes", icon: FileText },
    { id: "whiteboard", label: "Whiteboards", icon: Image },
    { id: "checklist", label: "Checklists", icon: CheckSquare },
    { id: "code", label: "Code Snippets", icon: Code },
  ];

  return (
    <div className="w-full h-full flex flex-col gap-6">
      {/* Search */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={16} className="text-slate-500" />
        </div>
        <input
          type="text"
          placeholder="Search notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500 text-white placeholder-slate-500"
        />
      </div>

      {/* Types */}
      <div>
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-2">Types</h3>
        <div className="space-y-1">
          {TYPES.map(type => (
            <button
              key={type.id}
              onClick={() => setActiveType(type.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${activeType === type.id ? "bg-blue-500/20 text-blue-400 font-bold" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
            >
              <div className="flex items-center gap-2">
                {type.icon && <type.icon size={16} />}
                {type.label}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Filters (Archive/Pins) */}
      <div>
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-2">Collections</h3>
        <div className="space-y-1">
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${showArchived ? "bg-indigo-500/20 text-indigo-400 font-bold" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
          >
            <Archive size={16} />
            Archived Notes
          </button>
        </div>
      </div>

      {/* Tags */}
      {uniqueTags.length > 0 && (
        <div>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-2">Tags</h3>
          <div className="flex flex-wrap gap-1.5 px-2">
            <button
              onClick={() => setActiveTag("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeTag === "all" ? "bg-slate-700 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}
            >
              All
            </button>
            {uniqueTags.map(tag => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${activeTag === tag ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}
              >
                <Hash size={10} />
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* External Links Filter */}
      {(projects.length > 0 || clients.length > 0) && (
        <div className="mt-2 text-xs">
          <h3 className="font-bold text-slate-500 uppercase tracking-wider mb-2 px-2">Linked Records</h3>
          
          {projects.length > 0 && (
            <div className="mb-3">
              <label className="text-slate-400 px-2 flex items-center gap-1.5 mb-1"><FolderOpen size={12}/> Project</label>
              <select 
                value={activeProject} 
                onChange={e => setActiveProject(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-2 text-slate-300 focus:outline-none"
              >
                <option value="all">Any Project</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            </div>
          )}

          {clients.length > 0 && (
            <div>
              <label className="text-slate-400 px-2 flex items-center gap-1.5 mb-1"><Users size={12}/> Client</label>
              <select 
                value={activeClient} 
                onChange={e => setActiveClient(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-2 text-slate-300 focus:outline-none"
              >
                <option value="all">Any Client</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
