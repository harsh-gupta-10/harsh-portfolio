import { useState } from "react";
import { Plus, Pencil, Trash2, Save, X, Star, ExternalLink, GripVertical, Check } from "lucide-react";
import { FiGithub as Github } from "react-icons/fi";
import initialProjects from "../../data/allProjects.json";
import { saveDataFile } from "../../lib/localAdmin";

const CATEGORIES = ["Front-End Web Dev", "Full Stack Web Dev", "Embedded & IoT", "UI/UX Design", "Other"];

const EMPTY_PROJECT = {
  title: "",
  description: "",
  image: "",
  tags: [],
  category: "Front-End Web Dev",
  featured: false,
  showLiveDemo: false,
  liveDemoLabel: "Live Demo",
  liveUrl: "#",
  showCode: false,
  githubUrl: "#",
};

function ProjectModal({ project, onSave, onClose }) {
  const [form, setForm] = useState({ ...project });
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);

  const set = (field, val) => setForm((p) => ({ ...p, [field]: val }));

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !form.tags.includes(t)) set("tags", [...form.tags, t]);
    setTagInput("");
  };

  const removeTag = (t) => set("tags", form.tags.filter((x) => x !== t));

  const handleSave = async () => {
    if (!form.title.trim()) return alert("Title is required");
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  const inputCls = "w-full px-4 py-2.5 rounded-xl text-sm text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50";
  const inputStyle = { background: "#0f172a", border: "1px solid #334155" };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl" style={{ background: "#1e293b", border: "1px solid #334155" }}>
        <div className="flex items-center justify-between p-6 sticky top-0 z-10" style={{ background: "#1e293b", borderBottom: "1px solid #334155" }}>
          <h2 className="text-lg font-bold text-white">{project.title ? "Edit Project" : "Add Project"}</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-all">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Title *</label>
            <input className={inputCls} style={inputStyle} value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Project title" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Description</label>
            <textarea className={inputCls + " resize-none"} style={inputStyle} rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Brief description..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Category</label>
              <select className={inputCls} style={inputStyle} value={form.category} onChange={(e) => set("category", e.target.value)}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Image Path</label>
              <input className={inputCls} style={inputStyle} value={form.image} onChange={(e) => set("image", e.target.value)} placeholder="/imgs/projects/..." />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Tags</label>
            <div className="flex gap-2 mb-2">
              <input
                className={inputCls + " flex-1"} style={inputStyle}
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                placeholder="Add tag and press Enter"
              />
              <button onClick={addTag} className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors">Add</button>
            </div>
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {form.tags.map((t) => (
                  <span key={t} className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium text-slate-300" style={{ background: "#0f172a", border: "1px solid #334155" }}>
                    {t}
                    <button onClick={() => removeTag(t)} className="text-slate-500 hover:text-red-400 ml-1"><X size={10} /></button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Toggles */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Featured", field: "featured" },
              { label: "Show Live Demo", field: "showLiveDemo" },
              { label: "Show Code/GitHub", field: "showCode" },
            ].map(({ label, field }) => (
              <label key={field} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-white/5 transition-colors">
                <div
                  onClick={() => set(field, !form[field])}
                  className={`w-10 h-5 rounded-full transition-all cursor-pointer relative ${form[field] ? "bg-blue-600" : "bg-slate-700"}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${form[field] ? "left-5" : "left-0.5"}`} />
                </div>
                <span className="text-sm text-slate-300">{label}</span>
              </label>
            ))}
          </div>

          {/* URLs */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Live URL</label>
              <input className={inputCls} style={inputStyle} value={form.liveUrl} onChange={(e) => set("liveUrl", e.target.value)} placeholder="https://..." />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Live Demo Label</label>
              <input className={inputCls} style={inputStyle} value={form.liveDemoLabel} onChange={(e) => set("liveDemoLabel", e.target.value)} />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">GitHub URL</label>
              <input className={inputCls} style={inputStyle} value={form.githubUrl} onChange={(e) => set("githubUrl", e.target.value)} placeholder="https://github.com/..." />
            </div>
          </div>
        </div>

        <div className="flex gap-3 p-6 sticky bottom-0" style={{ background: "#1e293b", borderTop: "1px solid #334155" }}>
          <button onClick={onClose} className="flex-1 py-3 rounded-xl text-sm font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-all border border-slate-700">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={16} />}
            Save Project
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PAProjects() {
  const [projects, setProjects] = useState(initialProjects);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const persist = async (updated) => {
    setSaving(true);
    try {
      await saveDataFile("allProjects.json", updated);
      setProjects(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      alert("❌ Save failed: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async (form) => {
    let updated;
    if (editing === "new") {
      updated = [...projects, form];
    } else {
      updated = projects.map((p, i) => (i === editing ? form : p));
    }
    await persist(updated);
    setEditing(null);
  };

  const handleDelete = async (idx) => {
    if (!window.confirm("Delete this project?")) return;
    await persist(projects.filter((_, i) => i !== idx));
  };

  const moveUp = async (idx) => {
    if (idx === 0) return;
    const next = [...projects];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    await persist(next);
  };

  const moveDown = async (idx) => {
    if (idx === projects.length - 1) return;
    const next = [...projects];
    [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
    await persist(next);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <p className="text-sm text-slate-400 mt-1">Manage your portfolio projects · {projects.length} total</p>
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-emerald-400 animate-pulse">
              <Check size={14} /> Saved to disk
            </span>
          )}
          <button
            onClick={() => setEditing("new")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 transition-all"
          >
            <Plus size={16} /> Add Project
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {projects.map((p, idx) => (
          <div
            key={idx}
            className="flex items-center gap-4 p-4 rounded-2xl transition-all hover:border-slate-500/50"
            style={{ background: "#1e293b", border: "1px solid #334155" }}
          >
            {/* Image */}
            <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0" style={{ background: "#0f172a" }}>
              {p.image ? (
                <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-600">
                  <FolderKanban size={20} />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white truncate">{p.title}</span>
                {p.featured && <Star size={13} className="text-amber-400 shrink-0" fill="currentColor" />}
              </div>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-slate-500">{p.category}</span>
                {p.showLiveDemo && <span className="text-xs text-blue-400 flex items-center gap-1"><ExternalLink size={10} /> Live</span>}
                {p.showCode && <span className="text-xs text-slate-400 flex items-center gap-1"><Github size={10} /> Code</span>}
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {p.tags.slice(0, 4).map((t) => (
                  <span key={t} className="text-[10px] px-2 py-0.5 rounded-md text-slate-400" style={{ background: "#0f172a" }}>{t}</span>
                ))}
                {p.tags.length > 4 && <span className="text-[10px] text-slate-500">+{p.tags.length - 4}</span>}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => moveUp(idx)} disabled={idx === 0} className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 disabled:opacity-30 transition-all" title="Move up">↑</button>
              <button onClick={() => moveDown(idx)} disabled={idx === projects.length - 1} className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 disabled:opacity-30 transition-all" title="Move down">↓</button>
              <button onClick={() => setEditing(idx)} className="p-2 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all">
                <Pencil size={15} />
              </button>
              <button onClick={() => handleDelete(idx)} className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {editing !== null && (
        <ProjectModal
          project={editing === "new" ? EMPTY_PROJECT : projects[editing]}
          onSave={handleSave}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
