import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Upload, X, Save } from "lucide-react";

export default function BlogForm() {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    content: "",
    cover_image: "",
    published: false,
  });

  useEffect(() => {
    if (isEditing) {
      setLoading(true);
      supabase
        .from("blogs")
        .select("*")
        .eq("id", id)
        .single()
        .then(({ data }) => {
          if (data) setForm(data);
          setLoading(false);
        });
    }
  }, [id, isEditing]);

  function generateSlug(title: string) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const ext = file.name.split(".").pop();
    const fileName = `blogs/${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from("portfolio-images")
      .upload(fileName, file);

    if (!error) {
      const {
        data: { publicUrl },
      } = supabase.storage.from("portfolio-images").getPublicUrl(fileName);
      setForm((prev) => ({ ...prev, cover_image: publicUrl }));
    }
    setUploading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const payload = {
      title: form.title,
      slug: form.slug || generateSlug(form.title),
      content: form.content,
      cover_image: form.cover_image,
      published: form.published,
    };

    if (isEditing) {
      await supabase.from("blogs").update(payload).eq("id", id);
    } else {
      await supabase.from("blogs").insert(payload);
    }

    setSaving(false);
    navigate("/blogs");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/blogs")}
          className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-white hover:bg-white/10 transition-all"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">
            {isEditing ? "Edit Blog Post" : "New Blog Post"}
          </h1>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl p-8 space-y-6"
      >
        {/* Cover Image */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">
            Cover Image
          </label>
          {form.cover_image ? (
            <div className="relative w-full h-48 rounded-xl overflow-hidden border border-[var(--color-border)]">
              <img
                src={form.cover_image}
                alt="Cover"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() =>
                  setForm((prev) => ({ ...prev, cover_image: "" }))
                }
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white hover:bg-red-500 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-36 rounded-xl border-2 border-dashed border-[var(--color-border)] hover:border-[var(--color-primary)]/50 cursor-pointer transition-colors bg-[var(--color-surface)]">
              <Upload
                size={24}
                className="text-[var(--color-text-muted)] mb-2"
              />
              <span className="text-sm text-[var(--color-text-muted)]">
                {uploading ? "Uploading..." : "Click to upload cover image"}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          )}
        </div>

        {/* Title & Slug */}
        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">
              Title *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => {
                const title = e.target.value;
                setForm((prev) => ({
                  ...prev,
                  title,
                  slug: prev.slug || generateSlug(title),
                }));
              }}
              required
              placeholder="My Blog Post"
              className="w-full px-4 py-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-white text-sm placeholder-[var(--color-text-muted)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">
              Slug
            </label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, slug: e.target.value }))
              }
              placeholder="my-blog-post"
              className="w-full px-4 py-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-white text-sm placeholder-[var(--color-text-muted)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] transition-all"
            />
          </div>
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">
            Content (Markdown)
          </label>
          <textarea
            value={form.content}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, content: e.target.value }))
            }
            rows={16}
            placeholder="Write your blog content in Markdown..."
            className="w-full px-4 py-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-white text-sm placeholder-[var(--color-text-muted)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] transition-all resize-y font-mono leading-relaxed"
          />
        </div>

        {/* Published */}
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, published: e.target.checked }))
            }
            className="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)] bg-[var(--color-surface)]"
          />
          <span className="text-sm text-[var(--color-text-muted)]">
            Publish immediately
          </span>
        </label>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate("/blogs")}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-[var(--color-text-muted)] hover:text-white hover:bg-white/10 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50"
          >
            <Save size={16} />
            {saving
              ? "Saving..."
              : isEditing
              ? "Update Post"
              : "Create Post"}
          </button>
        </div>
      </form>
    </div>
  );
}
