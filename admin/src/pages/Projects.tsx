import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import {
  Plus,
  Pencil,
  Trash2,
  Star,
  ExternalLink,
  Code,
  FolderKanban,
  Image as ImageIcon,
} from "lucide-react";

interface Project {
  id: string;
  title: string;
  description: string;
  tech_stack: string[];
  category: string;
  github_url: string;
  live_url: string;
  image_url: string;
  featured: boolean;
  show_live_demo: boolean;
  show_code: boolean;
  live_demo_label: string;
  sort_order: number;
  created_at: string;
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("sort_order", { ascending: true });

    if (!error && data) setProjects(data);
    setLoading(false);
  }

  async function toggleFeatured(id: string, current: boolean) {
    await supabase.from("projects").update({ featured: !current }).eq("id", id);
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, featured: !current } : p))
    );
  }

  async function deleteProject(id: string, imageUrl: string) {
    if (!confirm("Are you sure you want to delete this project?")) return;

    // Delete image from storage if it exists
    if (imageUrl && imageUrl.includes("portfolio-images")) {
      const path = imageUrl.split("portfolio-images/")[1];
      if (path) await supabase.storage.from("portfolio-images").remove([path]);
    }

    await supabase.from("projects").delete().eq("id", id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-1">
            Manage your portfolio projects
          </p>
        </div>
        <Link
          to="/projects/new"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all"
        >
          <Plus size={18} />
          Add Project
        </Link>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl py-16 text-center">
          <FolderKanban
            size={48}
            className="mx-auto text-[var(--color-text-muted)]/30 mb-4"
          />
          <h3 className="text-lg font-semibold text-white mb-2">
            No projects yet
          </h3>
          <p className="text-[var(--color-text-muted)] text-sm mb-6">
            Add your first project to get started
          </p>
          <Link
            to="/projects/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-sm font-semibold"
          >
            <Plus size={16} />
            Add Project
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl p-5 flex items-start gap-5 hover:border-blue-500/20 transition-all"
            >
              {/* Image */}
              <div className="w-24 h-24 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center overflow-hidden shrink-0">
                {project.image_url ? (
                  <img
                    src={project.image_url}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon
                    size={24}
                    className="text-[var(--color-text-muted)]/30"
                  />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-white truncate">
                    {project.title}
                  </h3>
                  {project.featured && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-semibold flex items-center gap-1">
                      <Star size={10} fill="currentColor" />
                      Featured
                    </span>
                  )}
                </div>
                <p className="text-sm text-[var(--color-text-muted)] mt-1 line-clamp-2">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {project.tech_stack?.slice(0, 5).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-md bg-[var(--color-surface)] text-[var(--color-text-muted)] text-[11px] font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                  {(project.tech_stack?.length || 0) > 5 && (
                    <span className="px-2 py-0.5 text-[11px] text-[var(--color-text-muted)]">
                      +{project.tech_stack.length - 5} more
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                {project.live_url && (
                  <a
                    href={project.live_url}
                    target="_blank"
                    rel="noopener"
                    className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                    title="Live Demo"
                  >
                    <ExternalLink size={16} />
                  </a>
                )}
                {project.github_url && (
                  <a
                    href={project.github_url}
                    target="_blank"
                    rel="noopener"
                    className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-white hover:bg-white/10 transition-all"
                    title="GitHub"
                  >
                    <Code size={16} />
                  </a>
                )}
                <button
                  onClick={() => toggleFeatured(project.id, project.featured)}
                  className={`p-2 rounded-lg transition-all ${
                    project.featured
                      ? "text-amber-400 bg-amber-500/10 hover:bg-amber-500/20"
                      : "text-[var(--color-text-muted)] hover:text-amber-400 hover:bg-amber-500/10"
                  }`}
                  title="Toggle Featured"
                >
                  <Star size={16} fill={project.featured ? "currentColor" : "none"} />
                </button>
                <Link
                  to={`/projects/${project.id}`}
                  className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                  title="Edit"
                >
                  <Pencil size={16} />
                </Link>
                <button
                  onClick={() => deleteProject(project.id, project.image_url)}
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
