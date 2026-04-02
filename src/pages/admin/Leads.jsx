import { useEffect, useState, useMemo, useRef } from "react";
import { supabase } from "../../lib/supabase";
import { usePermissions } from "../../hooks/usePermissions";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  Plus, Search, X, Save, Calendar, Clock, AlertTriangle,
  CheckCircle2, Pencil, Trash2, Crosshair, MapPin, Target,
  FileDown, Upload, MessageSquarePlus, UserCheck, Flame
} from "lucide-react";

const STATUSES = ["new", "contacted", "follow_up", "proposal_sent", "converted", "lost"];

const STATUS_META = {
  new: { label: "New Lead", color: "#60a5fa", bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.2)", dot: "#3b82f6" },
  contacted: { label: "Contacted", color: "#a78bfa", bg: "rgba(167,139,250,0.08)", border: "rgba(167,139,250,0.2)", dot: "#a78bfa" },
  follow_up: { label: "Follow Up", color: "#fbbf24", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)", dot: "#f59e0b" },
  proposal_sent: { label: "Proposal Sent", color: "#38bdf8", bg: "rgba(56,189,248,0.08)", border: "rgba(56,189,248,0.2)", dot: "#38bdf8" },
  converted: { label: "Converted", color: "#4ade80", bg: "rgba(34,197,94,0.08)", border: "rgba(34,197,94,0.2)", dot: "#22c55e" },
  lost: { label: "Lost", color: "#f87171", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.2)", dot: "#ef4444" },
};

const EMPTY_LEAD = { business_name: "", contact_name: "", email: "", phone: "", city: "", source: "", status: "new", next_follow_up: "", notes: [] };

function deadlineClass(deadline, status) {
  if (!deadline || status === "converted" || status === "lost") return null;
  const d = new Date(deadline), now = new Date();
  const diff = (d - now) / (1000 * 60 * 60 * 24);
  if (diff < 0) return { color: "#f87171", icon: AlertTriangle, label: "Overdue" };
  if (diff <= 3) return { color: "#fbbf24", icon: Flame, label: "Due Soon" };
  return { color: "#4ade80", icon: Calendar, label: "Scheduled" };
}

