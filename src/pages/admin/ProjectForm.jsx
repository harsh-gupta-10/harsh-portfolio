import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { ArrowLeft, Upload, X, Save } from "lucide-react";

export default function ProjectForm() {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", tech_stack: "", category: "", github_url: "", live_url: "", image_url: "", featured: false, show_live_demo: false, show_code: false, live_demo_label: "Live Demo", sort_order: 0 });

  useEffect(() => {
    if (isEditing) {
      setLoading(true);
      supabase.from("projects").select("*").eq("id", id).single().then(({ data }) => {
        if (data) setForm({ ...data, tech_stack: (data.tech_stack || []).join(", ") });
        setLoading(false);
      });
    }
  }, [id, isEditing]);

  async function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fileName = `projects/${Date.now()}.${file.name.split(".").pop()}`;
    const { error } = await supabase.storage.from("portfolio-images").upload(fileName, file);
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from("portfolio-images").getPublicUrl(fileName);
      setForm(prev => ({ ...prev, image_url: publicUrl }));
    }
    setUploading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, tech_stack: form.tech_stack.split(",").map(s => s.trim()).filter(Boolean) };
    delete payload.id; delete payload.created_at;
    if (isEditing) await supabase.from("projects").update(payload).eq("id", id);
    else await supabase.from("projects").insert(payload);
    setSaving(false);
    navigate("/admin/projects");
  }

  const inputStyle = { background: "#111827", border: "1px solid #334155", color: "#f1f5f9" };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate("/admin/projects")} className="p-2 rounded-lg transition-all hover:bg-white/10" style={{ color: "#94a3b8" }}><ArrowLeft size={20} /></button>
        <div><h1 className="text-2xl font-bold text-white">{isEditing ? "Edit Project" : "Add Project"}</h1></div>
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl p-8 space-y-6" style={{ background: "#1e293b", border: "1px solid #334155" }}>
        {/* Image */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: "#94a3b8" }}>Project Image</label>
          {form.image_url ? (
            <div className="relative w-full h-48 rounded-xl overflow-hidden" style={{ border: "1px solid #334155" }}>
              <img src={form.image_url} alt="Preview" className="w-full h-full object-cover" />
              <button type="button" onClick={() => setForm(prev => ({ ...prev, image_url: "" }))} className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white hover:bg-red-500 transition-colors"><X size={16} /></button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-48 rounded-xl border-2 border-dashed cursor-pointer transition-colors" style={{ borderColor: "#334155", background: "#111827" }}>
              <Upload size={24} className="mb-2" style={{ color: "#94a3b8" }} />
              <span className="text-sm" style={{ color: "#94a3b8" }}>{uploading ? "Uploading..." : "Click to upload image"}</span>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
            </label>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: "#94a3b8" }}>Title *</label>
          <input type="text" value={form.title} onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))} required placeholder="My Awesome Project" className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" style={inputStyle} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: "#94a3b8" }}>Description</label>
          <textarea value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))} rows={4} placeholder="Describe your project..." className="w-full px-4 py-3 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50" style={inputStyle} />
        </div>

        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "#94a3b8" }}>Tech Stack (comma-separated)</label>
            <input type="text" value={form.tech_stack} onChange={e => setForm(prev => ({ ...prev, tech_stack: e.target.value }))} placeholder="React, TypeScript" className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" style={inputStyle} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "#94a3b8" }}>Category</label>
            <select value={form.category} onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))} className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" style={inputStyle}>
              <option value="">Select category</option>
              <option value="Front-End / UI">Front-End / UI</option>
              <option value="Embedded & IoT">Embedded & IoT</option>
              <option value="Hardware & Prototyping">Hardware & Prototyping</option>
              <option value="Mobile Application">Mobile Application</option>
              <option value="UI/UX Design">UI/UX Design</option>
              <option value="Full-Stack">Full-Stack</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <div><label className="block text-sm font-medium mb-2" style={{ color: "#94a3b8" }}>GitHub URL</label><input type="url" value={form.github_url} onChange={e => setForm(prev => ({ ...prev, github_url: e.target.value }))} placeholder="https://github.com/..." className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" style={inputStyle} /></div>
          <div><label className="block text-sm font-medium mb-2" style={{ color: "#94a3b8" }}>Live URL</label><input type="url" value={form.live_url} onChange={e => setForm(prev => ({ ...prev, live_url: e.target.value }))} placeholder="https://myproject.com" className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" style={inputStyle} /></div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[{ key: "featured", label: "Featured" }, { key: "show_live_demo", label: "Show Live Demo" }, { key: "show_code", label: "Show Code" }].map(item => (
            <label key={item.key} className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form[item.key]} onChange={e => setForm(prev => ({ ...prev, [item.key]: e.target.checked }))} className="w-4 h-4 rounded" />
              <span className="text-sm" style={{ color: "#94a3b8" }}>{item.label}</span>
            </label>
          ))}
          <div>
            <label className="block text-xs mb-1" style={{ color: "#94a3b8" }}>Sort Order</label>
            <input type="number" value={form.sort_order} onChange={e => setForm(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))} className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" style={inputStyle} />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button type="button" onClick={() => navigate("/admin/projects")} className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-white/10" style={{ color: "#94a3b8" }}>Cancel</button>
          <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-semibold transition-all disabled:opacity-50">
            <Save size={16} />{saving ? "Saving..." : isEditing ? "Update" : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
}
