import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { ArrowLeft, Upload, X, Save } from "lucide-react";

export default function BlogForm() {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ title: "", slug: "", content: "", cover_image: "", published: false });

  useEffect(() => {
    if (isEditing) {
      setLoading(true);
      supabase.from("blogs").select("*").eq("id", id).single().then(({ data }) => {
        if (data) setForm(data);
        setLoading(false);
      });
    }
  }, [id, isEditing]);

  function generateSlug(title) {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }

  async function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fileName = `blogs/${Date.now()}.${file.name.split(".").pop()}`;
    const { error } = await supabase.storage.from("portfolio-images").upload(fileName, file);
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from("portfolio-images").getPublicUrl(fileName);
      setForm(prev => ({ ...prev, cover_image: publicUrl }));
    }
    setUploading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    const payload = { title: form.title, slug: form.slug || generateSlug(form.title), content: form.content, cover_image: form.cover_image, published: form.published };
    if (isEditing) await supabase.from("blogs").update(payload).eq("id", id);
    else await supabase.from("blogs").insert(payload);
    setSaving(false);
    navigate("/admin/blogs");
  }

  const inputStyle = { background: "#111827", border: "1px solid #334155", color: "#f1f5f9" };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate("/admin/blogs")} className="p-2 rounded-lg transition-all hover:bg-white/10" style={{ color: "#94a3b8" }}><ArrowLeft size={20} /></button>
        <h1 className="text-2xl font-bold text-white">{isEditing ? "Edit Blog Post" : "New Blog Post"}</h1>
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl p-8 space-y-6" style={{ background: "#1e293b", border: "1px solid #334155" }}>
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: "#94a3b8" }}>Cover Image</label>
          {form.cover_image ? (
            <div className="relative w-full h-48 rounded-xl overflow-hidden" style={{ border: "1px solid #334155" }}>
              <img src={form.cover_image} alt="Cover" className="w-full h-full object-cover" />
              <button type="button" onClick={() => setForm(prev => ({ ...prev, cover_image: "" }))} className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white hover:bg-red-500"><X size={16} /></button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-36 rounded-xl border-2 border-dashed cursor-pointer" style={{ borderColor: "#334155", background: "#111827" }}>
              <Upload size={24} className="mb-2" style={{ color: "#94a3b8" }} />
              <span className="text-sm" style={{ color: "#94a3b8" }}>{uploading ? "Uploading..." : "Click to upload cover image"}</span>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
            </label>
          )}
        </div>

        <div className="grid grid-cols-2 gap-5">
          <div><label className="block text-sm font-medium mb-2" style={{ color: "#94a3b8" }}>Title *</label><input type="text" value={form.title} onChange={e => { const title = e.target.value; setForm(prev => ({ ...prev, title, slug: prev.slug || generateSlug(title) })); }} required placeholder="My Blog Post" className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" style={inputStyle} /></div>
          <div><label className="block text-sm font-medium mb-2" style={{ color: "#94a3b8" }}>Slug</label><input type="text" value={form.slug} onChange={e => setForm(prev => ({ ...prev, slug: e.target.value }))} placeholder="my-blog-post" className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" style={inputStyle} /></div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: "#94a3b8" }}>Content (Markdown)</label>
          <textarea value={form.content} onChange={e => setForm(prev => ({ ...prev, content: e.target.value }))} rows={16} placeholder="Write your blog content in Markdown..." className="w-full px-4 py-3 rounded-xl text-sm resize-y font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500/50" style={inputStyle} />
        </div>

        <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={form.published} onChange={e => setForm(prev => ({ ...prev, published: e.target.checked }))} className="w-4 h-4 rounded" /><span className="text-sm" style={{ color: "#94a3b8" }}>Publish immediately</span></label>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button type="button" onClick={() => navigate("/admin/blogs")} className="px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-white/10" style={{ color: "#94a3b8" }}>Cancel</button>
          <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-semibold disabled:opacity-50"><Save size={16} />{saving ? "Saving..." : isEditing ? "Update" : "Create"}</button>
        </div>
      </form>
    </div>
  );
}
