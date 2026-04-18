import { useEffect, useState } from "react";
import { FolderKanban, Briefcase, Code2, Award, MessageSquare, ExternalLink, GitCommit } from "lucide-react";
import { supabase } from "../../lib/supabase";
import projectsData from "../../data/allProjects.json";
import experienceData from "../../data/experience.json";
import skillsData from "../../data/skills.json";
import certData from "../../data/certificates.json";

export default function PADashboard() {
  const [unreadCount, setUnreadCount] = useState(null);
  const [totalMessages, setTotalMessages] = useState(null);

  useEffect(() => {
    supabase
      .from("messages")
      .select("id, is_read")
      .then(({ data }) => {
        if (data) {
          setTotalMessages(data.length);
          setUnreadCount(data.filter((m) => !m.is_read).length);
        }
      });
  }, []);

  const totalSkills = skillsData.reduce((acc, cat) => acc + cat.skills.length, 0);
  const totalCerts = (certData.row1?.length || 0) + (certData.row2?.length || 0);

  const stats = [
    { icon: FolderKanban, label: "Projects", value: projectsData.length, color: "blue", link: "/portfolio-admin/projects" },
    { icon: Briefcase, label: "Experiences", value: experienceData.length, color: "violet", link: "/portfolio-admin/experience" },
    { icon: Code2, label: "Skills", value: totalSkills, color: "emerald", link: "/portfolio-admin/skills" },
    { icon: Award, label: "Certificates", value: totalCerts, color: "amber", link: "/portfolio-admin/certificates" },
    {
      icon: MessageSquare,
      label: "Messages",
      value: totalMessages === null ? "…" : totalMessages,
      sub: unreadCount === null ? "" : `${unreadCount} unread`,
      color: unreadCount > 0 ? "red" : "slate",
      link: "/portfolio-admin/messages",
    },
  ];

  const colorMap = {
    blue: { bg: "rgba(59,130,246,0.1)", border: "rgba(59,130,246,0.2)", text: "#3b82f6", icon: "rgba(59,130,246,0.7)" },
    violet: { bg: "rgba(139,92,246,0.1)", border: "rgba(139,92,246,0.2)", text: "#8b5cf6", icon: "rgba(139,92,246,0.7)" },
    emerald: { bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.2)", text: "#10b981", icon: "rgba(16,185,129,0.7)" },
    amber: { bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.2)", text: "#f59e0b", icon: "rgba(245,158,11,0.7)" },
    red: { bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.25)", text: "#ef4444", icon: "rgba(239,68,68,0.7)" },
    slate: { bg: "rgba(100,116,139,0.1)", border: "rgba(100,116,139,0.2)", text: "#94a3b8", icon: "rgba(100,116,139,0.7)" },
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-slate-400 mt-1">Overview of your portfolio content. All edits update local files instantly.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {stats.map((s) => {
          const c = colorMap[s.color];
          return (
            <a
              key={s.label}
              href={s.link}
              className="block p-5 rounded-2xl transition-all hover:scale-[1.02] hover:-translate-y-0.5"
              style={{ background: "#1e293b", border: `1px solid ${c.border}` }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: c.bg }}>
                  <s.icon size={18} style={{ color: c.icon }} />
                </div>
              </div>
              <div className="text-3xl font-bold text-white">{s.value}</div>
              <div className="text-sm font-medium mt-1" style={{ color: c.text }}>{s.label}</div>
              {s.sub && <div className="text-xs text-slate-500 mt-0.5">{s.sub}</div>}
            </a>
          );
        })}
      </div>

      {/* Workflow Guide */}
      <div className="rounded-2xl p-6" style={{ background: "#1e293b", border: "1px solid #334155" }}>
        <div className="flex items-center gap-2 mb-4">
          <GitCommit size={18} className="text-blue-400" />
          <h2 className="font-semibold text-white">Your Offline Workflow</h2>
        </div>
        <div className="space-y-3">
          {[
            { step: "1", text: "Edit any section below — Projects, Experience, Skills, About, or Certificates" },
            { step: "2", text: "Click Save — your changes write directly to the local .json files on disk" },
            { step: "3", text: "Open the portfolio at localhost:5173 to preview your changes live" },
            { step: "4", text: "When everything looks good, run git push from your terminal" },
          ].map((s) => (
            <div key={s.step} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-600/20 border border-blue-600/30 text-blue-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                {s.step}
              </div>
              <p className="text-sm text-slate-300">{s.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="rounded-2xl p-5" style={{ background: "#1e293b", border: "1px solid #334155" }}>
          <h3 className="text-sm font-semibold text-white mb-3">Quick Actions</h3>
          <div className="space-y-2">
            {[
              { label: "Add a new project", href: "/portfolio-admin/projects" },
              { label: "Add experience entry", href: "/portfolio-admin/experience" },
              { label: "Check new messages", href: "/portfolio-admin/messages" },
              { label: "Download full backup", href: "/portfolio-admin/backup" },
            ].map((a) => (
              <a
                key={a.label}
                href={a.href}
                className="flex items-center justify-between px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-all"
              >
                {a.label}
                <ExternalLink size={13} className="text-slate-500" />
              </a>
            ))}
          </div>
        </div>

        <div className="rounded-2xl p-5" style={{ background: "#1e293b", border: "1px solid #334155" }}>
          <h3 className="text-sm font-semibold text-white mb-3">Data Files on Disk</h3>
          <div className="space-y-2">
            {[
              "src/data/allProjects.json",
              "src/data/experience.json",
              "src/data/skills.json",
              "src/data/about.json",
              "src/data/certificates.json",
            ].map((f) => (
              <div key={f} className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: "#0f172a" }}>
                <span className="text-emerald-400 text-xs font-mono">●</span>
                <span className="text-xs text-slate-400 font-mono">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
