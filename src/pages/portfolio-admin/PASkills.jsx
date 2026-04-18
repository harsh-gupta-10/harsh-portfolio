import { useState } from "react";
import { Plus, Pencil, Trash2, Save, X, Check } from "lucide-react";
import initialData from "../../data/skills.json";
import { saveDataFile } from "../../lib/localAdmin";

const ICON_KEYS = [
  "FiCode","FiTool","FiCpu","FiBox","FiPenTool","FiSmartphone","FiFileText","FiGrid","FiMonitor","FiLayers",
  "SiPython","SiJavascript","SiTypescript","SiCplusplus","SiGit","SiGithub","SiNodedotjs","SiLinux",
  "SiFigma","SiAdobephotoshop","SiBlender","SiAdobepremierepro","SiArduino",
  "FaJava","FaDatabase","FaMicrochip",
];

const GRADIENTS = [
  "from-blue-500 to-blue-700",
  "from-purple-500 to-purple-700",
  "from-emerald-500 to-emerald-700",
  "from-orange-500 to-orange-700",
  "from-pink-500 to-pink-700",
  "from-cyan-500 to-cyan-700",
  "from-red-500 to-red-700",
  "from-sky-500 to-sky-700",
];

const EMPTY_CAT = { title: "", iconKey: "FiCode", color: "from-blue-500 to-blue-700", skills: [] };

function CatModal({ cat, onSave, onClose }) {
  const [form, setForm] = useState({ ...cat, skills: cat.skills.map((s) => ({ ...s })) });
  const [skillInput, setSkillInput] = useState({ name: "", iconKey: "FiCode" });
  const [saving, setSaving] = useState(false);

  const setF = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const addSkill = () => {
    if (!skillInput.name.trim()) return;
    setF("skills", [...form.skills, { name: skillInput.name.trim(), iconKey: skillInput.iconKey }]);
    setSkillInput({ name: "", iconKey: "FiCode" });
  };

  const removeSkill = (i) => setF("skills", form.skills.filter((_, j) => j !== i));

  const handleSave = async () => {
    if (!form.title.trim()) return alert("Title required");
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  const inputCls = "w-full px-4 py-2.5 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50";
  const inputStyle = { background: "#0f172a", border: "1px solid #334155" };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl" style={{ background: "#1e293b", border: "1px solid #334155" }}>
        <div className="flex items-center justify-between p-6 sticky top-0 z-10" style={{ background: "#1e293b", borderBottom: "1px solid #334155" }}>
          <h2 className="text-lg font-bold text-white">{cat.title ? "Edit Category" : "Add Category"}</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Category Title *</label>
              <input className={inputCls} style={inputStyle} value={form.title} onChange={(e) => setF("title", e.target.value)} placeholder="Programming Languages" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Category Icon</label>
              <select className={inputCls} style={inputStyle} value={form.iconKey} onChange={(e) => setF("iconKey", e.target.value)}>
                {ICON_KEYS.map((k) => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Color Gradient</label>
            <div className="grid grid-cols-4 gap-2">
              {GRADIENTS.map((g) => (
                <button
                  key={g}
                  onClick={() => setF("color", g)}
                  className={`h-10 rounded-xl bg-gradient-to-r ${g} transition-all ${form.color === g ? "ring-2 ring-white scale-105" : "opacity-60 hover:opacity-100"}`}
                />
              ))}
            </div>
          </div>

          {/* Skills list */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Skills in this category</label>
            <div className="flex gap-2 mb-3">
              <input
                className={inputCls + " flex-1"} style={inputStyle}
                value={skillInput.name}
                onChange={(e) => setSkillInput((p) => ({ ...p, name: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                placeholder="Skill name"
              />
              <select className="px-3 py-2 rounded-xl text-sm text-white focus:outline-none" style={{ background: "#0f172a", border: "1px solid #334155" }}
                value={skillInput.iconKey} onChange={(e) => setSkillInput((p) => ({ ...p, iconKey: e.target.value }))}>
                {ICON_KEYS.map((k) => <option key={k} value={k}>{k}</option>)}
              </select>
              <button onClick={addSkill} className="px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold">Add</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.skills.map((s, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium text-slate-300" style={{ background: "#0f172a", border: "1px solid #334155" }}>
                  <span className="text-slate-500 text-[10px]">{s.iconKey}</span>
                  {s.name}
                  <button onClick={() => removeSkill(i)} className="text-slate-500 hover:text-red-400 ml-1"><X size={10} /></button>
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-3 p-6 sticky bottom-0" style={{ background: "#1e293b", borderTop: "1px solid #334155" }}>
          <button onClick={onClose} className="flex-1 py-3 rounded-xl text-sm font-semibold text-slate-400 hover:bg-white/5 border border-slate-700 transition-all">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={16} />} Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PASkills() {
  const [categories, setCategories] = useState(initialData);
  const [editing, setEditing] = useState(null);
  const [saved, setSaved] = useState(false);

  const persist = async (updated) => {
    try {
      await saveDataFile("skills.json", updated);
      setCategories(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) { alert("❌ " + e.message); }
  };

  const handleSave = async (form) => {
    const updated = editing === "new" ? [...categories, form] : categories.map((c, i) => i === editing ? form : c);
    await persist(updated);
    setEditing(null);
  };

  const handleDelete = async (idx) => {
    if (!window.confirm("Delete this skill category?")) return;
    await persist(categories.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Skills</h1>
          <p className="text-sm text-slate-400 mt-1">{categories.length} categories · {categories.reduce((a, c) => a + c.skills.length, 0)} total skills</p>
        </div>
        <div className="flex items-center gap-3">
          {saved && <span className="flex items-center gap-1.5 text-sm text-emerald-400"><Check size={14} /> Saved</span>}
          <button onClick={() => setEditing("new")} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 transition-all">
            <Plus size={16} /> Add Category
          </button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {categories.map((cat, idx) => (
          <div key={idx} className="p-5 rounded-2xl" style={{ background: "#1e293b", border: "1px solid #334155" }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${cat.color} flex items-center justify-center`}><span className="text-white text-[10px]">A</span></div>
                <span className="text-sm font-semibold text-white">{cat.title}</span>
              </div>
              <div className="flex gap-1">
                <button onClick={() => setEditing(idx)} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all"><Pencil size={13} /></button>
                <button onClick={() => handleDelete(idx)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"><Trash2 size={13} /></button>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {cat.skills.map((s) => (
                <span key={s.name} className="text-xs px-2.5 py-1 rounded-lg text-slate-400" style={{ background: "#0f172a" }}>{s.name}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {editing !== null && (
        <CatModal
          cat={editing === "new" ? EMPTY_CAT : categories[editing]}
          onSave={handleSave}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
