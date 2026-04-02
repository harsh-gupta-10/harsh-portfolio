import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Trash2, Zap, Save, X } from "lucide-react";

interface Skill {
  id: string;
  name: string;
  category: string;
  icon_name: string;
  level: number;
  sort_order: number;
}

const CATEGORIES = [
  "Programming Languages",
  "Developer Tools & Platforms",
  "Embedded, Electronics & Hardware",
  "Prototyping & Manufacturing",
  "Software & Design Tools",
];

export default function Skills() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    category: CATEGORIES[0],
    icon_name: "",
    level: 50,
    sort_order: 0,
  });

  useEffect(() => {
    fetchSkills();
  }, []);

  async function fetchSkills() {
    const { data } = await supabase
      .from("skills")
      .select("*")
      .order("category")
      .order("sort_order");

    if (data) setSkills(data);
    setLoading(false);
  }

  async function addSkill(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { data } = await supabase.from("skills").insert(form).select().single();
    if (data) {
      setSkills((prev) => [...prev, data]);
      setForm({ name: "", category: CATEGORIES[0], icon_name: "", level: 50, sort_order: 0 });
      setShowForm(false);
    }
    setSaving(false);
  }

  async function updateLevel(id: string, level: number) {
    await supabase.from("skills").update({ level }).eq("id", id);
    setSkills((prev) =>
      prev.map((s) => (s.id === id ? { ...s, level } : s))
    );
  }

  async function deleteSkill(id: string) {
    if (!confirm("Delete this skill?")) return;
    await supabase.from("skills").delete().eq("id", id);
    setSkills((prev) => prev.filter((s) => s.id !== id));
  }

  // Group by category
  const grouped = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Skills</h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-1">
            Manage your technical skills
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all"
        >
          {showForm ? <X size={18} /> : <Plus size={18} />}
          {showForm ? "Cancel" : "Add Skill"}
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <form
          onSubmit={addSkill}
          className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl p-6 space-y-4"
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">
                Name *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
                required
                placeholder="React"
                className="w-full px-3 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-white text-sm placeholder-[var(--color-text-muted)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, category: e.target.value }))
                }
                className="w-full px-3 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 transition-all"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">
                Level (1-100)
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={form.level}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    level: parseInt(e.target.value) || 50,
                  }))
                }
                className="w-full px-3 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 transition-all"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-sm font-semibold transition-all disabled:opacity-50"
              >
                <Save size={16} />
                {saving ? "Saving..." : "Add"}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Skills by Category */}
      {Object.keys(grouped).length === 0 ? (
        <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl py-16 text-center">
          <Zap
            size={48}
            className="mx-auto text-[var(--color-text-muted)]/30 mb-4"
          />
          <h3 className="text-lg font-semibold text-white mb-2">
            No skills yet
          </h3>
          <p className="text-[var(--color-text-muted)] text-sm">
            Add your first skill to get started
          </p>
        </div>
      ) : (
        Object.entries(grouped).map(([category, categorySkills]) => (
          <div
            key={category}
            className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-[var(--color-border)]">
              <h2 className="text-sm font-semibold text-white">{category}</h2>
            </div>
            <div className="divide-y divide-[var(--color-border)]">
              {categorySkills.map((skill) => (
                <div
                  key={skill.id}
                  className="px-6 py-4 flex items-center gap-5 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">
                      {skill.name}
                    </p>
                  </div>
                  <div className="w-48 flex items-center gap-3">
                    <div className="flex-1 h-2 rounded-full bg-[var(--color-surface)]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all"
                        style={{ width: `${skill.level}%` }}
                      />
                    </div>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={skill.level}
                      onChange={(e) =>
                        updateLevel(
                          skill.id,
                          Math.min(100, Math.max(1, parseInt(e.target.value) || 1))
                        )
                      }
                      className="w-14 px-2 py-1 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-white text-xs text-center focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]/50 transition-all"
                    />
                  </div>
                  <button
                    onClick={() => deleteSkill(skill.id)}
                    className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-danger)] hover:bg-red-500/10 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
