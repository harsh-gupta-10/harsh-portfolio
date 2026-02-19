import { motion } from "framer-motion";
import { FiCode, FiCpu, FiLayers, FiMonitor, FiBox } from "react-icons/fi";

const highlights = [
  { icon: FiMonitor, label: "UI/UX Design", desc: "User-centered interfaces" },
  { icon: FiCode, label: "Front-End Dev", desc: "Production-ready code" },
  { icon: FiCpu, label: "Embedded & IoT", desc: "Connected hardware systems" },
  {
    icon: FiLayers,
    label: "Electronics",
    desc: "Circuit design & integration",
  },
  { icon: FiBox, label: "3D Printing", desc: "Physical prototyping" },
];

export default function About({ isDark }) {
  return (
    <section
      id="about"
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
            About Me
          </span>
          <h2
            className={`mt-3 text-3xl sm:text-4xl font-display font-bold ${isDark ? "text-white" : "text-[#1E293B]"}`}
          >
            Building Complete Products,{" "}
            <span className="bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6] bg-clip-text text-transparent">
              End to End
            </span>
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
          >
            <div
              className={`space-y-5 text-base leading-relaxed ${isDark ? "text-[#94A3B8]" : "text-[#64748B]"}`}
            >
              <p>
                I'm a multi-disciplinary technologist who works at the
                intersection of software, hardware, and physical product design.
                I don't just write code or design screens — I build complete,
                functional products from concept to reality.
              </p>
              <p>
                On the software side, I design intuitive user interfaces and
                write clean, production-ready front-end code using modern
                frameworks. I care deeply about user experience, performance,
                and accessible design.
              </p>
              <p>
                On the hardware side, I architect embedded systems, integrate
                sensors and microcontrollers for IoT applications, and bring
                ideas into the physical world through rapid prototyping and 3D
                printing — including FDM, SLA, and SLS technologies.
              </p>
              <p>
                This cross-domain expertise allows me to bridge the gap between
                digital and physical product development, delivering solutions
                that work seamlessly across both worlds.
              </p>
            </div>

            {/* Quick Stats */}
            <div className="mt-10 grid grid-cols-3 gap-4">
              {[
                { num: "10+", label: "Projects" },
                { num: "5+", label: "Technologies" },
                { num: "3+", label: "Domains" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className={`text-center p-4 rounded-2xl ${
                    isDark ? "bg-[#1E293B]" : "bg-[#F8FAFC]"
                  }`}
                >
                  <div className="text-2xl font-display font-bold text-[#3B82F6]">
                    {stat.num}
                  </div>
                  <div
                    className={`text-sm mt-1 ${isDark ? "text-[#94A3B8]" : "text-[#64748B]"}`}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Highlight Cards */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            {highlights.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className={`flex items-center gap-5 p-5 rounded-2xl border transition-all hover:scale-[1.02] group ${
                  isDark
                    ? "bg-[#1E293B] border-[#334155] hover:border-[#3B82F6]/30"
                    : "bg-white border-[#E2E8F0] hover:border-[#3B82F6]/30 hover:shadow-lg hover:shadow-blue-500/5"
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1E3A8A]/10 to-[#3B82F6]/10 flex items-center justify-center flex-shrink-0 group-hover:from-[#1E3A8A]/20 group-hover:to-[#3B82F6]/20 transition-colors">
                  <item.icon size={22} className="text-[#3B82F6]" />
                </div>
                <div>
                  <h3
                    className={`font-semibold ${isDark ? "text-white" : "text-[#1E293B]"}`}
                  >
                    {item.label}
                  </h3>
                  <p
                    className={`text-sm ${isDark ? "text-[#94A3B8]" : "text-[#64748B]"}`}
                  >
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
