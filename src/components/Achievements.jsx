import { motion } from "framer-motion";
import { FiAward, FiZap, FiStar } from "react-icons/fi";

const achievements = [
  {
    icon: FiAward,
    title: "MSSU i-SPARK Foundation",
    description:
      "Won 1st place and ₹3 Lakhs funding at the State-Level Startup Competition for an innovative hardware-software startup concept.",
    color: "from-yellow-500 to-amber-600",
  },
  {
    icon: FiZap,
    title: "VSIT IoT / Embedded Systems",
    description:
      "Recognized with 3rd Prize for exceptional embedded systems design and innovation with the Macro Keyboard project.",
    color: "from-purple-500 to-violet-600",
  },
  {
    icon: FiStar,
    title: "Glimpses by CIMR & IES College",
    description:
      "Secured 1st Place in both Creative Clash 1.0 events, demonstrating creative excellence in technical innovation and entrepreneurship.",
    color: "from-blue-500 to-cyan-600",
  },
];

export default function Achievements({ isDark }) {
  return (
    <section className={`py-24 ${isDark ? "bg-[#0F172A]" : "bg-white"}`}>
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
            Recognition
          </span>
          <h2
            className={`mt-3 text-3xl sm:text-4xl font-display font-bold ${isDark ? "text-white" : "text-[#1E293B]"}`}
          >
            Achievements &{" "}
            <span className="bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6] bg-clip-text text-transparent">
              Awards
            </span>
          </h2>
        </motion.div>

        {/* Achievement Cards */}
        <div className="flex flex-wrap justify-center gap-6">
          {achievements.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className={`w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] p-6 rounded-2xl border text-center transition-all hover:scale-105 ${
                isDark
                  ? "bg-[#1E293B] border-[#334155] hover:border-[#3B82F6]/30"
                  : "bg-white border-[#E2E8F0] hover:border-[#3B82F6]/30 hover:shadow-xl hover:shadow-blue-500/5"
              }`}
            >
              <div
                className={`w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4`}
              >
                <item.icon size={24} className="text-white" />
              </div>
              <h3
                className={`font-display font-bold ${isDark ? "text-white" : "text-[#1E293B]"}`}
              >
                {item.title}
              </h3>
              <p
                className={`mt-2 text-sm leading-relaxed ${isDark ? "text-[#94A3B8]" : "text-[#64748B]"}`}
              >
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
