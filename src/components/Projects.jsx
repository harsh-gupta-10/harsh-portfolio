import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiExternalLink, FiGithub, FiStar, FiArrowRight } from "react-icons/fi";
import { Link } from "react-router-dom";
import initialProjects from "../data/projects.json";
import { usePortfolioData } from "../lib/localAdmin";

const CATEGORY_TABS = [
  { id: "all", label: "All" },
  { id: "software-web", label: "Software/Web" },
  { id: "iot-hardware", label: "IoT/Hardware" },
  { id: "ui-ux", label: "UI/UX" },
];

function matchesCategory(projectCategory, tabId) {
  if (tabId === "all") return true;
  const cat = (projectCategory || "").toLowerCase();
  if (tabId === "software-web") {
    return (
      cat.includes("software") ||
      cat.includes("web") ||
      cat.includes("full stack") ||
      cat.includes("front-end")
    );
  }
  if (tabId === "iot-hardware") {
    return (
      cat.includes("iot") ||
      cat.includes("embedded") ||
      cat.includes("hardware")
    );
  }
  if (tabId === "ui-ux") {
    return (
      cat.includes("ui") ||
      cat.includes("ux") ||
      cat.includes("design")
    );
  }
  return true;
}

const coverGradients = {
  "Embedded & IoT": "from-emerald-500/30 to-cyan-500/20",
  "Full Stack Web Dev": "from-indigo-500/30 to-blue-500/15",
  "Front-End Web Dev": "from-sky-500/30 to-blue-500/15",
  "UI/UX Design": "from-fuchsia-500/30 to-purple-500/15",
};

