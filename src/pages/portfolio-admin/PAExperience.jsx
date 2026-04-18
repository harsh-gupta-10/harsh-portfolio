import { useState } from "react";
import { Plus, Pencil, Trash2, Save, X, Check, ChevronDown, ChevronUp } from "lucide-react";
import initialData from "../../data/experience.json";
import { saveDataFile } from "../../lib/localAdmin";

const EMPTY_EXP = {
  role: "",
  company: "",
  location: "",
  date: "",
  description: [""],
  technologies: [],
};

function ExpModal({ exp, onSave, onClose }) {
  const [form, setForm] = useState({ ...exp, description: [...exp.description], technologies: [...exp.technologies] });
  const [techInput, setTechInput] = useState("");
  const [saving, setSaving] = useState(false);

  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const setDesc = (i, v) => setField("description", form.description.map((d, j) => j === i ? v : d));
  const addDesc = () => setField("description", [...form.description, ""]);
  const removeDesc = (i) => setField("description", form.description.filter((_, j) => j !== i));
  const addTech = () => {
    const t = techInput.trim();
    if (t && !form.technologies.includes(t)) setField("technologies", [...form.technologies, t]);
    setTechInput("");
  };
  const removeTech = (t) => setField("technologies", form.technologies.filter((x) => x !== t));

  const handleSave = async () => {
    if (!form.role.trim() || !form.company.trim()) return alert("Role and company are required");
    setSaving(true);
    await onSave({ ...form, description: form.description.filter((d) => d.trim()) });
    setSaving(false);
  };

  const inputCls = "w-full px-4 py-2.5 rounded-xl text-sm text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50";
  const inputStyle = { background: "#0f172a", border: "1px solid #334155" };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl" style={{ background: "#1e293b", border: "1px solid #334155" }}>
        <div className="flex items-center justify-between p-6 sticky top-0 z-10" style={{ background: "#1e293b", borderBottom: "1px solid #334155" }}>
          <h2 className="text-lg font-bold text-white">{exp.role ? "Edit Experience" : "Add Experience"}</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-all"><X size={18} /></button>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Role / Title *</label>
              <input className={inputCls} style={inputStyle} value={form.role} onChange={(e) => setField("role", e.target.value)} placeholder="Software Engineer" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Company *</label>
              <input className={inputCls} style={inputStyle} value={form.company} onChange={(e) => setField("company", e.target.value)} placeholder="Company name" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Location</label>
              <input className={inputCls} style={inputStyle} value={form.location} onChange={(e) => setField("location", e.target.value)} placeholder="Mumbai, India" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Date Range</label>
              <input className={inputCls} style={inputStyle} value={form.date} onChange={(e) => setField("date", e.target.value)} placeholder="Jan. 2024 - Mar. 2025" />
            </div>
          </div>

          {/* Description bullets */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Key Achievements / Description</label>
              <button onClick={addDesc} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"><Plus size={12} /> Add bullet</button>
            </div>
            <div className="space-y-2">
              {form.description.map((d, i) => (
                <div key={i} className="flex gap-2">
                  <textarea
                    className={inputCls + " flex-1 resize-none"} style={inputStyle} rows={2}
                    value={d} onChange={(e) => setDesc(i, e.target.value)}
                    placeholder={`Achievement ${i + 1}...`}
                  />
                  {form.description.length > 1 && (
                    <button onClick={() => removeDesc(i)} className="p-2 rounded-xl text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-all self-start mt-1">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Technologies */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Technologies</label>
            <div className="flex gap-2 mb-2">
              <input
                className={inputCls + " flex-1"} style={inputStyle}
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTech())}
                placeholder="React, Node.js... (Enter to add)"
              />
              <button onClick={addTech} className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors">Add</button>
            </div>
            {form.technologies.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {form.technologies.map((t) => (
                  <span key={t} className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium text-slate-300" style={{ background: "#0f172a", border: "1px solid #334155" }}>
                    {t}
                    <button onClick={() => removeTech(t)} className="text-slate-500 hover:text-red-400 ml-1"><X size={10} /></button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 p-6 sticky bottom-0" style={{ background: "#1e293b", borderTop: "1px solid #334155" }}>
          <button onClick={onClose} className="flex-1 py-3 rounded-xl text-sm font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-all border border-slate-700">Cancel</button>
          <button
            onClick={handleSave} disabled={saving}
            className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={16} />}
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PAExperience() {
  const [items, setItems] = useState(initialData);
  const [editing, setEditing] = useState(null);
  const [saved, setSaved] = useState(false);

  const persist = async (updated) => {
    try {
      await saveDataFile("experience.json", updated);
      setItems(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      alert("❌ Save failed: " + e.message);
    }
  };

  const handleSave = async (form) => {
    const updated = editing === "new" ? [...items, form] : items.map((x, i) => i === editing ? form : x);
    await persist(updated);
    setEditing(null);
  };

  const handleDelete = async (idx) => {
    if (!window.confirm("Delete this experience entry?")) return;
    await persist(items.filter((_, i) => i !== idx));
  };

  const move = async (idx, dir) => {
    const next = [...items];
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= next.length) return;
    [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
    await persist(next);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Experience</h1>
          <p className="text-sm text-slate-400 mt-1">Manage your professional history · {items.length} entries</p>
        </div>
        <div className="flex items-center gap-3">
          {saved && <span className="flex items-center gap-1.5 text-sm text-emerald-400"><Check size={14} /> Saved</span>}
          <button onClick={() => setEditing("new")} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 transition-all">
            <Plus size={16} /> Add Entry
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {items.map((exp, idx) => (
          <div key={idx} className="p-5 rounded-2xl transition-all" style={{ background: "#1e293b", border: "1px solid #334155" }}>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">{exp.role}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full text-blue-400" style={{ background: "rgba(59,130,246,0.1)" }}>{exp.date}</span>
                </div>
                <p className="text-sm text-slate-400 mt-0.5">{exp.company} · {exp.location}</p>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {exp.technologies.map((t) => (
                    <span key={t} className="text-[11px] px-2 py-0.5 rounded-md text-slate-400" style={{ background: "#0f172a" }}>{t}</span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0 ml-4">
                <button onClick={() => move(idx, -1)} disabled={idx === 0} className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 disabled:opacity-30 transition-all">↑</button>
                <button onClick={() => move(idx, 1)} disabled={idx === items.length - 1} className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 disabled:opacity-30 transition-all">↓</button>
                <button onClick={() => setEditing(idx)} className="p-2 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all"><Pencil size={15} /></button>
                <button onClick={() => handleDelete(idx)} className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"><Trash2 size={15} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editing !== null && (
        <ExpModal
          exp={editing === "new" ? EMPTY_EXP : items[editing]}
          onSave={handleSave}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
