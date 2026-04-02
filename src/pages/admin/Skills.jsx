import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Plus, Trash2, Zap, Save, X } from "lucide-react";

const CATEGORIES = ["Programming Languages", "Developer Tools & Platforms", "Embedded, Electronics & Hardware", "Prototyping & Manufacturing", "Software & Design Tools"];

export default function Skills() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", category: CATEGORIES[0], icon_name: "", level: 50, sort_order: 0 });

  useEffect(() => { fetchSkills(); }, []);

  async function fetchSkills() {
    const { data } = await supabase.from("skills").select("*").order("category").order("sort_order");
    if (data) setSkills(data);
    setLoading(false);
  }

  async function addSkill(e) {
    e.preventDefault();
    setSaving(true);
    const { data } = await supabase.from("skills").insert(form).select().single();
    if (data) {
      setSkills(prev => [...prev, data]);
      setForm({ name: "", category: CATEGORIES[0], icon_name: "", level: 50, sort_order: 0 });
      setShowForm(false);
    }
    setSaving(false);
  }

  async function updateLevel(id, level) {
    await supabase.from("skills").update({ level }).eq("id", id);
    setSkills(prev => prev.map(s => s.id === id ? { ...s, level } : s));
  }

  async function deleteSkill(id) {
    if (!confirm("Delete this skill?")) return;
    await supabase.from("skills").delete().eq("id", id);
    setSkills(prev => prev.filter(s => s.id !== id));
  }

  const grouped = skills.reduce((acc, skill) => { if (!acc[skill.category]) acc[skill.category] = []; acc[skill.category].push(skill); return acc; }, {});

  const inputStyle = { background: "#111827", border: "1px solid #334155", color: "#f1f5f9" };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">Skills</h1><p className="text-sm mt-1" style={{ color: "#94a3b8" }}>Manage your technical skills</p></div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-semibold" style={{ boxShadow: "0 4px 16px rgba(59,130,246,0.25)" }}>
          {showForm ? <X size={18} /> : <Plus size={18} />}{showForm ? "Cancel" : "Add Skill"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={addSkill} className="rounded-2xl p-6 space-y-4" style={{ background: "#1e293b", border: "1px solid #334155" }}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div><label className="block text-xs font-medium mb-1" style={{ color: "#94a3b8" }}>Name *</label><input type="text" value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))} required placeholder="React" className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" style={inputStyle} /></div>
            <div><label className="block text-xs font-medium mb-1" style={{ color: "#94a3b8" }}>Category</label><select value={form.category} onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none" style={inputStyle}>{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
            <div><label className="block text-xs font-medium mb-1" style={{ color: "#94a3b8" }}>Level (1-100)</label><input type="number" min={1} max={100} value={form.level} onChange={e => setForm(prev => ({ ...prev, level: parseInt(e.target.value) || 50 }))} className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none" style={inputStyle} /></div>
            <div className="flex items-end"><button type="submit" disabled={saving} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold disabled:opacity-50"><Save size={16} />{saving ? "..." : "Add"}</button></div>
          </div>
        </form>
      )}

      {Object.keys(grouped).length === 0 ? (
        <div className="rounded-2xl py-16 text-center" style={{ background: "#1e293b", border: "1px solid #334155" }}>
          <Zap size={48} className="mx-auto mb-4" style={{ color: "rgba(148,163,184,0.3)" }} />
          <h3 className="text-lg font-semibold text-white mb-2">No skills yet</h3>
          <p className="text-sm" style={{ color: "#94a3b8" }}>Add your first skill to get started</p>
        </div>
      ) : Object.entries(grouped).map(([category, categorySkills]) => (
        <div key={category} className="rounded-2xl overflow-hidden" style={{ background: "#1e293b", border: "1px solid #334155" }}>
          <div className="px-6 py-4" style={{ borderBottom: "1px solid #334155" }}><h2 className="text-sm font-semibold text-white">{category}</h2></div>
          <div>
            {categorySkills.map(skill => (
              <div key={skill.id} className="px-6 py-4 flex items-center gap-5 transition-colors hover:bg-white/[0.02]" style={{ borderBottom: "1px solid #334155" }}>
                <p className="flex-1 min-w-0 text-sm font-medium text-white">{skill.name}</p>
                <div className="w-48 flex items-center gap-3">
                  <div className="flex-1 h-2 rounded-full" style={{ background: "#111827" }}>
                    <div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all" style={{ width: `${skill.level}%` }} />
                  </div>
                  <input type="number" min={1} max={100} value={skill.level} onChange={e => updateLevel(skill.id, Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))} className="w-14 px-2 py-1 rounded-lg text-xs text-center focus:outline-none" style={inputStyle} />
                </div>
                <button onClick={() => deleteSkill(skill.id)} className="p-2 rounded-lg transition-all hover:bg-red-500/10" style={{ color: "#94a3b8" }}><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