function ProjectCard({ project, isDark, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ type: "spring", stiffness: 260, damping: 24, delay: index * 0.05 }}
      className={`group rounded-2xl border overflow-hidden flex flex-col h-full ${
        isDark
          ? "bg-[#1E293B] border-[#334155] hover:border-[#3B82F6]/40 hover:shadow-xl hover:shadow-blue-500/10"
          : "bg-white border-[#E2E8F0] hover:border-[#3B82F6]/30 hover:shadow-xl hover:shadow-blue-500/10"
      }`}
    >
      {/* Image / Placeholder */}
      <div className="card-shine relative overflow-hidden aspect-video">
        {project.image ? (
          <img
            src={project.image}
            alt={project.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <>
            <div
              className={`cover-fallback absolute inset-0 bg-gradient-to-br ${
                coverGradients[project.category] || "from-blue-500/20 to-indigo-500/20"
              } ${isDark ? "opacity-80" : "opacity-100"}`}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className={`text-6xl font-display font-bold ${isDark ? "text-white/10" : "text-[#1E293B]/10"}`}
              >
                {project.title.charAt(0)}
              </div>
            </div>
          </>
        )}
        {project.featured && (
          <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6] text-white text-xs font-semibold rounded-full">
            <FiStar size={12} />
            Featured
          </div>
        )}
        <div
          className={`absolute top-4 right-4 px-3 py-1 text-xs font-semibold rounded-full shadow-sm ${
            isDark ? "bg-[#0F172A]/92 text-[#BFDBFE]" : "bg-white/92 text-[#1E3A8A]"
          }`}
        >
          {project.category}
        </div>
        {project.year && (
          <div
            className={`absolute bottom-4 left-4 px-2.5 py-1 text-xs font-semibold rounded-full ${
              isDark ? "bg-[#0F172A]/80 text-[#93C5FD]" : "bg-white/85 text-[#1E3A8A]"
            }`}
          >
            {project.year}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1">
        <h3
          className={`text-lg font-display font-bold ${isDark ? "text-white" : "text-[#1E293B]"}`}
        >
          {project.title}
        </h3>
        <p
          className={`mt-2 text-sm leading-relaxed ${isDark ? "text-[#94A3B8]" : "text-[#64748B]"}`}
        >
          {project.description}
        </p>

        {/* Tags */}
        <div className="mt-4 flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className={`px-2.5 py-1 text-xs font-medium rounded-md ${
                isDark
                  ? "bg-[#0F172A] text-[#94A3B8]"
                  : "bg-[#F1F5F9] text-[#475569]"
              }`}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Actions */}
        {(project.showLiveDemo || project.showCode) && (
          <div className="mt-auto pt-6 flex items-center justify-center gap-3">
            {project.showLiveDemo && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6] text-white text-sm font-medium rounded-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all"
              >
                <FiExternalLink size={14} />
                {project.liveDemoLabel || "Live Demo"}
              </a>
            )}
            {project.showCode && project.githubUrl && project.githubUrl !== "#" && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                  isDark
                    ? "border-[#334155] text-[#94A3B8] hover:text-white hover:border-[#475569]"
                    : "border-[#E2E8F0] text-[#64748B] hover:text-[#1E293B] hover:border-[#CBD5E1]"
                }`}
              >
                <FiGithub size={14} />
                Code
              </a>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function Projects({ isDark }) {
  const [projectList] = usePortfolioData("projects", initialProjects);
  const [activeTab, setActiveTab] = useState("all");

  const counts = useMemo(() => {
    return {
      all: projectList.length,
      "software-web": projectList.filter((p) => matchesCategory(p.category, "software-web")).length,
      "iot-hardware": projectList.filter((p) => matchesCategory(p.category, "iot-hardware")).length,
      "ui-ux": projectList.filter((p) => matchesCategory(p.category, "ui-ux")).length,
    };
  }, [projectList]);

  const filteredProjects = useMemo(() => {
    if (activeTab === "all") {
      return projectList;
    }
    return projectList.filter((project) => matchesCategory(project.category, activeTab));
  }, [projectList, activeTab]);

  return (
    <section
      id="projects"
      className={`py-24 ${isDark ? "bg-[#0F172A]" : "bg-white"}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <span className="text-[#3B82F6] font-semibold text-sm uppercase tracking-wider">
            Projects
          </span>
          <h2
            className={`mt-3 text-3xl sm:text-4xl font-display font-bold ${isDark ? "text-white" : "text-[#1E293B]"}`}
          >
            Featured{" "}
            <span className="bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6] bg-clip-text text-transparent">
              Work
            </span>
          </h2>
          <p
            className={`mt-4 max-w-2xl mx-auto ${isDark ? "text-[#94A3B8]" : "text-[#64748B]"}`}
          >
            From full-stack web applications and AI tools to custom embedded IoT hardware and UI/UX prototypes.
          </p>
        </motion.div>

        {/* Category Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-12"
        >
          {CATEGORY_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const count = counts[tab.id];
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 cursor-pointer ${
                  isActive
                    ? "bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6] text-white shadow-lg shadow-blue-500/25 scale-[1.02]"
                    : isDark
                      ? "bg-[#1E293B] text-[#94A3B8] hover:text-white hover:bg-[#334155] border border-[#334155]"
                      : "bg-[#F8FAFC] text-[#64748B] hover:text-[#1E293B] hover:bg-[#F1F5F9] border border-[#E2E8F0] shadow-sm"
                }`}
              >
                <span>{tab.label}</span>
                {count !== undefined && (
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-medium transition-colors ${
                      isActive
                        ? "bg-white/20 text-white"
                        : isDark
                          ? "bg-[#0F172A] text-[#94A3B8]"
                          : "bg-[#E2E8F0] text-[#475569]"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </motion.div>

        {/* Projects Grid */}
        <motion.div
          layout
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project, i) => (
              <motion.div
                key={project.title}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                className="h-full"
              >
                <ProjectCard
                  project={project}
                  isDark={isDark}
                  index={i}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-16 flex justify-center"
        >
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#1E293B] text-white dark:bg-white dark:text-[#1E293B] font-semibold rounded-xl hover:scale-105 transition-transform"
          >
            View All Projects
            <FiArrowRight />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
