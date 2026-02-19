import { motion } from "framer-motion";
import { FiExternalLink, FiGithub, FiStar } from "react-icons/fi";
import projects from "../data/projects.json";

const categoryColors = {
  "Embedded & IoT":
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  "Front-End / UI":
    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  "Hardware & Prototyping":
    "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
};

function ProjectCard({ project, isDark, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className={`group rounded-2xl border overflow-hidden transition-all hover:scale-[1.02] ${
        project.featured ? "md:col-span-2 md:row-span-2" : ""
      } ${
        isDark
          ? "bg-[#1E293B] border-[#334155] hover:border-[#3B82F6]/30"
          : "bg-white border-[#E2E8F0] hover:border-[#3B82F6]/30 hover:shadow-xl hover:shadow-blue-500/5"
      }`}
    >
      {/* Image / Placeholder */}
      <div
        className={`relative overflow-hidden ${project.featured ? "h-56 md:h-72" : "h-48"}`}
      >
        {project.image ? (
          <img
            src={project.image}
            alt={project.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <>
            <div
              className={`absolute inset-0 bg-gradient-to-br ${
                project.category === "Embedded & IoT"
                  ? "from-emerald-500/20 to-cyan-500/20"
                  : project.category === "Front-End / UI"
                    ? "from-blue-500/20 to-purple-500/20"
                    : "from-orange-500/20 to-red-500/20"
              } ${isDark ? "opacity-40" : "opacity-60"}`}
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
          className={`absolute top-4 right-4 px-3 py-1 text-xs font-medium rounded-full ${categoryColors[project.category] || ""}`}
        >
          {project.category}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
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
          <div className="mt-5 flex items-center gap-3">
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
            {project.showCode && (
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
          className="text-center mb-16"
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
            From responsive web applications to connected hardware — projects
            that span the full stack and beyond.
          </p>
        </motion.div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, i) => (
            <ProjectCard
              key={project.title}
              project={project}
              isDark={isDark}
              index={i}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
