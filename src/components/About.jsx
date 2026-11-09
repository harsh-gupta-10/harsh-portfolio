import { motion } from "framer-motion";
import initialAboutData from "../data/about.json";
import { usePortfolioData } from "../lib/localAdmin";
import { getIcon } from "../lib/iconRegistry";

export default function About() {
  const [data] = usePortfolioData("about", initialAboutData);
  const { bio = [], stats = [], highlights = [] } = data || {};

  return (
    <section id="about" className="py-24 bg-white border-b border-[#d4ccd4]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="font-mono text-xs font-semibold tracking-[0.10em] text-[#240029] uppercase mb-3 block">
            // 01 · ABOUT THE ENGINEER
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#240029] tracking-tight leading-tight">
            Building complete products, end to end.
          </h2>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 items-start">
          {/* Bio & Philosophy (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-4 text-base sm:text-lg leading-relaxed text-[#240029]/90 font-normal">
              {bio.map((paragraph, i) => (
                <p key={i} className="text-[#240029]/85">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Outseta Stats Row */}
            <div className="pt-6 grid grid-cols-3 gap-4">
              {stats.map((stat, idx) => (
                <div
                  key={stat.label || idx}
                  className="card-outseta p-5 text-center flex flex-col justify-center"
                >
                  <div className="font-display font-extrabold text-3xl sm:text-4xl text-[#240029] tracking-tight">
                    {stat.num}
                  </div>
                  <div className="text-xs sm:text-sm font-medium text-[#6d526d] mt-1.5">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Highlights / Specializations (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="font-display font-bold text-xl text-[#240029] mb-4">
              Core Capabilities
            </h3>
            {highlights.map((item, i) => {
              const ItemIcon = getIcon(item.iconKey);
              return (
                <div
                  key={item.label || i}
                  className="card-outseta p-4 flex items-center gap-4 group"
                >
                  {/* Numbered / Icon indicator */}
                  <div className="w-10 h-10 rounded-full bg-[#240029] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <ItemIcon size={18} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm sm:text-base text-[#240029]">
                      {item.label}
                    </div>
                    {item.desc && (
                      <div className="text-xs sm:text-sm text-[#6d526d] mt-0.5">
                        {item.desc}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
