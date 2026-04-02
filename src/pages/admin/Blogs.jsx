import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { Plus, Pencil, Trash2, Eye, EyeOff, FileText, Calendar } from "lucide-react";

export default function Blogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchBlogs(); }, []);

  async function fetchBlogs() {
    const { data } = await supabase.from("blogs").select("*").order("created_at", { ascending: false });
    if (data) setBlogs(data);
    setLoading(false);
  }

  async function togglePublished(id, current) {
    await supabase.from("blogs").update({ published: !current }).eq("id", id);
    setBlogs(prev => prev.map(b => b.id === id ? { ...b, published: !current } : b));
  }

  async function deleteBlog(id) {
    if (!confirm("Delete this blog post?")) return;
    await supabase.from("blogs").delete().eq("id", id);
    setBlogs(prev => prev.filter(b => b.id !== id));
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">Blogs</h1><p className="text-sm mt-1" style={{ color: "#94a3b8" }}>Manage your blog posts</p></div>
        <Link to="/admin/blogs/new" className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-semibold" style={{ boxShadow: "0 4px 16px rgba(59,130,246,0.25)" }}><Plus size={18} />New Post</Link>
      </div>

      {blogs.length === 0 ? (
        <div className="rounded-2xl py-16 text-center" style={{ background: "#1e293b", border: "1px solid #334155" }}>
          <FileText size={48} className="mx-auto mb-4" style={{ color: "rgba(148,163,184,0.3)" }} />
          <h3 className="text-lg font-semibold text-white mb-2">No blog posts yet</h3>
          <p className="text-sm mb-6" style={{ color: "#94a3b8" }}>Write your first blog post</p>
          <Link to="/admin/blogs/new" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold"><Plus size={16} />New Post</Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {blogs.map(blog => (
            <div key={blog.id} className="rounded-2xl p-5 flex items-center gap-5 transition-all hover:border-blue-500/20" style={{ background: "#1e293b", border: "1px solid #334155" }}>
              <div className="w-20 h-20 rounded-xl flex items-center justify-center overflow-hidden shrink-0" style={{ background: "#111827", border: "1px solid #334155" }}>
                {blog.cover_image ? <img src={blog.cover_image} alt={blog.title} className="w-full h-full object-cover" /> : <FileText size={24} style={{ color: "rgba(148,163,184,0.3)" }} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-white truncate">{blog.title}</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: blog.published ? "rgba(34,197,94,0.1)" : "rgba(234,179,8,0.1)", color: blog.published ? "#4ade80" : "#fbbf24" }}>
                    {blog.published ? "Published" : "Draft"}
                  </span>
                </div>
                <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>/{blog.slug}</p>
                <div className="flex items-center gap-1 mt-1 text-xs" style={{ color: "#94a3b8" }}><Calendar size={12} />{new Date(blog.created_at).toLocaleDateString()}</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => togglePublished(blog.id, blog.published)} className="p-2 rounded-lg transition-all" style={{ color: blog.published ? "#4ade80" : "#94a3b8", background: blog.published ? "rgba(34,197,94,0.1)" : "transparent" }} title={blog.published ? "Unpublish" : "Publish"}>
                  {blog.published ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
                <Link to={`/admin/blogs/${blog.id}`} className="p-2 rounded-lg transition-all hover:bg-blue-500/10" style={{ color: "#94a3b8" }}><Pencil size={16} /></Link>
                <button onClick={() => deleteBlog(blog.id)} className="p-2 rounded-lg transition-all hover:bg-red-500/10" style={{ color: "#94a3b8" }}><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
