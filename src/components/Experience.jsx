import { motion } from "framer-motion";
import { FiBriefcase, FiMapPin } from "react-icons/fi";
import experiences from "../data/experience.json";

export default function Experience({ isDark }) {
  return (
    <section
      id="experience"
      className={`py-24 ${isDark ? "bg-[#0B1120]" : "bg-[#F8FAFC]"}`}
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
            Experience
          </span>
          <h2
            className={`mt-3 text-3xl sm:text-4xl font-display font-bold ${isDark ? "text-white" : "text-[#1E293B]"}`}
          >
            Professional{" "}
            <span className="bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6] bg-clip-text text-transparent">
              Journey
            </span>
          </h2>
        </motion.div>

        {/* Timeline */}
        <div className="max-w-3xl mx-auto">
          <div className="relative border-l-2 border-slate-200 dark:border-slate-800 space-y-12 ml-3 sm:ml-6">
            {experiences.map((exp, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative pl-8 md:pl-12"
              >
                {/* Timeline Dot */}
                <div className="absolute -left-[7px] top-10 w-3 h-3 rounded-full bg-gradient-to-br from-[#1E3A8A] to-[#3B82F6] ring-4 ring-[#F8FAFC] dark:ring-[#0B1120]" />

                {/* Content */}
                <div
                  className={`p-6 sm:p-8 rounded-2xl border transition-all hover:-translate-y-1 ${
                    isDark
                      ? "bg-[#1E293B] border-[#334155] hover:border-[#3B82F6]/30"
                      : "bg-white border-[#E2E8F0] hover:border-[#3B82F6]/30 hover:shadow-xl hover:shadow-blue-500/5"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h3 className={`text-xl font-display font-bold ${isDark ? "text-white" : "text-[#1E293B]"}`}>
                      {exp.role}
                    </h3>
                    <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold ${isDark ? "bg-[#0F172A] border border-[#334155] text-[#3B82F6]" : "bg-[#EFF6FF] border border-[#BFDBFE] text-[#1E3A8A]"}`}>
                      {exp.date}
                    </span>
                  </div>

                  <div className={`flex flex-wrap items-center gap-x-6 gap-y-2 mt-4 text-sm ${isDark ? "text-[#94A3B8]" : "text-[#64748B]"}`}>
                    <span className="flex items-center gap-1.5 font-medium">
                      <FiBriefcase size={14} />
                      {exp.company}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <FiMapPin size={14} />
                      {exp.location}
                    </span>
                  </div>

                  {/* Achievements */}
                  <ul className={`mt-6 space-y-3 text-sm leading-relaxed ${isDark ? "text-[#94A3B8]" : "text-[#475569]"}`}>
                    {exp.description.map((point, i) => (
                      <li key={i} className="flex gap-3 items-start">
                        <span className="text-[#3B82F6] mt-1 shrink-0 text-[10px]">
                          &#9670;
                        </span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Technologies */}
                  <div className="mt-8 pt-6 border-t border-dashed border-gray-200 dark:border-gray-700/50 flex flex-wrap gap-2">
                    {exp.technologies.map((tech) => (
                      <span
                        key={tech}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg ${
                          isDark
                            ? "bg-[#0F172A] text-[#94A3B8] border border-[#334155]"
                            : "bg-[#F8FAFC] text-[#475569] border border-[#E2E8F0]"
                        }`}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
