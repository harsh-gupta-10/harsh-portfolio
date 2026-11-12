import initialCategories from "../data/skills.json";
import { usePortfolioData } from "../lib/localAdmin";
import { getIcon } from "../lib/iconRegistry";

export default function Skills() {
  const [categories] = usePortfolioData("skills", initialCategories);

  return (
    <section id="skills" className="py-16 sm:py-24 bg-[#fdfafc] border-b border-[#d4ccd4]">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
          <span className="font-mono text-xs font-semibold tracking-[0.10em] text-[#240029] uppercase mb-2.5 sm:mb-3 block">
            // 02 · TOOLKIT & STACK
          </span>
          <h2 className="font-display text-2xl sm:text-4xl lg:text-5xl font-extrabold text-[#240029] tracking-tight leading-tight">
            Engineered with precision tools.
          </h2>
          <p className="mt-3 sm:mt-4 text-base sm:text-lg text-[#6d526d] leading-relaxed">
            An end-to-end stack spanning modern web engines, edge serverless databases, microcontroller hardware, and CAD fabrication.
          </p>
        </div>

        {/* Skill Category Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {categories.map((cat, catIndex) => {
            const CatIcon = getIcon(cat.iconKey);
            return (
              <div
                key={cat.title || catIndex}
                className="card-outseta p-5 sm:p-6 flex flex-col justify-between bg-white"
              >
                {/* Category Header */}
                <div>
                  <div className="flex items-center gap-3 mb-4 sm:mb-5">
                    <div className="w-10 h-10 rounded-[8px] bg-[#240029] text-white flex items-center justify-center shrink-0">
                      <CatIcon size={20} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-base text-[#240029]">
                        {cat.title}
                      </h3>
                      <span className="font-mono text-[11px] text-[#6d526d] tracking-wider uppercase">
                        {cat.skills?.length || 0} Specializations
                      </span>
                    </div>
                  </div>

                  {/* Skills Pills */}
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-1">
                    {cat.skills.map((skill) => {
                      const SkillIcon = getIcon(skill.iconKey);
                      return (
                        <span
                          key={skill.name}
                          className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 bg-white border border-[#d4ccd4] hover:border-[#6d526d] hover:bg-[#240029]/5 text-[#240029] rounded-full text-xs font-medium transition-colors"
                        >
                          <SkillIcon size={12} className="text-[#6d526d]" />
                          {skill.name}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
