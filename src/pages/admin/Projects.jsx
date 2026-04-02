import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { usePermissions } from "../../hooks/usePermissions";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  Plus, LayoutGrid, List, Search, X, Save, Calendar, DollarSign,
  Clock, AlertTriangle, CheckCircle2, ArrowUpDown, Pencil, Trash2,
  SlidersHorizontal, ChevronRight, Users, FolderKanban,
} from "lucide-react";

const STATUSES = ["lead", "in_progress", "review", "completed"];
const ALL_STATUSES = [...STATUSES, "cancelled"];

const STATUS_META = {
  lead: { label: "Lead", color: "#60a5fa", bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.2)", dot: "#3b82f6" },
  in_progress: { label: "In Progress", color: "#fbbf24", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)", dot: "#f59e0b" },
  review: { label: "Review", color: "#c084fc", bg: "rgba(168,85,247,0.08)", border: "rgba(168,85,247,0.2)", dot: "#a855f7" },
  completed: { label: "Completed", color: "#4ade80", bg: "rgba(34,197,94,0.08)", border: "rgba(34,197,94,0.2)", dot: "#22c55e" },
  cancelled: { label: "Cancelled", color: "#f87171", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.2)", dot: "#ef4444" },
};

const EMPTY = { title: "", description: "", client_id: "", status: "lead", budget: "", currency: "INR", start_date: "", deadline: "", tech_stack: "", category: "", github_url: "", live_url: "" };

