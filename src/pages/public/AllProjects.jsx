import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiExternalLink, FiGithub, FiArrowLeft } from "react-icons/fi";
import { Link } from "react-router-dom";
import initialProjects from "../../data/allProjects.json";
import { usePortfolioData } from "../../lib/localAdmin";
import { useSEO } from "../../hooks/useSEO";

const CATEGORY_TABS = [
  { id: "all", label: "All Works" },
  { id: "software-web", label: "Software / Web" },
  { id: "iot-hardware", label: "IoT / Hardware" },
  { id: "ui-ux", label: "UI / UX Design" },
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

function ProjectCard({ project }) {
  return (
    <div className="card-outseta flex flex-col h-full bg-white overflow-hidden group">
      {/* Image Container */}
      <div className="aspect-[16/10] overflow-hidden bg-slate-100 relative">
        {project.image ? (
          <img
            src={project.image}
            alt={project.title}
            loading="lazy"
            decoding="async"
            width="800"
            height="500"
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#fdfafc]">
            <span className="font-display font-extrabold text-5xl text-[#240029]/15">
              {project.title.charAt(0)}
            </span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          {project.featured ? (
            <span className="badge-success-outseta text-[11px] px-2.5 py-0.5 shadow-xs">
              ● Featured
            </span>
          ) : (
            <span />
          )}

          <span className="font-mono text-[10px] tracking-wider uppercase px-2 py-0.5 bg-white/90 border border-[#d4ccd4] text-[#240029] rounded-full shadow-xs">
            {project.category}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-display font-bold text-lg text-[#240029]">
            {project.title}
          </h3>
          {project.year && (
            <span className="font-mono text-xs text-[#6d526d] shrink-0 pt-0.5">
              {project.year}
            </span>
          )}
        </div>

        <p className="text-sm leading-relaxed text-[#6d526d] line-clamp-3 mb-4">
          {project.description}
        </p>

        {/* Tags */}
        <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
          {project.tags?.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="text-[11px] font-mono px-2 py-0.5 bg-[#240029]/5 text-[#240029] rounded-[4px]"
            >
              {tag}
            </span>
          ))}
          {project.tags?.length > 4 && (
            <span className="text-[11px] font-mono px-1.5 py-0.5 text-[#6d526d]">
              +{project.tags.length - 4}
            </span>
          )}
        </div>

        {/* Action Row */}
        {(project.showLiveDemo || project.showCode) && (
          <div className="pt-5 mt-4 border-t border-[#d4ccd4]/60 flex items-center gap-3">
            {project.showLiveDemo && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary-fuchsia inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold"
              >
                <FiExternalLink size={13} />
                {project.liveDemoLabel || "View Live"}
              </a>
            )}
            {project.showCode && project.githubUrl && project.githubUrl !== "#" && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost-aubergine inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium"
              >
                <FiGithub size={13} />
                Source
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AllProjects() {
  const [projectList] = usePortfolioData("projects", initialProjects);
  const [activeTab, setActiveTab] = useState("all");

  useSEO({
    title: "All Projects & Engineering Portfolio | Harsh Gupta",
    description: "Explore 14+ software and hardware engineering projects by Harsh Gupta, spanning React, Cloudflare Workers, IoT, embedded systems, and UI/UX design.",
    canonical: "https://harshugupta.in/projects",
  });

  const counts = useMemo(() => {
    return {
      all: projectList.length,
      "software-web": projectList.filter((p) => matchesCategory(p.category, "software-web")).length,
      "iot-hardware": projectList.filter((p) => matchesCategory(p.category, "iot-hardware")).length,
      "ui-ux": projectList.filter((p) => matchesCategory(p.category, "ui-ux")).length,
    };
  }, [projectList]);

  const filteredProjects = useMemo(() => {
    if (activeTab === "all") return projectList;
    return projectList.filter((p) => matchesCategory(p.category, activeTab));
  }, [projectList, activeTab]);

  return (
    <div className="min-h-screen bg-[#fdfafc] text-[#240029]">
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#d4ccd4] shadow-xs">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#240029] hover:text-[#df37a7] transition-colors"
          >
            <FiArrowLeft size={16} />
            Back to Home
          </Link>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold tracking-wider text-[#6d526d] uppercase">
              14+ Production Builds
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-12 sm:py-18">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="mb-10 text-center sm:text-left">
            <span className="font-mono text-xs font-semibold tracking-[0.10em] text-[#240029] uppercase mb-2 block">
              // COMPLETE ARCHIVE
            </span>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#240029] tracking-tight">
              All Engineering Projects
            </h1>
            <p className="mt-3 max-w-2xl text-base sm:text-lg text-[#6d526d] leading-relaxed">
              Every production web application, IoT prototype, assistive device, and design system engineered end-to-end.
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2.5 mb-10">
            {CATEGORY_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              const count = counts[tab.id];
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium cursor-pointer transition-all ${
                    isActive
                      ? "bg-[#240029] text-white border border-[#240029] shadow-xs"
                      : "bg-white text-[#240029] border border-[#d4ccd4] hover:border-[#6d526d] hover:bg-[#240029]/5"
                  }`}
                >
                  <span>{tab.label}</span>
                  {count !== undefined && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-medium ${
                        isActive ? "bg-white/20 text-white" : "bg-[#240029]/5 text-[#6d526d]"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Projects Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((project) => (
                <motion.div
                  key={project.title}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 15 }}
                  transition={{ duration: 0.2 }}
                  className="h-full"
                >
                  <ProjectCard project={project} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
