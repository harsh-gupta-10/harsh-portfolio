import { FiBriefcase, FiMapPin } from "react-icons/fi";
import initialExperiences from "../data/experience.json";
import { usePortfolioData } from "../lib/localAdmin";

export default function Experience() {
  const [experiences] = usePortfolioData("experience", initialExperiences);

  return (
    <section id="experience" className="py-16 sm:py-24 bg-[#fdfafc] border-b border-[#d4ccd4]">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
          <span className="font-mono text-xs font-semibold tracking-[0.10em] text-[#240029] uppercase mb-2.5 sm:mb-3 block">
            // 04 · TRACK RECORD & ROLES
          </span>
          <h2 className="font-display text-2xl sm:text-4xl lg:text-5xl font-extrabold text-[#240029] tracking-tight leading-tight">
            Professional experience & milestones.
          </h2>
          <p className="mt-3 sm:mt-4 text-base sm:text-lg text-[#6d526d] leading-relaxed">
            Leading development, architecting full-stack systems, and deploying hardware prototypes.
          </p>
        </div>

        {/* Timeline Stack */}
        <div className="max-w-3xl mx-auto space-y-5 sm:space-y-6">
          {experiences.map((exp, index) => (
            <div
              key={exp.role || index}
              className="card-outseta p-5 sm:p-8 bg-white"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 mb-3">
                <h3 className="font-display font-bold text-lg sm:text-xl text-[#240029]">
                  {exp.role}
                </h3>
                <span className="font-mono text-xs px-3 py-1 bg-white border border-[#d4ccd4] text-[#240029] rounded-full shrink-0 w-fit">
                  {exp.date}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 sm:gap-x-5 gap-y-1 text-xs sm:text-sm text-[#6d526d] mb-4">
                <span className="flex items-center gap-1.5 font-medium text-[#240029]">
                  <FiBriefcase size={14} className="text-[#6d526d]" />
                  {exp.company}
                </span>
                <span className="flex items-center gap-1.5">
                  <FiMapPin size={14} className="text-[#6d526d]" />
                  {exp.location}
                </span>
              </div>

              {/* Achievements */}
              <ul className="space-y-2 text-xs sm:text-sm text-[#240029]/85 leading-relaxed">
                {exp.description.map((point, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#df37a7] mt-1.5 sm:mt-2 shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>

              {/* Technologies */}
              {exp.technologies && exp.technologies.length > 0 && (
                <div className="mt-5 sm:mt-6 pt-4 border-t border-[#d4ccd4]/60 flex flex-wrap gap-1.5">
                  {exp.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="text-[11px] font-mono px-2 py-0.5 bg-[#240029]/5 text-[#240029] rounded-[4px]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
