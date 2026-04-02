import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import {
  ArrowLeft, Users, Calendar, DollarSign, Clock, AlertTriangle, CheckCircle2,
  FolderKanban, FileText, Plus, Trash2, Check, Upload, Download, File,
} from "lucide-react";

const STATUS_META = {
  lead: { label: "Lead", color: "#60a5fa", bg: "rgba(59,130,246,0.1)", dot: "#3b82f6" },
  in_progress: { label: "In Progress", color: "#fbbf24", bg: "rgba(245,158,11,0.1)", dot: "#f59e0b" },
  review: { label: "Review", color: "#c084fc", bg: "rgba(168,85,247,0.1)", dot: "#a855f7" },
  completed: { label: "Completed", color: "#4ade80", bg: "rgba(34,197,94,0.1)", dot: "#22c55e" },
  cancelled: { label: "Cancelled", color: "#f87171", bg: "rgba(239,68,68,0.1)", dot: "#ef4444" },
};
const INV_STATUS = { draft: "#94a3b8", sent: "#60a5fa", paid: "#4ade80", overdue: "#fbbf24", cancelled: "#f87171" };

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [client, setClient] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => { fetchAll(); }, [id]);

  async function fetchAll() {
    const [pRes, tRes, iRes, fRes] = await Promise.all([
      supabase.from("projects").select("*").eq("id", id).single(),
      supabase.from("tasks").select("*").eq("project_id", id).order("sort_order"),
      supabase.from("invoices").select("*").eq("client_id", id), // will filter below
      supabase.from("project_files").select("*").eq("project_id", id).order("created_at", { ascending: false }),
    ]);
    const proj = pRes.data;
    if (proj) {
      setProject(proj);
      // Fetch client
      if (proj.client_id) {
        const { data: c } = await supabase.from("clients").select("*").eq("id", proj.client_id).single();
        setClient(c);
        // Fetch invoices for this client
        const { data: inv } = await supabase.from("invoices").select("*").eq("client_id", proj.client_id).order("created_at", { ascending: false });
        if (inv) setInvoices(inv);
      }
    }
    if (tRes.data) setTasks(tRes.data);
    if (fRes.data) setFiles(fRes.data);
    setLoading(false);
  }

  // Tasks
  async function addTask(e) {
    e.preventDefault();
    if (!newTask.trim()) return;
    const { data } = await supabase.from("tasks").insert({ project_id: id, title: newTask.trim(), status: 'todo', priority: 'medium' }).select().single();
    if (data) setTasks(prev => [...prev, data]);
    setNewTask("");
  }

  async function toggleTask(taskId, currentStatus) {
    const newStatus = currentStatus === "done" ? "todo" : "done";
    await supabase.from("tasks").update({ status: newStatus }).eq("id", taskId);
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
  }

  async function deleteTask(taskId) {
    await supabase.from("tasks").delete().eq("id", taskId);
    setTasks(prev => prev.filter(t => t.id !== taskId));
  }

  // Files
  async function uploadFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const path = `project-files/${id}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("portfolio-images").upload(path, file);
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from("portfolio-images").getPublicUrl(path);
      const { data } = await supabase.from("project_files").insert({ project_id: id, name: file.name, url: publicUrl, size: file.size, type: file.type }).select().single();
      if (data) setFiles(prev => [data, ...prev]);
    }
    setUploading(false);
  }

  async function deleteFile(fileId, url) {
    if (url?.includes("portfolio-images")) {
      const p = url.split("portfolio-images/")[1];
      if (p) await supabase.storage.from("portfolio-images").remove([p]);
    }
    await supabase.from("project_files").delete().eq("id", fileId);
    setFiles(prev => prev.filter(f => f.id !== fileId));
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!project) return <div className="text-center py-20"><p className="text-sm" style={{ color: "#94a3b8" }}>Project not found.</p></div>;

  const m = STATUS_META[project.status] || STATUS_META.lead;
  const completedTasks = tasks.filter(t => t.status === "done").length;
  const progress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  function deadlineInfo() {
    if (!project.deadline) return null;
    const diff = (new Date(project.deadline) - new Date()) / (1000 * 60 * 60 * 24);
    if (diff < 0) return { color: "#f87171", icon: AlertTriangle, text: `Overdue by ${Math.abs(Math.ceil(diff))} days` };
    if (diff <= 7) return { color: "#fbbf24", icon: Clock, text: `${Math.ceil(diff)} days left` };
    return { color: "#4ade80", icon: CheckCircle2, text: `${Math.ceil(diff)} days left` };
  }
  const dl = deadlineInfo();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/admin/projects")} className="p-2 rounded-lg hover:bg-white/10" style={{ color: "#94a3b8" }}><ArrowLeft size={20} /></button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">{project.title}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold" style={{ background: m.bg, color: m.color }}>{m.label}</span>
            </div>
            {project.description && <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>{project.description}</p>}
          </div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
          <Link to="/admin/expenses" state={{ newExp: true, projectId: project.id }} className="flex items-center justify-center gap-2 flex-1 sm:flex-none px-4 py-2 rounded-xl bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 hover:text-orange-300 transition-colors font-semibold text-sm border border-orange-500/20">
            <DollarSign size={16} /> Log Expense
          </Link>
        </div>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "Client", value: client?.name || "Unassigned", icon: Users, gradient: "from-blue-500 to-blue-700" },
          { label: "Budget", value: project.budget > 0 ? `${project.currency} ${Number(project.budget).toLocaleString()}` : "—", icon: DollarSign, gradient: "from-emerald-500 to-emerald-700" },
          { label: "Start", value: project.start_date ? new Date(project.start_date).toLocaleDateString() : "—", icon: Calendar, gradient: "from-purple-500 to-purple-700" },
          { label: "Deadline", value: project.deadline ? new Date(project.deadline).toLocaleDateString() : "—", icon: dl?.icon || Calendar, gradient: "from-amber-500 to-orange-600", extra: dl },
          { label: "Progress", value: `${progress}%`, icon: FolderKanban, gradient: "from-pink-500 to-rose-600" },
        ].map(c => (
          <div key={c.label} className="rounded-2xl p-4" style={{ background: "#1e293b", border: "1px solid #334155" }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px]" style={{ color: "#475569" }}>{c.label}</p>
                <p className="text-sm font-bold text-white mt-0.5">{c.value}</p>
                {c.extra && <p className="text-[10px] font-semibold mt-0.5" style={{ color: c.extra.color }}>{c.extra.text}</p>}
              </div>
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${c.gradient} flex items-center justify-center`}><c.icon size={16} className="text-white" /></div>
            </div>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      {tasks.length > 0 && (
        <div className="rounded-2xl p-5" style={{ background: "#1e293b", border: "1px solid #334155" }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-white">Task Progress</span>
            <span className="text-xs font-bold" style={{ color: progress === 100 ? "#4ade80" : "#94a3b8" }}>{completedTasks}/{tasks.length} completed</span>
          </div>
          <div className="h-3 rounded-full overflow-hidden" style={{ background: "#111827" }}>
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: progress === 100 ? "linear-gradient(to right, #22c55e, #4ade80)" : "linear-gradient(to right, #3b82f6, #60a5fa)" }} />
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Tasks */}
        <div className="lg:col-span-2 rounded-2xl overflow-hidden" style={{ background: "#1e293b", border: "1px solid #334155" }}>
          <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid #334155" }}>
            <h2 className="text-sm font-semibold text-white flex items-center gap-2"><Check size={16} />Tasks</h2>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold" style={{ background: "rgba(59,130,246,0.1)", color: "#60a5fa" }}>{tasks.length}</span>
          </div>

          {/* Add Task */}
          <form onSubmit={addTask} className="px-6 py-3 flex gap-2" style={{ borderBottom: "1px solid #334155" }}>
            <input type="text" value={newTask} onChange={e => setNewTask(e.target.value)} placeholder="Add a task..." className="flex-1 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50" style={{ background: "#111827", border: "1px solid #334155", color: "#f1f5f9" }} />
            <button type="submit" className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium"><Plus size={16} /></button>
          </form>

          {tasks.length === 0 ? (
            <div className="px-6 py-10 text-center"><p className="text-xs" style={{ color: "#475569" }}>No tasks yet. Add one above.</p></div>
          ) : (
            <div>
              {tasks.map(task => {
                const isDone = task.status === "done";
                return (
                  <div key={task.id} className="px-6 py-3 flex items-center gap-3 transition-colors hover:bg-white/[0.02] group" style={{ borderBottom: "1px solid #334155" }}>
                    <button onClick={() => toggleTask(task.id, task.status)} className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-all" style={{ background: isDone ? "#22c55e" : "transparent", border: `2px solid ${isDone ? "#22c55e" : "#475569"}` }}>
                      {isDone && <Check size={12} className="text-white" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm block truncate" style={{ color: isDone ? "#475569" : "#f1f5f9", textDecoration: isDone ? "line-through" : "none" }}>{task.title}</span>
                      {task.due_date && <span className="text-[10px] mt-0.5 block" style={{ color: "#64748b" }}>Due {new Date(task.due_date).toLocaleDateString()}</span>}
                    </div>
                    {task.priority && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider shrink-0" style={{ 
                        background: task.priority === 'high' ? 'rgba(248,113,113,0.1)' : task.priority === 'medium' ? 'rgba(251,191,36,0.1)' : 'rgba(148,163,184,0.1)',
                        color: task.priority === 'high' ? '#f87171' : task.priority === 'medium' ? '#fbbf24' : '#94a3b8' 
                      }}>
                        {task.priority}
                      </span>
                    )}
                    <button onClick={() => deleteTask(task.id)} className="p-1 rounded hover:bg-red-500/10 opacity-0 group-hover:opacity-100 shrink-0" style={{ color: "#475569" }}><Trash2 size={13} /></button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Col: Invoices + Files */}
        <div className="space-y-6">
          {/* Invoices */}
          <div className="rounded-2xl overflow-hidden" style={{ background: "#1e293b", border: "1px solid #334155" }}>
            <div className="px-5 py-3.5 flex items-center justify-between" style={{ borderBottom: "1px solid #334155" }}>
              <h2 className="text-sm font-semibold text-white flex items-center gap-2"><FileText size={15} />Invoices</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: "rgba(168,85,247,0.1)", color: "#c084fc" }}>{invoices.length}</span>
            </div>
            {invoices.length === 0 ? (
              <div className="px-5 py-8 text-center"><p className="text-xs" style={{ color: "#475569" }}>No invoices</p></div>
            ) : invoices.map(inv => (
              <div key={inv.id} className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: "1px solid #334155" }}>
                <div><p className="text-sm font-medium text-white">{inv.invoice_number}</p><p className="text-[11px]" style={{ color: "#475569" }}>{inv.description || "—"}</p></div>
                <div className="text-right"><p className="text-sm font-semibold text-white">₹{Number(inv.amount).toLocaleString()}</p><span className="text-[10px] font-semibold" style={{ color: INV_STATUS[inv.status] || "#94a3b8" }}>{inv.status}</span></div>
              </div>
            ))}
          </div>

          {/* Files */}
          <div className="rounded-2xl overflow-hidden" style={{ background: "#1e293b", border: "1px solid #334155" }}>
            <div className="px-5 py-3.5 flex items-center justify-between" style={{ borderBottom: "1px solid #334155" }}>
              <h2 className="text-sm font-semibold text-white flex items-center gap-2"><File size={15} />Files</h2>
              <label className="px-2.5 py-1 rounded-lg bg-blue-600 text-white text-[11px] font-medium cursor-pointer flex items-center gap-1">
                <Upload size={12} />{uploading ? "..." : "Upload"}
                <input type="file" onChange={uploadFile} className="hidden" disabled={uploading} />
              </label>
            </div>
            {files.length === 0 ? (
              <div className="px-5 py-8 text-center"><p className="text-xs" style={{ color: "#475569" }}>No files uploaded</p></div>
            ) : files.map(f => (
              <div key={f.id} className="px-5 py-3 flex items-center gap-3" style={{ borderBottom: "1px solid #334155" }}>
                <File size={14} style={{ color: "#475569" }} />
                <div className="flex-1 min-w-0"><p className="text-sm text-white truncate">{f.name}</p><p className="text-[10px]" style={{ color: "#475569" }}>{f.size ? `${(f.size / 1024).toFixed(1)} KB` : ""}</p></div>
                <a href={f.url} target="_blank" rel="noopener" className="p-1.5 rounded hover:bg-white/10" style={{ color: "#94a3b8" }}><Download size={13} /></a>
                <button onClick={() => deleteFile(f.id, f.url)} className="p-1.5 rounded hover:bg-red-500/10" style={{ color: "#94a3b8" }}><Trash2 size={13} /></button>
              </div>
            ))}
          </div>

          {/* Client Card */}
          {client && (
            <Link to={`/admin/clients/${client.id}`} className="block rounded-2xl p-5 transition-all hover:border-blue-500/20" style={{ background: "#1e293b", border: "1px solid #334155" }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">{client.name.charAt(0).toUpperCase()}</div>
                <div><p className="text-sm font-medium text-white">{client.name}</p>{client.company && <p className="text-xs" style={{ color: "#64748b" }}>{client.company}</p>}</div>
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