export default function Leads() {
  const { hasPermission } = usePermissions();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const fileInputRef = useRef(null);

  // Sheet
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_LEAD);
  const [saving, setSaving] = useState(false);
  
  // Delete Tracker
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Notes
  const [newNote, setNewNote] = useState("");

  useEffect(() => { fetchLeads(); }, []);

  async function fetchLeads() {
    const { data } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
    if (data) {
      // Ensure notes is an array
      setLeads(data.map(l => ({ ...l, notes: Array.isArray(l.notes) ? l.notes : [] })));
    }
    setLoading(false);
  }

  // Filter
  const filtered = leads.filter(l => {
    if (!search) return true;
    const s = search.toLowerCase();
    const searchable = `${l.business_name || ""} ${l.contact_name || ""} ${l.city || ""} ${l.source || ""}`.toLowerCase();
    return searchable.includes(s);
  });

  // Kanban Columns
  const columns = useMemo(() => {
    const cols = {};
    STATUSES.forEach(s => { cols[s] = filtered.filter(l => l.status === s); });
    return cols;
  }, [filtered]);

  // Drag & Drop
  async function onDragEnd(result) {
    const { draggableId, destination, source } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId;
    
    // Optimistic update
    setLeads(prev => prev.map(l => l.id === draggableId ? { ...l, status: newStatus } : l));
    
    // DB Update
    await supabase.from("leads").update({ status: newStatus }).eq("id", draggableId);
  }

  // Edit / Add
  function openAdd() { setEditing(null); setForm(EMPTY_LEAD); setSheetOpen(true); }
  function openEdit(lead) {
    setEditing(lead);
    setForm({
      business_name: lead.business_name || "",
      contact_name: lead.contact_name || "",
      email: lead.email || "",
      phone: lead.phone || "",
      city: lead.city || "",
      source: lead.source || "",
      status: lead.status || "new",
      next_follow_up: lead.next_follow_up || "",
      notes: Array.isArray(lead.notes) ? lead.notes : [],
    });
    setSheetOpen(true);
  }

  async function handleSave(e) {
    if (e) e.preventDefault();
    setSaving(true);
    const payload = { ...form };
    if (!payload.next_follow_up) payload.next_follow_up = null;

    if (editing) {
      const { data } = await supabase.from("leads").update(payload).eq("id", editing.id).select().single();
      if (data) setLeads(prev => prev.map(l => l.id === data.id ? { ...data, notes: Array.isArray(data.notes) ? data.notes : [] } : l));
    } else {
      const { data } = await supabase.from("leads").insert(payload).select().single();
      if (data) setLeads(prev => [{ ...data, notes: Array.isArray(data.notes) ? data.notes : [] }, ...prev]);
    }
    setSaving(false);
    setSheetOpen(false);
  }

  async function handleAddNote() {
    if (!newNote.trim() || !editing) return;
    
    const timestampedNote = { text: newNote.trim(), created_at: new Date().toISOString() };
    const updatedNotes = [...form.notes, timestampedNote];
    
    // Update local form state immediately to feel snappy
    setForm(prev => ({ ...prev, notes: updatedNotes }));
    setNewNote("");

    // Push directly to DB and update main state
    const { data } = await supabase.from("leads").update({ notes: updatedNotes }).eq("id", editing.id).select().single();
    if (data) {
       setLeads(prev => prev.map(l => l.id === data.id ? { ...data, notes: Array.isArray(data.notes) ? data.notes : [] } : l));
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const { error } = await supabase.from("leads").delete().eq("id", deleteTarget.id);
    if (error) {
       console.error("Delete error:", error);
       alert("Could not delete lead: " + error.message);
       setDeleting(false);
       return;
    }
    setLeads(prev => prev.filter(l => l.id !== deleteTarget.id));
    if (editing?.id === deleteTarget.id) setSheetOpen(false);
    setDeleting(false);
    setDeleteTarget(null);
  }

  async function handleConvert() {
    if (!editing) return;
    
    // Ensure contact exists
    if (!form.business_name && !form.contact_name) {
      alert("Lead must have at least a business name or contact name to convert to a client.");
      return;
    }

    setSaving(true);
    
    // 1. Create client
    const clientPayload = {
      name: form.contact_name || form.business_name,
      company: form.business_name || null,
      email: form.email || null,
      phone: form.phone || null,
      city: form.city || null,
      status: 'active', // default for converted leads
    };

    const { error: clientError } = await supabase.from("clients").insert(clientPayload);
    
    if (clientError) {
      console.error("Error creating client:", clientError);
      alert("Failed to convert lead to client.");
      setSaving(false);
      return;
    }

    // 2. Mark lead as converted
    const { data: updatedLead } = await supabase.from("leads").update({ status: 'converted' }).eq("id", editing.id).select().single();
    if (updatedLead) {
      setLeads(prev => prev.map(l => l.id === updatedLead.id ? { ...updatedLead, notes: Array.isArray(updatedLead.notes) ? updatedLead.notes : [] } : l));
      alert("Lead successfully converted to Client!");
      setSheetOpen(false);
    }
    setSaving(false);
  }

  // Native CSV Parser to avoid library dependency issues
  function parseCSV(text) {
    const lines = text.split(/\r?\n/).filter(line => line.trim() !== "");
    if (lines.length < 2) return [];
    
    // Parse a line considering quotes
    const parseLine = (line) => {
      const vals = [];
      let val = "", inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        let c = line[i];
        if (c === '"') { inQuotes = !inQuotes; continue; }
        if (c === ',' && !inQuotes) { vals.push(val.trim()); val = ""; continue; }
        val += c;
      }
      vals.push(val.trim());
      return vals;
    };

    const headers = parseLine(lines[0]).map(h => h.toLowerCase());
    return lines.slice(1).map(line => {
      const values = parseLine(line);
      const row = {};
      headers.forEach((h, i) => { row[h] = values[i] || null; });
      return row;
    });
  }

  // Bulk CSV Import
  function handleCsvUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target.result;
      const rows = parseCSV(text);
      
      if (!rows || rows.length === 0) return alert("No valid rows found in CSV.");

      const mappedLeads = rows.map(r => ({
        business_name: r.business_name || r.company || r.business || null,
        contact_name: r.contact_name || r.name || r.contact || null,
        email: r.email || null,
        phone: r.phone || null,
        city: r.city || null,
        source: r.source || "CSV Import",
        status: "new",
        notes: []
      }));

      setLoading(true);
      const { data, error } = await supabase.from("leads").insert(mappedLeads).select();
      if (error) {
         console.error("Import error:", error);
         alert("Failed to import CSV.");
      } else if (data) {
         setLeads(prev => [...data.map(d => ({ ...d, notes: [] })), ...prev]);
         alert(`Successfully imported ${data.length} leads!`);
      }
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsText(file);
  }

  const inputStyle = { background: "#111827", border: "1px solid #334155", color: "#f1f5f9" };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Target className="text-blue-500" /> Leads Pipeline</h1>
          <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>{leads.length} total leads tracked</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* CSV Input (Hidden) */}
          <input type="file" accept=".csv" ref={fileInputRef} className="hidden" onChange={handleCsvUpload} />
          
          <div className="relative flex-1 min-w-[150px] sm:min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#64748b" }} />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search leads..." className="w-full pl-9 pr-4 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" style={inputStyle} />
          </div>

          {hasPermission("leads", "can_create") && <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors" style={{ color: "#e2e8f0", border: "1px solid #334155" }}>
            <Upload size={16} /> <span className="hidden sm:inline">Import CSV</span>
          </button>}
          
          {hasPermission("leads", "can_create") && <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-semibold hover:opacity-90 shadow-lg shadow-blue-500/20">
            <Plus size={16} /> Add Lead
          </button>}
        </div>
      </div>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: "calc(100vh - 200px)" }}>
          {STATUSES.map(status => {
            const m = STATUS_META[status];
            const items = columns[status] || [];
            return (
              <div key={status} className="rounded-2xl flex flex-col shrink-0 w-[280px]" style={{ background: "#0f172a", border: "1px solid #1e293b" }}>
                {/* Column Header */}
                <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: `2px solid ${m.dot}` }}>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: m.dot }} />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">{m.label}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: m.bg, color: m.color }}>{items.length}</span>
                </div>

                {/* Droppable Container */}
                <Droppable droppableId={status}>
                  {(provided, snapshot) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} className="flex-1 p-2 space-y-2 overflow-y-auto min-h-[100px]" style={{ background: snapshot.isDraggingOver ? "rgba(255,255,255,0.02)" : "transparent", transition: "background .2s" }}>
                      {items.map((lead, i) => {
                        const dl = deadlineClass(lead.next_follow_up, lead.status);
                        return (
                          <Draggable key={lead.id} draggableId={lead.id} index={i}>
                            {(prov, snap) => (
                              <div ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps} onClick={() => openEdit(lead)} className="rounded-xl p-3.5 space-y-2 transition-shadow cursor-pointer select-none" style={{ background: "#1e293b", border: `1px solid ${snap.isDragging ? m.border : "#334155"}`, boxShadow: snap.isDragging ? `0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px ${m.border}` : "none", ...prov.draggableProps.style }}>
                                {/* Title row */}
                                <div>
                                  <h3 className="text-sm font-semibold text-white leading-tight">{lead.business_name || lead.contact_name}</h3>
                                  {lead.business_name && lead.contact_name && (
                                    <p className="text-[11px] mt-0.5" style={{ color: "#94a3b8" }}>{lead.contact_name}</p>
                                  )}
                                </div>

                                {/* Meta row */}
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px]" style={{ color: "#64748b" }}>
                                  {lead.city && <span className="flex items-center gap-1"><MapPin size={10} />{lead.city}</span>}
                                  {lead.source && <span className="flex items-center gap-1"><Crosshair size={10} />{lead.source}</span>}
                                </div>

                                {/* Bottom row */}
                                {(dl || (lead.notes && lead.notes.length > 0)) && (
                                  <div className="flex items-center justify-between pt-1 border-t border-[#334155]/50 mt-1">
                                    <div className="flex items-center gap-2">
                                      {lead.notes?.length > 0 && <span className="flex items-center gap-1 text-[10px] text-[#94a3b8]" title={`${lead.notes.length} notes`}><MessageSquarePlus size={10} />{lead.notes.length}</span>}
                                    </div>
                                    {dl && (
                                      <span className="flex items-center gap-1 text-[10px] font-bold" style={{ color: dl.color }}>
                                          <dl.icon size={10} />{dl.label}
                                      </span>
                                    )}
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

      {/* Editor Sheet */}
      {sheetOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]" onClick={() => setSheetOpen(false)} />
          <div className="fixed top-0 right-0 bottom-0 w-full max-w-lg z-[61] flex flex-col overflow-y-auto shadow-2xl" style={{ background: "#0f172a", borderLeft: "1px solid #334155", animation: "slideIn .2s ease-out" }}>
            <style>{`@keyframes slideIn{from{transform:translateX(100%)}to{transform:translateX(0)}}`}</style>
            
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid #334155" }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-500/10"><Target size={18} className="text-blue-500" /></div>
                <h2 className="text-lg font-bold text-white">{editing ? "Lead Details" : "New Lead"}</h2>
              </div>
              <div className="flex items-center gap-2">
                {editing && hasPermission("leads", "can_delete") && <button type="button" onClick={() => setDeleteTarget(editing)} className="p-2 rounded-xl hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-colors"><Trash2 size={16} /></button>}
                <button type="button" onClick={() => setSheetOpen(false)} className="p-2 rounded-xl hover:bg-white/10 text-[#94a3b8] transition-colors"><X size={16} /></button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <form id="lead-form" onSubmit={handleSave} className="p-6 space-y-5">
                {/* Convert Banner */}
                {editing && editing.status !== 'converted' && (
                  <div className="p-4 rounded-xl flex items-center justify-between gap-4 mb-2" style={{ background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.2)" }}>
                    <div>
                      <h4 className="text-sm font-bold text-white">Convert to Client</h4>
                      <p className="text-[11px] mt-0.5 text-green-400 opacity-80">Close the deal and move them to Client Management.</p>
                    </div>
                    {hasPermission("leads", "can_edit") && <button type="button" onClick={handleConvert} disabled={saving} className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white text-xs font-bold transition-colors">
                      <UserCheck size={14} /> Convert
                    </button>}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-xs font-semibold mb-1.5 text-[#94a3b8]">Business / Company</label><input type="text" value={form.business_name} onChange={e => setForm(p => ({ ...p, business_name: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" style={inputStyle} /></div>
                  <div><label className="block text-xs font-semibold mb-1.5 text-[#94a3b8]">Contact Name *</label><input type="text" value={form.contact_name} onChange={e => setForm(p => ({ ...p, contact_name: e.target.value }))} required={!form.business_name} className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" style={inputStyle} /></div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-xs font-semibold mb-1.5 text-[#94a3b8]">Email</label><input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" style={inputStyle} /></div>
                  <div><label className="block text-xs font-semibold mb-1.5 text-[#94a3b8]">Phone</label><input type="text" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" style={inputStyle} /></div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-xs font-semibold mb-1.5 text-[#94a3b8]">City / Location</label><input type="text" value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" style={inputStyle} /></div>
                  <div><label className="block text-xs font-semibold mb-1.5 text-[#94a3b8]">Source (e.g., Google)</label><input type="text" value={form.source} onChange={e => setForm(p => ({ ...p, source: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" style={inputStyle} /></div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1.5 text-[#94a3b8]">Pipeline Stage</label>
                    <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none" style={inputStyle}>
                      {STATUSES.map(s => <option key={s} value={s}>{STATUS_META[s].label}</option>)}
                    </select>
                  </div>
                  <div><label className="block text-xs font-semibold mb-1.5 text-[#94a3b8]">Next Follow-up</label><input type="date" value={form.next_follow_up} onChange={e => setForm(p => ({ ...p, next_follow_up: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none" style={{ ...inputStyle, colorScheme: "dark" }} /></div>
                </div>

              </form>

              {/* Timestamped Notes Section (Only show if editing an existing lead) */}
              {editing && (
                <div className="px-6 pb-6 space-y-4">
                  <div className="pt-6 border-t border-[#334155]">
                    <h4 className="text-sm font-bold text-white mb-4">Activity & Notes</h4>
                    
                    {/* Add note UI */}
                    <div className="flex items-start gap-2 mb-6">
                      <div className="w-8 h-8 rounded-full bg-[#1e293b] shrink-0 border border-[#334155] flex items-center justify-center"><UserCheck size={14} className="text-[#64748b]" /></div>
                      <div className="flex-1 relative">
                        <textarea value={newNote} onChange={e => setNewNote(e.target.value)} rows={2} placeholder="Log a call, email, or note..." className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none" style={inputStyle} />
                        {hasPermission("leads", "can_edit") && <button onClick={handleAddNote} disabled={!newNote.trim()} className="absolute right-2 bottom-2 px-2.5 py-1 bg-[#1e293b] hover:bg-blue-600 text-xs font-bold text-white rounded transition-colors disabled:opacity-50">Add</button>}
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="space-y-4">
                      {[...(form.notes || [])].reverse().map((note, i) => (
                        <div key={i} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div className="w-2.5 h-2.5 rounded-full bg-[#334155] mt-1.5" />
                            {i !== form.notes.length - 1 && <div className="w-px h-full bg-[#334155] my-1" />}
                          </div>
                          <div className="flex-1 pb-4">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748b]">{new Date(note.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                            <div className="mt-1 p-3 rounded-xl bg-[#1e293b] border border-[#334155] text-sm text-[#cbd5e1] whitespace-pre-wrap">{note.text}</div>
                          </div>
                        </div>
                      ))}
                      {form.notes?.length === 0 && <p className="text-center text-xs text-[#64748b] py-4">No notes recorded yet.</p>}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 flex gap-3 bg-[#0f172a]" style={{ borderTop: "1px solid #334155" }}>
              <button type="button" onClick={() => setSheetOpen(false)} className="flex-1 py-2.5 rounded-xl text-sm font-medium hover:bg-white/5 transition-colors text-[#94a3b8]">Cancel</button>
              {hasPermission("leads", editing ? "can_edit" : "can_create") && <button type="submit" form="lead-form" disabled={saving} className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-colors disabled:opacity-50">{saving ? "Saving..." : editing ? "Save Changes" : "Create Lead"}</button>}
            </div>

          </div>
        </>
      )}

      {/* Delete Dialog */}
      {deleteTarget && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70]" onClick={() => setDeleteTarget(null)} />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm rounded-2xl p-6 z-[71] space-y-4" style={{ background: "#1e293b", border: "1px solid #334155", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
            <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center" style={{ background: "rgba(239,68,68,0.1)" }}><Trash2 size={22} style={{ color: "#f87171" }} /></div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-white">Delete Lead</h3>
              <p className="text-sm mt-2" style={{ color: "#94a3b8" }}>Delete <span className="text-white font-medium">{deleteTarget.business_name || deleteTarget.contact_name}</span>? This action cannot be undone.</p>
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
