import { FiAward, FiZap, FiStar } from "react-icons/fi";

const achievements = [
  {
    icon: FiAward,
    title: "MSSU i-SPARK Foundation",
    award: "1st Place & ₹3 Lakhs Grant",
    description:
      "Won 1st place and funding at the State-Level Startup Competition for an innovative hardware-software startup concept.",
  },
  {
    icon: FiZap,
    title: "VSIT IoT & Embedded Systems",
    award: "3rd Prize Design Award",
    description:
      "Recognized for exceptional embedded systems architecture and CircuitPython firmware on the Custom Macropad hardware project.",
  },
  {
    icon: FiStar,
    title: "CIMR & IES College Technical Fest",
    award: "1st Place Creative Clash",
    description:
      "Secured 1st Place in technical innovation and entrepreneurship problem-solving hackathons.",
  },
];

export default function Achievements() {
  return (
    <section className="py-16 sm:py-24 bg-white border-b border-[#d4ccd4]">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
          <span className="font-mono text-xs font-semibold tracking-[0.10em] text-[#240029] uppercase mb-2.5 sm:mb-3 block">
            // 05 · AWARDS & RECOGNITION
          </span>
          <h2 className="font-display text-2xl sm:text-4xl lg:text-5xl font-extrabold text-[#240029] tracking-tight leading-tight">
            Proven track record & honors.
          </h2>
        </div>

        {/* 3-Up Grid of Award Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {achievements.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="card-outseta p-5 sm:p-7 flex flex-col justify-between bg-white"
              >
                <div>
                  <div className="flex items-center gap-3.5 mb-4 sm:mb-5">
                    <div className="w-10 h-10 rounded-full bg-[#240029] text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Icon size={18} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-base text-[#240029]">
                        {item.title}
                      </h3>
                      <span className="font-mono text-xs text-[#df37a7] font-semibold">
                        {item.award}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-[#240029]/80 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
