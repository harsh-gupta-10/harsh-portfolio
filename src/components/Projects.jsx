import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiExternalLink, FiGithub, FiStar, FiArrowRight } from "react-icons/fi";
import { Link } from "react-router-dom";
import initialProjects from "../data/projects.json";
import { usePortfolioData } from "../lib/localAdmin";

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
      {/* Image Preview with 6px internal image radius */}
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
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#fff1bd]/40 to-[#ffbdd3]/30">
            <span className="font-display font-extrabold text-5xl text-[#240029]/15">
              {project.title.charAt(0)}
            </span>
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          {project.featured ? (
            <span className="badge-success-outseta text-[11px] px-2.5 py-0.5 shadow-xs">
              ● Featured Build
            </span>
          ) : (
            <span />
          )}

          <span className="font-mono text-[10px] tracking-wider uppercase px-2 py-0.5 bg-white/90 border border-[#d4ccd4] text-[#240029] rounded-full shadow-xs">
            {project.category}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 sm:p-6 flex flex-col flex-1">
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
          {project.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="text-[11px] font-mono px-2 py-0.5 bg-[#240029]/5 text-[#240029] rounded-[4px]"
            >
              {tag}
            </span>
          ))}
          {project.tags.length > 4 && (
            <span className="text-[11px] font-mono px-1.5 py-0.5 text-[#6d526d]">
              +{project.tags.length - 4}
            </span>
          )}
        </div>

        {/* Action Row */}
        {(project.showLiveDemo || project.showCode) && (
          <div className="pt-4 sm:pt-5 mt-4 border-t border-[#d4ccd4]/60 flex flex-wrap items-center gap-2.5 sm:gap-3">
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
                className="btn-ghost-aubergine inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium"
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

export default function Projects() {
  const [projectList] = usePortfolioData("projects", initialProjects);
  const displayedProjects = useMemo(() => {
    return projectList.slice(0, 4);
  }, [projectList]);

  return (
    <section id="projects" className="py-16 sm:py-24 bg-white border-b border-[#d4ccd4]">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <span className="font-mono text-xs font-semibold tracking-[0.10em] text-[#240029] uppercase mb-2.5 sm:mb-3 block">
            // 03 · FEATURED WORKS
          </span>
          <h2 className="font-display text-2xl sm:text-4xl lg:text-5xl font-extrabold text-[#240029] tracking-tight leading-tight">
            Selected Production Builds.
          </h2>
          <p className="mt-3 sm:mt-4 text-base sm:text-lg text-[#6d526d] leading-relaxed">
            Full-stack web software, voice ledgers, and custom embedded IoT prototypes engineered end-to-end.
          </p>
        </div>

        {/* 4 Projects Grid (2x2 layout on desktop, 1 col on mobile) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {displayedProjects.map((project) => (
            <div key={project.title} className="h-full">
              <ProjectCard project={project} />
            </div>
          ))}
        </div>

        {/* Bottom CTA to view all works */}
        <div className="mt-10 sm:mt-14 flex flex-col items-center justify-center gap-3 px-2 text-center">
          <Link
            to="/projects"
            className="btn-primary-fuchsia inline-flex items-center justify-center gap-2.5 px-6 sm:px-8 py-3.5 sm:py-4 text-base font-semibold shadow-lg shadow-[#df37a7]/20 hover:scale-105 transition-all w-full sm:w-auto max-w-xs sm:max-w-none text-center"
          >
            Explore All Projects ({projectList.length})
            <FiArrowRight size={18} />
          </Link>
          <span className="text-xs font-mono text-[#6d526d]">
            View complete archive with software, hardware & UI/UX filter tabs
          </span>
        </div>
      </div>
    </section>
  );
}
