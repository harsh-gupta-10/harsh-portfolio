import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiSun, FiMoon, FiMenu, FiX } from "react-icons/fi";

const navLinks = [
  { name: "Home", href: "#home" },
  { name: "About", href: "#about" },
  { name: "Skills", href: "#skills" },
  { name: "Projects", href: "#projects" },
  { name: "Experience", href: "#experience" },
  { name: "Certificates", href: "#certificates" },
  { name: "Contact", href: "#contact" },
];

export default function Navbar({ isDark, toggleDark }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0.1 },
    );

    navLinks.forEach(({ href }) => {
      const el = document.querySelector(href);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleClick = (e, href) => {
    e.preventDefault();
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) {
      const offset = 80;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? isDark
            ? "bg-[#0F172A]/90 backdrop-blur-xl shadow-lg shadow-black/10"
            : "bg-white/90 backdrop-blur-xl shadow-lg shadow-black/5"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <a
            href="#home"
            onClick={(e) => handleClick(e, "#home")}
            className="flex items-center gap-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1E3A8A] to-[#3B82F6] flex items-center justify-center text-white font-display font-bold text-lg group-hover:scale-105 transition-transform">
              H
            </div>
            <span
              className={`font-display font-semibold text-lg hidden sm:block ${isDark ? "text-white" : "text-[#1E293B]"}`}
            >
              Harsh<span className="text-[#3B82F6]">.</span>
            </span>
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ name, href }) => (
              <a
                key={name}
                href={href}
                onClick={(e) => handleClick(e, href)}
                className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeSection === href.slice(1)
                    ? "text-[#1E3A8A] dark:text-[#60A5FA]"
                    : isDark
                      ? "text-[#94A3B8] hover:text-white"
                      : "text-[#64748B] hover:text-[#1E293B]"
                }`}
              >
                {name}
                {activeSection === href.slice(1) && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 bg-[#1E3A8A]/10 dark:bg-[#3B82F6]/10 rounded-lg"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </a>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Dark mode toggle */}
            <button
              onClick={toggleDark}
              className={`p-2.5 rounded-xl transition-colors ${
                isDark
                  ? "bg-[#1E293B] text-yellow-400 hover:bg-[#334155]"
                  : "bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]"
              }`}
              aria-label="Toggle dark mode"
            >
              {isDark ? <FiSun size={18} /> : <FiMoon size={18} />}
            </button>

            {/* Hire Me CTA */}
            <a
              href="#contact"
              onClick={(e) => handleClick(e, "#contact")}
              className="hidden md:inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6] text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all hover:scale-105"
            >
              Hire Me
            </a>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={`md:hidden p-2.5 rounded-xl transition-colors ${
                isDark
                  ? "bg-[#1E293B] text-white hover:bg-[#334155]"
                  : "bg-[#F1F5F9] text-[#1E293B] hover:bg-[#E2E8F0]"
              }`}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className={`md:hidden border-t ${
              isDark
                ? "bg-[#0F172A]/95 border-[#1E293B]"
                : "bg-white/95 border-[#E2E8F0]"
            } backdrop-blur-xl`}
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map(({ name, href }) => (
                <a
                  key={name}
                  href={href}
                  onClick={(e) => handleClick(e, href)}
                  className={`block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    activeSection === href.slice(1)
                      ? "bg-[#1E3A8A]/10 text-[#1E3A8A] dark:bg-[#3B82F6]/10 dark:text-[#60A5FA]"
                      : isDark
                        ? "text-[#94A3B8] hover:text-white hover:bg-[#1E293B]"
                        : "text-[#64748B] hover:text-[#1E293B] hover:bg-[#F1F5F9]"
                  }`}
                >
                  {name}
                </a>
              ))}
              <a
                href="#contact"
                onClick={(e) => handleClick(e, "#contact")}
                className="block px-4 py-3 bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6] text-white text-sm font-semibold rounded-xl text-center mt-2"
              >
                Hire Me
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
