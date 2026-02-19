import { motion } from "framer-motion";
import { FiBriefcase, FiMapPin } from "react-icons/fi";

const experiences = [
  {
    role: "Front-End Developer & IoT Engineer",
    company: "Tech Startup",
    location: "Remote",
    description: [
      "Architected and developed responsive web applications using React and TypeScript, improving user engagement by 40%.",
      "Designed and built IoT prototypes with ESP32 microcontrollers and custom sensor arrays for real-time data collection.",
      "Led end-to-end product development from UI design in Figma to embedded firmware and 3D-printed enclosures.",
      "Implemented CI/CD pipelines and automated testing, reducing deployment time by 60%.",
    ],
    technologies: [
      "React",
      "TypeScript",
      "ESP32",
      "Node.js",
      "Figma",
      "3D Printing",
    ],
  },
  {
    role: "UI/UX Designer & Prototyping Engineer",
    company: "Design Studio",
    location: "Hybrid",
    description: [
      "Created user-centered interfaces for web and mobile applications, conducting user research and usability testing.",
      "Developed interactive prototypes using Figma and implemented production-ready front-end components.",
      "Designed custom 3D-printed fixtures and product enclosures for client hardware projects.",
      "Collaborated cross-functionally with engineering teams to bridge design and implementation.",
    ],
    technologies: [
      "Figma",
      "React",
      "JavaScript",
      "Blender",
      "Arduino",
      "FDM Printing",
    ],
  },
  {
    role: "Embedded Systems Intern",
    company: "Hardware Company",
    location: "On-site",
    description: [
      "Developed firmware for microcontroller-based products using C++ and MicroPython.",
      "Integrated various sensors and communication protocols (I2C, SPI, UART, MQTT) for IoT applications.",
      "Contributed to PCB layout reviews and hardware testing for production units.",
      "Created technical documentation and internal tools using Python and Google Apps Script.",
    ],
    technologies: [
      "C++",
      "MicroPython",
      "MQTT",
      "PCB Design",
      "Python",
      "Linux",
    ],
  },
];

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
        <div className="relative">
          {/* Timeline Line */}
          <div
            className={`absolute left-0 md:left-1/2 top-0 bottom-0 w-px ${
              isDark ? "bg-[#334155]" : "bg-[#E2E8F0]"
            } hidden md:block`}
            style={{ transform: "translateX(-50%)" }}
          />

          <div className="space-y-12">
            {experiences.map((exp, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className={`relative flex flex-col md:flex-row gap-8 ${
                  index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                {/* Timeline Dot */}
                <div
                  className="absolute left-0 md:left-1/2 top-0 w-4 h-4 rounded-full bg-gradient-to-br from-[#1E3A8A] to-[#3B82F6] border-4 border-white dark:border-[#0B1120] hidden md:block"
                  style={{ transform: "translate(-50%, 0)" }}
                />

                {/* Content */}
                <div
                  className={`md:w-1/2 ${index % 2 === 0 ? "md:pr-12 md:text-right" : "md:pl-12"}`}
                >
                  <div
                    className={`p-6 rounded-2xl border transition-all hover:scale-[1.01] ${
                      isDark
                        ? "bg-[#1E293B] border-[#334155] hover:border-[#3B82F6]/30"
                        : "bg-white border-[#E2E8F0] hover:border-[#3B82F6]/30 hover:shadow-xl hover:shadow-blue-500/5"
                    }`}
                  >
                    <h3
                      className={`mt-2 text-lg font-display font-bold ${isDark ? "text-white" : "text-[#1E293B]"}`}
                    >
                      {exp.role}
                    </h3>

                    <div
                      className={`flex items-center gap-4 mt-1 text-sm ${isDark ? "text-[#94A3B8]" : "text-[#64748B]"} ${index % 2 === 0 ? "md:justify-end" : ""}`}
                    >
                      <span className="flex items-center gap-1">
                        <FiBriefcase size={13} />
                        {exp.company}
                      </span>
                      <span className="flex items-center gap-1">
                        <FiMapPin size={13} />
                        {exp.location}
                      </span>
                    </div>

                    {/* Achievements */}
                    <ul
                      className={`mt-4 space-y-2 text-sm ${isDark ? "text-[#94A3B8]" : "text-[#64748B]"}`}
                    >
                      {exp.description.map((point, i) => (
                        <li
                          key={i}
                          className={`flex gap-2 ${index % 2 === 0 ? "md:justify-end" : ""}`}
                        >
                          <span className="text-[#3B82F6] mt-1 flex-shrink-0">
                            &#8226;
                          </span>
                          <span
                            className={index % 2 === 0 ? "md:text-right" : ""}
                          >
                            {point}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {/* Technologies */}
                    <div
                      className={`mt-4 flex flex-wrap gap-2 ${index % 2 === 0 ? "md:justify-end" : ""}`}
                    >
                      {exp.technologies.map((tech) => (
                        <span
                          key={tech}
                          className={`px-2.5 py-1 text-xs font-medium rounded-md ${
                            isDark
                              ? "bg-[#0F172A] text-[#94A3B8]"
                              : "bg-[#F1F5F9] text-[#475569]"
                          }`}
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Spacer for opposite side */}
                <div className="hidden md:block md:w-1/2" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