function deadlineClass(deadline) {
  if (!deadline) return null;
  const d = new Date(deadline), now = new Date();
  const diff = (d - now) / (1000 * 60 * 60 * 24);
  if (diff < 0) return { color: "#f87171", icon: AlertTriangle, label: "Overdue" };
  if (diff <= 7) return { color: "#fbbf24", icon: Clock, label: "Due soon" };
  return { color: "#4ade80", icon: CheckCircle2, label: "On track" };
}

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("kanban");
  const [search, setSearch] = useState("");
  const [filterClient, setFilterClient] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortAsc, setSortAsc] = useState(false);
  const { hasPermission } = usePermissions();

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
    const [p, c, t] = await Promise.all([
      supabase.from("projects").select("*").order("created_at", { ascending: false }),
      supabase.from("clients").select("id, name"),
      supabase.from("tasks").select("id, project_id, status")
    ]);
    const projData = p.data || [];
    const taskData = t.data || [];
    
    // Attach tasks to projects
    const enriched = projData.map(proj => {
      const pTasks = taskData.filter(t => t.project_id === proj.id);
      return { ...proj, _tasks: pTasks };
    });

    setProjects(enriched);
    if (c.data) setClients(c.data);
    setLoading(false);
  }

  const clientMap = useMemo(() => Object.fromEntries(clients.map(c => [c.id, c.name])), [clients]);

  // Filter
  const filtered = projects
    .filter(p => filterStatus === "all" || p.status === filterStatus)
    .filter(p => filterClient === "all" || p.client_id === filterClient)
    .filter(p => {
      if (!search) return true;
      const s = search.toLowerCase();
      return (p.title || "").toLowerCase().includes(s) || (p.description || "").toLowerCase().includes(s);
    });

  // Kanban columns
  const columns = useMemo(() => {
    const cols = {};
    STATUSES.forEach(s => { cols[s] = filtered.filter(p => p.status === s); });
    return cols;
  }, [filtered]);

  // List sort
  const sorted = [...filtered].sort((a, b) => {
    let va = a[sortBy], vb = b[sortBy];
    if (sortBy === "title") { va = (va || "").toLowerCase(); vb = (vb || "").toLowerCase(); }
    if (va < vb) return sortAsc ? -1 : 1;
    if (va > vb) return sortAsc ? 1 : -1;
    return 0;
  });

  function openAdd() { setEditing(null); setForm(EMPTY); setSheetOpen(true); }
  function openEdit(proj) {
    setEditing(proj);
    setForm({
      title: proj.title || "", description: proj.description || "", client_id: proj.client_id || "",
      status: proj.status || "lead", budget: proj.budget || "", currency: proj.currency || "INR",
      start_date: proj.start_date || "", deadline: proj.deadline || "",
      tech_stack: (proj.tech_stack || []).join(", "), category: proj.category || "",
      github_url: proj.github_url || "", live_url: proj.live_url || "",
    });
    setSheetOpen(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, budget: parseFloat(form.budget) || 0, tech_stack: form.tech_stack ? form.tech_stack.split(",").map(s => s.trim()).filter(Boolean) : [] };
    if (!payload.client_id) payload.client_id = null;
    if (!payload.start_date) payload.start_date = null;
    if (!payload.deadline) payload.deadline = null;
    delete payload.id; delete payload.created_at; delete payload._tasks;
    if (editing) {
      const { data } = await supabase.from("projects").update(payload).eq("id", editing.id).select().single();
      if (data) setProjects(prev => prev.map(p => p.id === data.id ? data : p));
    } else {
      const { data } = await supabase.from("projects").insert(payload).select().single();
      if (data) setProjects(prev => [data, ...prev]);
    }
    setSaving(false); setSheetOpen(false);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    await supabase.from("projects").delete().eq("id", deleteTarget.id);
    setProjects(prev => prev.filter(p => p.id !== deleteTarget.id));
    setDeleting(false); setDeleteTarget(null);
  }

  async function onDragEnd(result) {
    const { draggableId, destination } = result;
    if (!destination) return;
    const newStatus = destination.droppableId;
    await supabase.from("projects").update({ status: newStatus }).eq("id", draggableId);
    setProjects(prev => prev.map(p => p.id === draggableId ? { ...p, status: newStatus } : p));
  }

  function toggleSort(field) { if (sortBy === field) setSortAsc(!sortAsc); else { setSortBy(field); setSortAsc(true); } }

  const inputStyle = { background: "#111827", border: "1px solid #334155", color: "#f1f5f9" };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">Projects</h1><p className="text-sm mt-1" style={{ color: "#94a3b8" }}>{projects.length} total projects</p></div>
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex rounded-xl overflow-hidden" style={{ border: "1px solid #334155" }}>
            <button onClick={() => setView("kanban")} className="px-3.5 py-2 flex items-center gap-1.5 text-xs font-medium transition-all" style={{ background: view === "kanban" ? "#1e293b" : "transparent", color: view === "kanban" ? "#fff" : "#64748b" }}>
              <LayoutGrid size={14} />Kanban
            </button>
            <button onClick={() => setView("list")} className="px-3.5 py-2 flex items-center gap-1.5 text-xs font-medium transition-all" style={{ background: view === "list" ? "#1e293b" : "transparent", color: view === "list" ? "#fff" : "#64748b", borderLeft: "1px solid #334155" }}>
              <List size={14} />List
            </button>
          </div>
          {hasPermission("projects", "can_create") && <button onClick={openAdd} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-semibold" style={{ boxShadow: "0 4px 16px rgba(59,130,246,0.25)" }}>
            <Plus size={18} />Add Project
          </button>}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#64748b" }} />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects..." className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" style={inputStyle} />
        </div>
        <select value={filterClient} onChange={e => setFilterClient(e.target.value)} className="px-3 py-2.5 rounded-xl text-sm focus:outline-none" style={inputStyle}>
          <option value="all">All Clients</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <div className="flex items-center gap-1.5">
          <SlidersHorizontal size={14} style={{ color: "#64748b" }} />
          {["all", ...ALL_STATUSES].map(s => {
            const m = STATUS_META[s];
            return (
              <button key={s} onClick={() => setFilterStatus(s)} className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all" style={{
                background: filterStatus === s ? (m?.bg || "rgba(59,130,246,0.1)") : "transparent",
                color: filterStatus === s ? (m?.color || "#60a5fa") : "#475569",
                border: `1px solid ${filterStatus === s ? (m?.border || "rgba(59,130,246,0.3)") : "transparent"}`,
              }}>
                {s === "all" ? "All" : m?.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── KANBAN VIEW ─── */}
      {view === "kanban" && (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-4 gap-4" style={{ minHeight: 400 }}>
            {STATUSES.map(status => {
              const m = STATUS_META[status];
              const items = columns[status] || [];
              return (
                <div key={status} className="rounded-2xl flex flex-col" style={{ background: "#0f172a", border: "1px solid #1e293b" }}>
                  {/* Column Header */}
                  <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: `2px solid ${m.dot}` }}>
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: m.dot }} />
                      <span className="text-xs font-semibold text-white">{m.label}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: m.bg, color: m.color }}>{items.length}</span>
                  </div>

                  {/* Droppable Area */}
                  <Droppable droppableId={status}>
                    {(provided, snapshot) => (
                      <div ref={provided.innerRef} {...provided.droppableProps} className="flex-1 p-2 space-y-2 overflow-y-auto" style={{ minHeight: 60, background: snapshot.isDraggingOver ? "rgba(59,130,246,0.03)" : "transparent", transition: "background .2s" }}>
                        {items.map((proj, i) => {
                          const dl = deadlineClass(proj.deadline);
                          return (
                            <Draggable key={proj.id} draggableId={proj.id} index={i}>
                              {(prov, snap) => (
                                <div ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps} className="rounded-xl p-3.5 space-y-2.5 transition-shadow cursor-grab active:cursor-grabbing" style={{ background: "#1e293b", border: `1px solid ${snap.isDragging ? m.border : "#334155"}`, boxShadow: snap.isDragging ? `0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px ${m.border}` : "none", ...prov.draggableProps.style }}>
                                  {/* Title row */}
                                  <div className="flex items-start justify-between gap-2">
                                    <Link to={`/admin/projects/${proj.id}`} className="text-sm font-medium text-white hover:text-blue-400 transition-colors leading-snug">{proj.title}</Link>
                                    <div className="flex items-center gap-1 shrink-0">
                                      {hasPermission("projects", "can_edit") && <button onClick={() => openEdit(proj)} className="p-1.5 rounded-md transition-all hover:bg-white/10" style={{ color: "#475569" }}><Pencil size={12} /></button>}
                                      {hasPermission("projects", "can_delete") && <button onClick={() => setDeleteTarget(proj)} className="p-1.5 rounded-md transition-all hover:bg-red-500/10 text-[#475569] hover:text-red-400"><Trash2 size={12} /></button>}
                                    </div>
                                  </div>

                                  {/* Client */}
                                  {proj.client_id && clientMap[proj.client_id] && (
                                    <div className="flex items-center gap-1.5 text-[11px]" style={{ color: "#64748b" }}>
                                      <Users size={11} />{clientMap[proj.client_id]}
                                    </div>
                                  )}

                                  {/* Bottom row */}
                                  <div className="flex items-center justify-between">
                                    {proj.budget > 0 && (
                                      <span className="flex items-center gap-1 text-[11px] font-medium" style={{ color: "#94a3b8" }}>
                                        <DollarSign size={11} />{proj.currency} {Number(proj.budget).toLocaleString()}
                                      </span>
                                    )}
                                    {dl && (
                                      <span className="flex items-center gap-1 text-[10px] font-semibold" style={{ color: dl.color }}>
                                        <dl.icon size={11} />{dl.label}
                                      </span>
                                    )}
                                  </div>

                                  {/* Progress Bar (if tasks exist) */}
                                  {proj._tasks && proj._tasks.length > 0 && (
                                    <div className="pt-2 mt-2" style={{ borderTop: "1px dashed rgba(255,255,255,0.05)" }}>
                                      <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-[9px] font-bold text-slate-500 uppercase">Tasks</span>
                                        <span className="text-[9px] font-bold text-slate-400">{proj._tasks.filter(t => t.status === 'done').length}/{proj._tasks.length}</span>
                                      </div>
                                      <div className="h-1.5 rounded-full overflow-hidden bg-slate-800">
                                        <div className="h-full rounded-full transition-all duration-500" style={{
                                          width: `${(proj._tasks.filter(t => t.status === 'done').length / proj._tasks.length) * 100}%`,
                                          background: proj._tasks.filter(t => t.status === 'done').length === proj._tasks.length ? "#22c55e" : "#3b82f6"
                                        }} />
                                      </div>
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
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid #334155" }}>
                {[{ k: "title", l: "Project" }, { k: "client_id", l: "Client" }, { k: "status", l: "Status" }, { k: "budget", l: "Budget" }, { k: "deadline", l: "Deadline" }, { k: "created_at", l: "Created" }].map(c => (
                  <th key={c.k} onClick={() => toggleSort(c.k)} className="px-5 py-3.5 text-left text-xs font-semibold cursor-pointer select-none hover:text-white transition-colors" style={{ color: "#94a3b8" }}>
                    <span className="flex items-center gap-1.5">{c.l}<ArrowUpDown size={12} style={{ opacity: sortBy === c.k ? 1 : 0.3 }} /></span>
                  </th>
                ))}
                <th className="px-5 py-3.5 text-right text-xs font-semibold" style={{ color: "#94a3b8" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-16 text-center">
                  <FolderKanban size={40} className="mx-auto mb-3" style={{ color: "rgba(148,163,184,0.2)" }} />
                  <p className="text-sm" style={{ color: "#94a3b8" }}>No projects found</p>
                </td></tr>
              ) : sorted.map(proj => {
                const m = STATUS_META[proj.status] || STATUS_META.lead;
                const dl = deadlineClass(proj.deadline);
                return (
                  <tr key={proj.id} className="transition-colors hover:bg-white/[0.02]" style={{ borderBottom: "1px solid #334155" }}>
                    <td className="px-5 py-4">
                      <Link to={`/admin/projects/${proj.id}`} className="group">
                        <p className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors flex items-center gap-1">{proj.title}<ChevronRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" /></p>
                        {proj.description && <p className="text-xs mt-0.5 truncate max-w-[240px]" style={{ color: "#475569" }}>{proj.description}</p>}
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-sm" style={{ color: "#94a3b8" }}>{proj.client_id ? clientMap[proj.client_id] || "—" : "—"}</td>
                    <td className="px-5 py-4"><span className="px-2.5 py-1 rounded-full text-[11px] font-semibold" style={{ background: m.bg, color: m.color, border: `1px solid ${m.border}` }}>{m.label}</span></td>
                    <td className="px-5 py-4 text-sm" style={{ color: "#94a3b8" }}>{proj.budget > 0 ? `${proj.currency} ${Number(proj.budget).toLocaleString()}` : "—"}</td>
                    <td className="px-5 py-4">{proj.deadline ? <span className="flex items-center gap-1.5 text-xs" style={{ color: dl?.color || "#64748b" }}>{dl && <dl.icon size={13} />}{new Date(proj.deadline).toLocaleDateString()}</span> : <span className="text-xs" style={{ color: "#475569" }}>—</span>}</td>
                    <td className="px-5 py-4 text-xs" style={{ color: "#475569" }}>{new Date(proj.created_at).toLocaleDateString()}</td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {hasPermission("projects", "can_edit") && <button onClick={() => openEdit(proj)} className="p-2 rounded-lg hover:bg-blue-500/10" style={{ color: "#94a3b8" }}><Pencil size={15} /></button>}
                        {hasPermission("projects", "can_delete") && <button onClick={() => setDeleteTarget(proj)} className="p-2 rounded-lg hover:bg-red-500/10" style={{ color: "#94a3b8" }}><Trash2 size={15} /></button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Sheet (Add/Edit) ── */}
      {sheetOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]" onClick={() => setSheetOpen(false)} />
          <div className="fixed top-0 right-0 bottom-0 w-full max-w-md z-[61] flex flex-col overflow-y-auto" style={{ background: "#0f172a", borderLeft: "1px solid #334155", animation: "slideIn .25s ease-out" }}>
            <style>{`@keyframes slideIn{from{transform:translateX(100%)}to{transform:translateX(0)}}`}</style>
            <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: "1px solid #334155" }}>
              <h2 className="text-lg font-bold text-white">{editing ? "Edit Project" : "New Project"}</h2>
              <div className="flex items-center gap-2">
                {editing && <button type="button" onClick={() => setDeleteTarget(editing)} className="p-2 rounded-xl hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-colors"><Trash2 size={16} /></button>}
                <button type="button" onClick={() => setSheetOpen(false)} className="p-1.5 rounded-lg hover:bg-white/10" style={{ color: "#94a3b8" }}><X size={20} /></button>
              </div>
            </div>
            <form onSubmit={handleSave} className="flex-1 px-6 py-6 space-y-5 overflow-y-auto">
              <div><label className="block text-sm font-medium mb-2" style={{ color: "#94a3b8" }}>Title *</label><input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required placeholder="Project name" className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" style={inputStyle} /></div>
              <div><label className="block text-sm font-medium mb-2" style={{ color: "#94a3b8" }}>Description</label><textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} placeholder="Brief description..." className="w-full px-4 py-3 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50" style={inputStyle} /></div>

              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-2" style={{ color: "#94a3b8" }}>Client</label><select value={form.client_id} onChange={e => setForm(p => ({ ...p, client_id: e.target.value }))} className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none" style={inputStyle}><option value="">No client</option>{clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "#94a3b8" }}>Status</label>
                  <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none" style={inputStyle}>
                    {ALL_STATUSES.map(s => <option key={s} value={s}>{STATUS_META[s].label}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2"><label className="block text-sm font-medium mb-2" style={{ color: "#94a3b8" }}>Budget</label><input type="number" step="0.01" value={form.budget} onChange={e => setForm(p => ({ ...p, budget: e.target.value }))} placeholder="0.00" className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" style={inputStyle} /></div>
                <div><label className="block text-sm font-medium mb-2" style={{ color: "#94a3b8" }}>Currency</label><select value={form.currency} onChange={e => setForm(p => ({ ...p, currency: e.target.value }))} className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none" style={inputStyle}><option>INR</option><option>USD</option><option>EUR</option><option>GBP</option></select></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-2" style={{ color: "#94a3b8" }}>Start Date</label><input type="date" value={form.start_date} onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))} className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" style={inputStyle} /></div>
                <div><label className="block text-sm font-medium mb-2" style={{ color: "#94a3b8" }}>Deadline</label><input type="date" value={form.deadline} onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))} className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" style={inputStyle} /></div>
              </div>

              <div><label className="block text-sm font-medium mb-2" style={{ color: "#94a3b8" }}>Tech Stack (comma-separated)</label><input type="text" value={form.tech_stack} onChange={e => setForm(p => ({ ...p, tech_stack: e.target.value }))} placeholder="React, Node.js" className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" style={inputStyle} /></div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setSheetOpen(false)} className="flex-1 py-2.5 rounded-xl text-sm font-medium hover:bg-white/10" style={{ color: "#94a3b8", border: "1px solid #334155" }}>Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-semibold disabled:opacity-50"><Save size={15} />{saving ? "Saving..." : editing ? "Update" : "Create"}</button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* ── Delete Dialog ── */}
      {deleteTarget && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70]" onClick={() => setDeleteTarget(null)} />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm rounded-2xl p-6 z-[71] space-y-4" style={{ background: "#1e293b", border: "1px solid #334155", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
            <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center" style={{ background: "rgba(239,68,68,0.1)" }}><Trash2 size={22} style={{ color: "#f87171" }} /></div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-white">Delete Project</h3>
              <p className="text-sm mt-2" style={{ color: "#94a3b8" }}>Delete <span className="text-white font-medium">{deleteTarget.title}</span>? This removes all linked tasks and files.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2.5 rounded-xl text-sm font-medium" style={{ color: "#94a3b8", border: "1px solid #334155" }}>Cancel</button>
              <button onClick={handleDelete} disabled={deleting} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50" style={{ background: "#ef4444" }}>{deleting ? "Deleting..." : "Delete"}</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
