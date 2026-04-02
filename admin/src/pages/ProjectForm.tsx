import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Upload, X, Save } from "lucide-react";

export default function ProjectForm() {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    tech_stack: "",
    category: "",
    github_url: "",
    live_url: "",
    image_url: "",
    featured: false,
    show_live_demo: false,
    show_code: false,
    live_demo_label: "Live Demo",
    sort_order: 0,
  });

  useEffect(() => {
    if (isEditing) {
      setLoading(true);
      supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .single()
        .then(({ data }) => {
          if (data) {
            setForm({
              ...data,
              tech_stack: (data.tech_stack || []).join(", "),
            });
          }
          setLoading(false);
        });
    }
  }, [id, isEditing]);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const ext = file.name.split(".").pop();
    const fileName = `projects/${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from("portfolio-images")
      .upload(fileName, file);

    if (!error) {
      const {
        data: { publicUrl },
      } = supabase.storage.from("portfolio-images").getPublicUrl(fileName);
      setForm((prev) => ({ ...prev, image_url: publicUrl }));
    }
    setUploading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const payload = {
      title: form.title,
      description: form.description,
      tech_stack: form.tech_stack
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      category: form.category,
      github_url: form.github_url,
      live_url: form.live_url,
      image_url: form.image_url,
      featured: form.featured,
      show_live_demo: form.show_live_demo,
      show_code: form.show_code,
      live_demo_label: form.live_demo_label,
      sort_order: form.sort_order,
    };

    if (isEditing) {
      await supabase.from("projects").update(payload).eq("id", id);
    } else {
      await supabase.from("projects").insert(payload);
    }

    setSaving(false);
    navigate("/projects");
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
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/projects")}
          className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-white hover:bg-white/10 transition-all"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">
            {isEditing ? "Edit Project" : "Add Project"}
          </h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-0.5">
            {isEditing
              ? "Update project details"
              : "Add a new project to your portfolio"}
          </p>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl p-8 space-y-6"
      >
        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">
            Project Image
          </label>
          {form.image_url ? (
            <div className="relative w-full h-48 rounded-xl overflow-hidden border border-[var(--color-border)]">
              <img
                src={form.image_url}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, image_url: "" }))}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white hover:bg-red-500 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-48 rounded-xl border-2 border-dashed border-[var(--color-border)] hover:border-[var(--color-primary)]/50 cursor-pointer transition-colors bg-[var(--color-surface)]">
              <Upload
                size={24}
                className="text-[var(--color-text-muted)] mb-2"
              />
              <span className="text-sm text-[var(--color-text-muted)]">
                {uploading ? "Uploading..." : "Click to upload image"}
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

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">
            Title *
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, title: e.target.value }))
            }
            required
            placeholder="My Awesome Project"
            className="w-full px-4 py-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-white text-sm placeholder-[var(--color-text-muted)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] transition-all"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">
            Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, description: e.target.value }))
            }
            rows={4}
            placeholder="Describe your project..."
            className="w-full px-4 py-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-white text-sm placeholder-[var(--color-text-muted)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] transition-all resize-none"
          />
        </div>

        {/* Tech Stack & Category */}
        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">
              Tech Stack (comma-separated)
            </label>
            <input
              type="text"
              value={form.tech_stack}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, tech_stack: e.target.value }))
              }
              placeholder="React, TypeScript, Node.js"
              className="w-full px-4 py-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-white text-sm placeholder-[var(--color-text-muted)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">
              Category
            </label>
            <select
              value={form.category}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, category: e.target.value }))
              }
              className="w-full px-4 py-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] transition-all"
            >
              <option value="">Select category</option>
              <option value="Front-End / UI">Front-End / UI</option>
              <option value="Embedded & IoT">Embedded & IoT</option>
              <option value="Hardware & Prototyping">
                Hardware & Prototyping
              </option>
              <option value="Mobile Application">Mobile Application</option>
              <option value="UI/UX Design">UI/UX Design</option>
              <option value="Full-Stack">Full-Stack</option>
            </select>
          </div>
        </div>

        {/* URLs */}
        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">
              GitHub URL
            </label>
            <input
              type="url"
              value={form.github_url}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, github_url: e.target.value }))
              }
              placeholder="https://github.com/..."
              className="w-full px-4 py-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-white text-sm placeholder-[var(--color-text-muted)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">
              Live URL
            </label>
            <input
              type="url"
              value={form.live_url}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, live_url: e.target.value }))
              }
              placeholder="https://myproject.com"
              className="w-full px-4 py-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-white text-sm placeholder-[var(--color-text-muted)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] transition-all"
            />
          </div>
        </div>

        {/* Toggles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { key: "featured", label: "Featured" },
            { key: "show_live_demo", label: "Show Live Demo" },
            { key: "show_code", label: "Show Code" },
          ].map((item) => (
            <label
              key={item.key}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={(form as Record<string, unknown>)[item.key] as boolean}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    [item.key]: e.target.checked,
                  }))
                }
                className="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)] bg-[var(--color-surface)]"
              />
              <span className="text-sm text-[var(--color-text-muted)]">
                {item.label}
              </span>
            </label>
          ))}
          <div>
            <label className="block text-xs text-[var(--color-text-muted)] mb-1">
              Sort Order
            </label>
            <input
              type="number"
              value={form.sort_order}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  sort_order: parseInt(e.target.value) || 0,
                }))
              }
              className="w-full px-3 py-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 transition-all"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate("/projects")}
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
            {saving ? "Saving..." : isEditing ? "Update Project" : "Create Project"}
          </button>
        </div>
      </form>
    </div>
  );
}
