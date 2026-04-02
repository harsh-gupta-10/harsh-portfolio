import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  FolderKanban,
  FileText,
  MessageSquare,
  Star,
  TrendingUp,
  Clock,
} from "lucide-react";

interface Stats {
  totalProjects: number;
  totalBlogs: number;
  totalMessages: number;
  featuredProjects: number;
  unreadMessages: number;
  publishedBlogs: number;
}

interface RecentItem {
  id: string;
  type: "project" | "blog" | "message";
  title: string;
  created_at: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalProjects: 0,
    totalBlogs: 0,
    totalMessages: 0,
    featuredProjects: 0,
    unreadMessages: 0,
    publishedBlogs: 0,
  });
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const [projects, blogs, messages] = await Promise.all([
        supabase.from("projects").select("id, featured, created_at, title"),
        supabase.from("blogs").select("id, published, created_at, title"),
        supabase.from("contacts").select("id, is_read, created_at, name, subject"),
      ]);

      const projectList = projects.data || [];
      const blogList = blogs.data || [];
      const messageList = messages.data || [];

      setStats({
        totalProjects: projectList.length,
        totalBlogs: blogList.length,
        totalMessages: messageList.length,
        featuredProjects: projectList.filter((p) => p.featured).length,
        unreadMessages: messageList.filter((m) => !m.is_read).length,
        publishedBlogs: blogList.filter((b) => b.published).length,
      });

      // Combine recent items
      const recent: RecentItem[] = [
        ...projectList.map((p) => ({
          id: p.id,
          type: "project" as const,
          title: p.title,
          created_at: p.created_at,
        })),
        ...blogList.map((b) => ({
          id: b.id,
          type: "blog" as const,
          title: b.title,
          created_at: b.created_at,
        })),
        ...messageList.map((m) => ({
          id: m.id,
          type: "message" as const,
          title: `${m.name}: ${m.subject || "No subject"}`,
          created_at: m.created_at,
        })),
      ];

      recent.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setRecentItems(recent.slice(0, 8));
    } catch (err) {
      console.error("Error fetching stats:", err);
    } finally {
      setLoading(false);
    }
  }

  const statCards = [
    {
      label: "Total Projects",
      value: stats.totalProjects,
      icon: FolderKanban,
      color: "from-blue-500 to-blue-700",
      sub: `${stats.featuredProjects} featured`,
    },
    {
      label: "Total Blogs",
      value: stats.totalBlogs,
      icon: FileText,
      color: "from-purple-500 to-purple-700",
      sub: `${stats.publishedBlogs} published`,
    },
    {
      label: "Messages",
      value: stats.totalMessages,
      icon: MessageSquare,
      color: "from-emerald-500 to-emerald-700",
      sub: `${stats.unreadMessages} unread`,
    },
    {
      label: "Featured",
      value: stats.featuredProjects,
      icon: Star,
      color: "from-amber-500 to-orange-600",
      sub: "highlighted projects",
    },
  ];

  const typeIcons = {
    project: FolderKanban,
    blog: FileText,
    message: MessageSquare,
  };

  const typeColors = {
    project: "text-blue-400 bg-blue-500/10",
    blog: "text-purple-400 bg-purple-500/10",
    message: "text-emerald-400 bg-emerald-500/10",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-[var(--color-text-muted)] text-sm mt-1">
          Overview of your portfolio content
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl p-6 hover:border-blue-500/30 transition-all"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[var(--color-text-muted)] text-sm">
                  {card.label}
                </p>
                <p className="text-3xl font-bold text-white mt-1">
                  {card.value}
                </p>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                  {card.sub}
                </p>
              </div>
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-lg`}
              >
                <card.icon size={20} className="text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl">
        <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-center gap-2">
          <TrendingUp size={18} className="text-[var(--color-primary)]" />
          <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
        </div>
        <div className="divide-y divide-[var(--color-border)]">
          {recentItems.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Clock
                size={40}
                className="mx-auto text-[var(--color-text-muted)]/30 mb-3"
              />
              <p className="text-[var(--color-text-muted)] text-sm">
                No activity yet. Start by adding projects or blogs!
              </p>
            </div>
          ) : (
            recentItems.map((item) => {
              const Icon = typeIcons[item.type];
              const color = typeColors[item.type];
              return (
                <div
                  key={`${item.type}-${item.id}`}
                  className="px-6 py-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors"
                >
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}
                  >
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{item.title}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                    </p>
                  </div>
                  <p className="text-xs text-[var(--color-text-muted)] shrink-0">
                    {new Date(item.created_at).toLocaleDateString()}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
