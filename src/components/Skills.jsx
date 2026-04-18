import { motion } from "framer-motion";
import { FiCode, FiTool, FiCpu, FiBox, FiPenTool, FiSmartphone, FiFileText, FiGrid } from "react-icons/fi";
import {
  SiPython,
  SiJavascript,
  SiTypescript,
  SiCplusplus,
  SiGit,
  SiGithub,
  SiNodedotjs,
  SiLinux,
  SiFigma,
  SiAdobephotoshop,
  SiBlender,
  SiAdobepremierepro,
  SiArduino,
} from "react-icons/si";
import { FaJava, FaDatabase, FaMicrochip } from "react-icons/fa";

const categories = [
  {
    title: "Programming Languages",
    icon: FiCode,
    color: "from-blue-500 to-blue-700",
    skills: [
      { name: "Python", icon: SiPython },
      { name: "JavaScript", icon: SiJavascript },
      { name: "TypeScript", icon: SiTypescript },
      { name: "SQL", icon: FaDatabase },
      { name: "Java", icon: FaJava },
      { name: "C++", icon: SiCplusplus },
      { name: "CircuitPython", icon: SiPython },
      { name: "MicroPython", icon: SiPython },
    ],
  },
  {
    title: "Developer Tools & Platforms",
    icon: FiTool,
    color: "from-purple-500 to-purple-700",
    skills: [
      { name: "Git", icon: SiGit },
      { name: "GitHub", icon: SiGithub },
      { name: "Node.js", icon: SiNodedotjs },
      { name: "Android Studio", icon: FiSmartphone },
      { name: "Apps Script", icon: FiFileText },
      { name: "Linux", icon: SiLinux },
    ],
  },
  {
    title: "Embedded, Electronics & Hardware",
    icon: FiCpu,
    color: "from-emerald-500 to-emerald-700",
    skills: [
      { name: "Embedded Systems", icon: FaMicrochip },
      { name: "IoT Prototyping", icon: FiCpu },
      { name: "Electronics Integration", icon: FaMicrochip },
      { name: "Microcontrollers", icon: FaMicrochip },
      { name: "Sensor Interfacing", icon: FiCpu },
    ],
  },
  {
    title: "Prototyping & Manufacturing",
    icon: FiBox,
    color: "from-orange-500 to-orange-700",
    skills: [
      { name: "Rapid Prototyping", icon: FiBox },
      { name: "3D Printing (FDM)", icon: FiBox },
      { name: "3D Printing (SLA)", icon: FiBox },
      { name: "3D Printing (SLS)", icon: FiBox },
    ],
  },
  {
    title: "Software & Design Tools",
    icon: FiPenTool,
    color: "from-pink-500 to-pink-700",
    skills: [
      { name: "Figma", icon: SiFigma },
      { name: "Photoshop", icon: SiAdobephotoshop },
      { name: "Blender", icon: SiBlender },
      { name: "Premiere Pro", icon: SiAdobepremierepro },
      { name: "Arduino IDE", icon: SiArduino },
      { name: "MS Office", icon: FiFileText },
      { name: "Google Workspace", icon: FiGrid },
    ],
  },
];

export default function Skills({ isDark }) {
  return (
    <section
      id="skills"
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
            Skills & Expertise
          </span>
          <h2
            className={`mt-3 text-3xl sm:text-4xl font-display font-bold ${isDark ? "text-white" : "text-[#1E293B]"}`}
          >
            Technical{" "}
            <span className="bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6] bg-clip-text text-transparent">
              Arsenal
            </span>
          </h2>
          <p
            className={`mt-4 max-w-2xl mx-auto ${isDark ? "text-[#94A3B8]" : "text-[#64748B]"}`}
          >
            A comprehensive toolkit spanning software development, hardware
            engineering, and product design.
          </p>
        </motion.div>

        {/* Skill Categories */}
        <div className="flex flex-wrap justify-center gap-6">
          {categories.map((cat, catIndex) => (
            <motion.div
              key={cat.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: catIndex * 0.1 }}
              className={`w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] p-6 rounded-2xl border transition-all hover:scale-[1.02] ${
                isDark
                  ? "bg-[#1E293B] border-[#334155] hover:border-[#3B82F6]/30"
                  : "bg-white border-[#E2E8F0] hover:border-[#3B82F6]/30 hover:shadow-xl hover:shadow-blue-500/5"
              }`}
            >
              {/* Category Header */}
              <div className="flex items-center gap-3 mb-6">
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center`}
                >
                  <cat.icon size={20} className="text-white" />
                </div>
                <h3
                  className={`font-display font-semibold text-sm ${isDark ? "text-white" : "text-[#1E293B]"}`}
                >
                  {cat.title}
                </h3>
              </div>

              {/* Skills */}
              <div className="flex flex-wrap gap-2">
                {cat.skills.map((skill) => (
                  <span
                    key={skill.name}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      isDark
                        ? "bg-[#0F172A] text-[#94A3B8] hover:text-[#60A5FA]"
                        : "bg-[#F1F5F9] text-[#475569] hover:text-[#1E3A8A] hover:bg-[#EFF6FF]"
                    }`}
                  >
                    <skill.icon size={14} />
                    {skill.name}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
