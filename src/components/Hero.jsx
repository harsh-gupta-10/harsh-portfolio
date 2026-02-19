import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { FiGithub, FiLinkedin, FiDownload, FiArrowRight } from "react-icons/fi";

const roles = [
  "Front-End Developer",
  "UI/UX Designer",
  "Embedded & IoT Engineer",
  "Electronics & Prototyping",
  "3D Printing Specialist",
];

export default function Hero({ isDark }) {
  const [roleIndex, setRoleIndex] = useState(0);
  const [text, setText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const currentRole = roles[roleIndex];

  const tick = useCallback(() => {
    if (!isDeleting) {
      setText(currentRole.substring(0, text.length + 1));
      if (text.length + 1 === currentRole.length) {
        setTimeout(() => setIsDeleting(true), 2000);
      }
    } else {
      setText(currentRole.substring(0, text.length - 1));
      if (text.length === 0) {
        setIsDeleting(false);
        setRoleIndex((prev) => (prev + 1) % roles.length);
      }
    }
  }, [text, isDeleting, currentRole, roleIndex]);

  useEffect(() => {
    const speed = isDeleting ? 40 : 80;
    const timer = setTimeout(tick, speed);
    return () => clearTimeout(timer);
  }, [tick, isDeleting]);

  const handleScroll = (e, href) => {
    e.preventDefault();
    const el = document.querySelector(href);
    if (el) {
      const offset = 80;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center overflow-hidden"
    >
      {/* Background patterns */}
      <div className="absolute inset-0 grid-bg" />
      <div className="absolute inset-0 circuit-bg" />

      {/* Animated gradient orbs */}
      <motion.div
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 right-[10%] w-72 h-72 bg-[#1E3A8A]/10 dark:bg-[#3B82F6]/10 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-20 left-[5%] w-96 h-96 bg-[#3B82F6]/8 dark:bg-[#1E3A8A]/10 rounded-full blur-3xl"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="max-w-4xl">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                isDark
                  ? "bg-[#1E293B] text-[#60A5FA] border border-[#334155]"
                  : "bg-[#EFF6FF] text-[#1E3A8A] border border-[#BFDBFE]"
              }`}
            >
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Available for opportunities
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-8 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-tight"
          >
            <span className={isDark ? "text-white" : "text-[#1E293B]"}>
              Hi, I'm{" "}
            </span>
            <span className="bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6] bg-clip-text text-transparent">
              Harsh Gupta
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={`mt-4 text-lg sm:text-xl md:text-2xl font-light ${
              isDark ? "text-[#94A3B8]" : "text-[#64748B]"
            }`}
          >
            I build digital interfaces, embedded systems, and physical products.
          </motion.p>

          {/* Typing animation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-6 flex items-center gap-2"
          >
            <span
              className={`text-lg font-medium ${isDark ? "text-[#CBD5E1]" : "text-[#475569]"}`}
            >
              I'm a{" "}
            </span>
            <span className="text-lg md:text-xl font-semibold text-[#3B82F6] min-w-0">
              {text}
              <span className="typing-cursor text-[#1E3A8A]">|</span>
            </span>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <a
              href="#projects"
              onClick={(e) => handleScroll(e, "#projects")}
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6] text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-blue-500/25 transition-all hover:scale-105 group"
            >
              View Projects
              <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="/resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 px-7 py-3.5 font-semibold rounded-xl border-2 transition-all hover:scale-105 ${
                isDark
                  ? "border-[#334155] text-white hover:bg-[#1E293B]"
                  : "border-[#E2E8F0] text-[#1E293B] hover:bg-[#F8FAFC]"
              }`}
            >
              <FiDownload size={18} />
              Download Resume
            </a>
          </motion.div>

          {/* Social Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-10 flex items-center gap-4"
          >
            <a
              href="https://github.com/harsh-gupta-10"
              target="_blank"
              rel="noopener noreferrer"
              className={`p-3 rounded-xl transition-all hover:scale-110 ${
                isDark
                  ? "bg-[#1E293B] text-[#94A3B8] hover:text-white hover:bg-[#334155]"
                  : "bg-[#F1F5F9] text-[#64748B] hover:text-[#1E293B] hover:bg-[#E2E8F0]"
              }`}
              aria-label="GitHub"
            >
              <FiGithub size={22} />
            </a>
            <a
              href="https://linkedin.com/in/harsh-gupta-2b41692b1"
              target="_blank"
              rel="noopener noreferrer"
              className={`p-3 rounded-xl transition-all hover:scale-110 ${
                isDark
                  ? "bg-[#1E293B] text-[#94A3B8] hover:text-white hover:bg-[#334155]"
                  : "bg-[#F1F5F9] text-[#64748B] hover:text-[#1E293B] hover:bg-[#E2E8F0]"
              }`}
              aria-label="LinkedIn"
            >
              <FiLinkedin size={22} />
            </a>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className={`w-6 h-10 rounded-full border-2 flex justify-center pt-2 ${
            isDark ? "border-[#334155]" : "border-[#CBD5E1]"
          }`}
        >
          <motion.div
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1.5 h-1.5 bg-[#3B82F6] rounded-full"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
