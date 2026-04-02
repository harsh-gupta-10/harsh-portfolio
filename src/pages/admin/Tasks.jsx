import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  Plus, Search, X, Save, Calendar, AlertTriangle,
  Pencil, Trash2, FolderKanban, ChevronDown, Minus, ChevronsUp,
  LayoutGrid, List, CheckCircle2, Clock
} from "lucide-react";

const STATUSES = ["todo", "in_progress", "done"];
const STATUS_META = {
  todo: { label: "To Do", bg: "rgba(148,163,184,0.08)", border: "rgba(148,163,184,0.2)", dot: "#94a3b8" },
  in_progress: { label: "In Progress", bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.2)", dot: "#3b82f6" },
  done: { label: "Done", bg: "rgba(34,197,94,0.08)", border: "rgba(34,197,94,0.2)", dot: "#22c55e" },
};

const PRIORITIES = ["low", "medium", "high"];
const PRIORITY_META = {
  low: { label: "Low", color: "#94a3b8", icon: ChevronDown },
  medium: { label: "Medium", color: "#fbbf24", icon: Minus },
  high: { label: "High", color: "#f87171", icon: ChevronsUp },
};

const EMPTY = { title: "", description: "", project_id: "", status: "todo", priority: "medium", due_date: "" };

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("kanban");
  
  // Filters
  const [search, setSearch] = useState("");
  const [filterProject, setFilterProject] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");

  // Sheet
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    const [t, p] = await Promise.all([
      supabase.from("tasks").select("*").order("created_at", { ascending: false }),
      supabase.from("projects").select("id, title")
    ]);
    if (t.data) setTasks(t.data);
    if (p.data) setProjects(p.data);
    setLoading(false);
  }

  const projMap = useMemo(() => Object.fromEntries(projects.map(p => [p.id, p.title])), [projects]);

  // Filters
  const filtered = tasks
    .filter(t => filterProject === "all" || t.project_id === filterProject)
    .filter(t => filterPriority === "all" || t.priority === filterPriority)
    .filter(t => {
      if (!search) return true;
      const s = search.toLowerCase();
      return (t.title || "").toLowerCase().includes(s) || (t.description || "").toLowerCase().includes(s);
    });

  // Columns
  const columns = useMemo(() => {
    const cols = {};
    STATUSES.forEach(s => { cols[s] = filtered.filter(t => t.status === s); });
    return cols;
  }, [filtered]);

  function openAdd() { setEditing(null); setForm(EMPTY); setSheetOpen(true); }
  function openEdit(task) {
    setEditing(task);
    setForm({
      title: task.title || "", description: task.description || "", project_id: task.project_id || "",
      status: task.status || "todo", priority: task.priority || "medium", due_date: task.due_date || ""
    });
    setSheetOpen(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form };
    if (!payload.project_id) payload.project_id = null;
    if (!payload.due_date) payload.due_date = null;
    
    if (editing) {
      const { data } = await supabase.from("tasks").update(payload).eq("id", editing.id).select().single();
      if (data) setTasks(prev => prev.map(t => t.id === data.id ? data : t));
    } else {
      const { data } = await supabase.from("tasks").insert(payload).select().single();
      if (data) setTasks(prev => [data, ...prev]);
    }
    setSaving(false); setSheetOpen(false);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    await supabase.from("tasks").delete().eq("id", deleteTarget.id);
    setTasks(prev => prev.filter(t => t.id !== deleteTarget.id));
    setDeleting(false); setDeleteTarget(null);
  }

  async function onDragEnd(result) {
    const { draggableId, destination } = result;
    if (!destination) return;
    const newStatus = destination.droppableId;
    await supabase.from("tasks").update({ status: newStatus }).eq("id", draggableId);
    setTasks(prev => prev.map(t => t.id === draggableId ? { ...t, status: newStatus } : t));
  }

  function deadlineClass(dueDate, status) {
    if (!dueDate || status === "done") return null;
    const d = new Date(dueDate), now = new Date();
    d.setHours(23, 59, 59, 999);
    const diff = (d - now) / (1000 * 60 * 60 * 24);
    if (diff < 0) return { color: "#f87171", icon: AlertTriangle, label: "Overdue" };
    if (diff <= 3) return { color: "#fbbf24", icon: Clock, label: "Due soon" };
    return { color: "#94a3b8", icon: Calendar, label: new Date(dueDate).toLocaleDateString() };
  }

  const inputStyle = { background: "#111827", border: "1px solid #334155", color: "#f1f5f9" };

  if (loading) return <div className="flex justify-center h-64 items-center"><div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"/></div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">Task Manager</h1><p className="text-sm mt-1" style={{ color: "#94a3b8" }}>{tasks.length} global tasks tracking</p></div>
        <div className="flex items-center gap-3">
          <div className="flex rounded-xl overflow-hidden border border-[#334155]">
            <button onClick={() => setView("kanban")} className="px-3.5 py-2 flex gap-1.5 text-xs font-medium transition-all" style={{ background: view === "kanban" ? "#1e293b" : "transparent", color: view === "kanban" ? "#fff" : "#64748b" }}><LayoutGrid size={14} />Kanban</button>
            <button onClick={() => setView("list")} className="px-3.5 py-2 flex gap-1.5 text-xs font-medium transition-all border-l border-[#334155]" style={{ background: view === "list" ? "#1e293b" : "transparent", color: view === "list" ? "#fff" : "#64748b" }}><List size={14} />List</button>
          </div>
          <button onClick={openAdd} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-semibold hover:opacity-90">
            <Plus size={18} />Add Task
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks..." className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" style={inputStyle} />
        </div>
        <select value={filterProject} onChange={e => setFilterProject(e.target.value)} className="px-3 py-2.5 rounded-xl text-sm focus:outline-none" style={inputStyle}>
          <option value="all">All Projects</option>
          <option value="none">No Project Linked</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
        </select>
        <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} className="px-3 py-2.5 rounded-xl text-sm focus:outline-none" style={inputStyle}>
          <option value="all">All Priorities</option>
          {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
        </select>
      </div>

      {/* ─── KANBAN VIEW ─── */}
      {view === "kanban" && (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6" style={{ minHeight: 400 }}>
            {STATUSES.map(status => {
              const m = STATUS_META[status];
              const items = columns[status] || [];
              return (
                <div key={status} className="rounded-2xl flex flex-col" style={{ background: "#0f172a", border: "1px solid #1e293b" }}>
                  <div className="px-4 py-3 flex justify-between items-center" style={{ borderBottom: `2px solid ${m.dot}` }}>
                    <div className="flex gap-2 items-center"><div className="w-2.5 h-2.5 rounded-full" style={{ background: m.dot }} /><span className="text-xs font-semibold text-white uppercase tracking-wider">{m.label}</span></div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: m.bg, color: m.color }}>{items.length}</span>
                  </div>

                  <Droppable droppableId={status}>
                    {(provided, snapshot) => (
                      <div ref={provided.innerRef} {...provided.droppableProps} className="flex-1 p-3 space-y-3" style={{ minHeight: 150, background: snapshot.isDraggingOver ? "rgba(59,130,246,0.03)" : "transparent", transition: "background .2s" }}>
                        {items.map((task, i) => {
                          const pMeta = PRIORITY_META[task.priority] || PRIORITY_META.medium;
                          const dl = deadlineClass(task.due_date, task.status);
                          return (
                            <Draggable key={task.id} draggableId={task.id} index={i}>
                              {(prov, snap) => (
                                <div ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps} className="rounded-xl p-4 cursor-grab active:cursor-grabbing group relative" style={{ background: "#1e293b", border: `1px solid ${snap.isDragging ? m.border : "#334155"}`, boxShadow: snap.isDragging ? `0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px ${m.border}` : "0 2px 4px rgba(0,0,0,0.1)", ...prov.draggableProps.style }}>
                                  
                                  <div className="flex items-start justify-between gap-2 mb-2">
                                    <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider" style={{ background: `${pMeta.color}15`, color: pMeta.color }}>
                                      <pMeta.icon size={10} /> {pMeta.label}
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button onClick={() => openEdit(task)} className="p-1 rounded bg-black/20 text-slate-400 hover:text-blue-400"><Pencil size={12}/></button>
                                      <button onClick={() => setDeleteTarget(task)} className="p-1 rounded bg-black/20 text-slate-400 hover:text-red-400"><Trash2 size={12}/></button>
                                    </div>
                                  </div>

                                  <h4 className="text-sm font-medium text-white leading-snug mb-1">{task.title}</h4>
                                  
                                  {task.project_id && (
                                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-3">
                                      <FolderKanban size={11} className="text-blue-400" />
                                      <Link to={`/admin/projects/${task.project_id}`} className="hover:text-blue-400 hover:underline">{projMap[task.project_id]}</Link>
                                    </div>
                                  )}

                                  {dl && (
                                    <div className="flex items-center gap-1.5 text-[11px] font-medium" style={{ color: dl.color }}>
                                      <dl.icon size={12} /> {dl.label === "Overdue" ? <span className="bg-red-500/20 px-1.5 rounded text-red-400">OVERDUE</span> : dl.label}
                                    </div>
                                  )}
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      )}

      {/* ─── LIST VIEW ─── */}
      {view === "list" && (
        <div className="rounded-2xl overflow-hidden" style={{ background: "#1e293b", border: "1px solid #334155" }}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#334155] bg-[#0f172a] text-slate-400 font-semibold">
                <th className="px-5 py-3.5 text-left">Task</th>
                <th className="px-5 py-3.5 text-left">Priority</th>
                <th className="px-5 py-3.5 text-left">Project</th>
                <th className="px-5 py-3.5 text-left">Due Date</th>
                <th className="px-5 py-3.5 text-left">Status</th>
                <th className="px-5 py-3.5 text-right flex-shrink-0"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="py-12 text-center text-slate-500">No tasks found.</td></tr>
              ) : filtered.map(task => {
                const sMeta = STATUS_META[task.status] || STATUS_META.todo;
                const pMeta = PRIORITY_META[task.priority] || PRIORITY_META.medium;
                const dl = deadlineClass(task.due_date, task.status);
                
                return (
                  <tr key={task.id} className="border-b border-[#334155] hover:bg-white/[0.02]">
                    <td className="px-5 py-4 font-medium text-white">{task.title}</td>
                    <td className="px-5 py-4"><span className="flex items-center gap-1 text-[11px] font-bold" style={{ color: pMeta.color }}><pMeta.icon size={12}/>{pMeta.label}</span></td>
                    <td className="px-5 py-4 text-slate-400">{task.project_id ? projMap[task.project_id] : "—"}</td>
                    <td className="px-5 py-4 text-[13px]">{dl ? <span className="flex items-center gap-1.5" style={{ color: dl.color }}><dl.icon size={13}/>{dl.label}</span> : <span className="text-slate-500">—</span>}</td>
                    <td className="px-5 py-4">
                       <select value={task.status} onChange={async e => {
                         const n = e.target.value;
                         await supabase.from("tasks").update({ status: n }).eq("id", task.id);
                         setTasks(prev => prev.map(t => t.id === task.id ? {...t, status: n} : t));
                       }} className="px-2.5 py-1.5 rounded-lg text-xs font-semibold focus:outline-none appearance-none cursor-pointer" style={{ background: sMeta.bg, color: sMeta.color, border: `1px solid ${sMeta.border}` }}>
                         {STATUSES.map(s => <option key={s} value={s} className="bg-slate-800 text-white">{STATUS_META[s].label}</option>)}
                       </select>
                    </td>
                    <td className="px-5 py-4 text-right">
                       <div className="flex justify-end gap-1">
                         <button onClick={() => openEdit(task)} className="p-1.5 rounded hover:bg-white/10 text-slate-400"><Pencil size={14}/></button>
                         <button onClick={() => setDeleteTarget(task)} className="p-1.5 rounded hover:bg-red-500/10 text-slate-400 hover:text-red-400"><Trash2 size={14}/></button>
                       </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Add/Edit Sheet ── */}
      {sheetOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]" onClick={() => setSheetOpen(false)} />
          <div className="fixed top-0 right-0 bottom-0 w-full max-w-md z-[61] flex flex-col bg-[#0f172a] shadow-2xl border-l border-[#334155]" style={{ animation: "slideIn .25s ease-out" }}>
            <div className="flex justify-between items-center px-6 py-5 border-b border-[#334155]">
              <h2 className="text-lg font-bold text-white">{editing ? "Edit Task" : "New Task"}</h2>
              <button onClick={() => setSheetOpen(false)} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400"><X size={20}/></button>
            </div>
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              <div><label className="block text-sm font-medium mb-1.5 text-slate-300">Title</label><input type="text" value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} required className="w-full px-4 py-3 text-sm rounded-xl focus:outline-none focus:border-blue-500" style={inputStyle}/></div>
              
              <div><label className="block text-sm font-medium mb-1.5 text-slate-300">Description</label><textarea rows={3} value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} className="w-full px-4 py-3 text-sm rounded-xl resize-none focus:outline-none focus:border-blue-500" style={inputStyle}/></div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-slate-300">Priority</label>
                  <select value={form.priority} onChange={e => setForm(p => ({...p, priority: e.target.value}))} className="w-full px-4 py-3 text-sm rounded-xl focus:outline-none" style={inputStyle}>
                    {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-slate-300">Status</label>
                  <select value={form.status} onChange={e => setForm(p => ({...p, status: e.target.value}))} className="w-full px-4 py-3 text-sm rounded-xl focus:outline-none" style={inputStyle}>
                    {STATUSES.map(s => <option key={s} value={s}>{STATUS_META[s].label}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-slate-300">Due Date</label>
                <input type="date" value={form.due_date} onChange={e => setForm(p => ({...p, due_date: e.target.value}))} className="w-full px-4 py-3 text-sm rounded-xl focus:outline-none focus:border-blue-500" style={inputStyle}/>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-slate-300">Project Linked</label>
                <select value={form.project_id} onChange={e => setForm(p => ({...p, project_id: e.target.value === "none" ? "" : e.target.value}))} className="w-full px-4 py-3 text-sm rounded-xl focus:outline-none" style={inputStyle}>
                  <option value="none">No Project</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
              </div>

              <div className="pt-4">
                <button type="submit" disabled={saving} className="w-full flex justify-center py-3.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors">
                  {saving ? "Saving..." : "Save Task"}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* Delete Dialog */}
      {deleteTarget && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70]" onClick={() => setDeleteTarget(null)} />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm rounded-2xl p-6 z-[71] space-y-4 shadow-2xl" style={{ background: "#1e293b", border: "1px solid #334155" }}>
            <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center bg-red-500/10"><Trash2 size={24} className="text-red-400" /></div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-white">Delete Task</h3>
              <p className="text-sm mt-2 text-slate-400">Are you sure you want to delete <span className="text-white">"{deleteTarget.title}"</span>?</p>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2.5 rounded-xl border border-slate-600 text-slate-300 font-medium hover:bg-slate-800">Cancel</button>
              <button onClick={handleDelete} disabled={deleting} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 disabled:opacity-50">Delete</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
