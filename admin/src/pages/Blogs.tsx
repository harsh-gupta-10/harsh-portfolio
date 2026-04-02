import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  FileText,
  Calendar,
} from "lucide-react";

interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  cover_image: string;
  published: boolean;
  created_at: string;
}

export default function Blogs() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogs();
  }, []);

  async function fetchBlogs() {
    const { data, error } = await supabase
      .from("blogs")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) setBlogs(data);
    setLoading(false);
  }

  async function togglePublished(id: string, current: boolean) {
    await supabase.from("blogs").update({ published: !current }).eq("id", id);
    setBlogs((prev) =>
      prev.map((b) => (b.id === id ? { ...b, published: !current } : b))
    );
  }

  async function deleteBlog(id: string) {
    if (!confirm("Are you sure you want to delete this blog post?")) return;
    await supabase.from("blogs").delete().eq("id", id);
    setBlogs((prev) => prev.filter((b) => b.id !== id));
  }

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
          <h1 className="text-2xl font-bold text-white">Blogs</h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-1">
            Manage your blog posts
          </p>
        </div>
        <Link
          to="/blogs/new"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all"
        >
          <Plus size={18} />
          New Post
        </Link>
      </div>

      {blogs.length === 0 ? (
        <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl py-16 text-center">
          <FileText
            size={48}
            className="mx-auto text-[var(--color-text-muted)]/30 mb-4"
          />
          <h3 className="text-lg font-semibold text-white mb-2">
            No blog posts yet
          </h3>
          <p className="text-[var(--color-text-muted)] text-sm mb-6">
            Write your first blog post
          </p>
          <Link
            to="/blogs/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-sm font-semibold"
          >
            <Plus size={16} />
            New Post
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {blogs.map((blog) => (
            <div
              key={blog.id}
              className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl p-5 flex items-center gap-5 hover:border-blue-500/20 transition-all"
            >
              {/* Cover */}
              <div className="w-20 h-20 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center overflow-hidden shrink-0">
                {blog.cover_image ? (
                  <img
                    src={blog.cover_image}
                    alt={blog.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FileText
                    size={24}
                    className="text-[var(--color-text-muted)]/30"
                  />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-white truncate">
                    {blog.title}
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      blog.published
                        ? "bg-green-500/10 text-green-400"
                        : "bg-yellow-500/10 text-yellow-400"
                    }`}
                  >
                    {blog.published ? "Published" : "Draft"}
                  </span>
                </div>
                <p className="text-sm text-[var(--color-text-muted)] mt-1">
                  /{blog.slug}
                </p>
                <div className="flex items-center gap-1 mt-1 text-xs text-[var(--color-text-muted)]">
                  <Calendar size={12} />
                  {new Date(blog.created_at).toLocaleDateString()}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => togglePublished(blog.id, blog.published)}
                  className={`p-2 rounded-lg transition-all ${
                    blog.published
                      ? "text-green-400 bg-green-500/10 hover:bg-green-500/20"
                      : "text-[var(--color-text-muted)] hover:text-green-400 hover:bg-green-500/10"
                  }`}
                  title={blog.published ? "Unpublish" : "Publish"}
                >
                  {blog.published ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
                <Link
                  to={`/blogs/${blog.id}`}
                  className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                  title="Edit"
                >
                  <Pencil size={16} />
                </Link>
                <button
                  onClick={() => deleteBlog(blog.id)}
                  className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-danger)] hover:bg-red-500/10 transition-all"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
