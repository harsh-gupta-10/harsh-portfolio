import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiMenu, FiX, FiArrowRight } from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";

const navLinks = [
  { name: "About", href: "#about" },
  { name: "Skills", href: "#skills" },
  { name: "Projects", href: "#projects" },
  { name: "Experience", href: "#experience" },
  { name: "Certificates", href: "#certificates" },
  { name: "All Works", href: "/projects" },
  { name: "Creative", href: "/portfolio" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 15);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleClick = (e, href) => {
    e.preventDefault();
    setMobileOpen(false);

    if (href.startsWith("/")) {
      navigate(href);
      return;
    }

    if (href.startsWith("#")) {
      if (location.pathname !== "/") {
        navigate("/" + href);
        return;
      }
      const el = document.querySelector(href);
      if (el) {
        const offset = 76;
        const top = el.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: "smooth" });
      }
    }
  };

  return (
    <nav
      aria-label="Main navigation"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 border-b ${
        scrolled
          ? "bg-white/95 backdrop-blur-md border-[#d4ccd4] shadow-[0_1px_3px_rgba(36,0,41,0.04)]"
          : "bg-white/80 backdrop-blur-sm border-transparent"
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-18">
          {/* Brand Mark & Name */}
          <a
            href="#home"
            onClick={(e) => handleClick(e, "#home")}
            className="flex items-center gap-3 group"
          >
            {/* Outseta concentric circle mark */}
            <div className="w-8 h-8 rounded-full bg-[#240029] flex items-center justify-center text-white font-semibold text-xs transition-transform group-hover:scale-105 shadow-sm">
              <span className="w-4 h-4 rounded-full border border-white/60 flex items-center justify-center">
                <span className="w-1.5 h-1.5 bg-[#df37a7] rounded-full" />
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-display font-extrabold text-base tracking-tight text-[#240029] leading-tight">
                Harsh Gupta
              </span>
              <span className="font-mono text-[10px] tracking-wider text-[#6d526d] uppercase hidden sm:block">
                Screen · Solder · Code
              </span>
            </div>
          </a>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(({ name, href }) => (
              <a
                key={name}
                href={href}
                onClick={(e) => handleClick(e, href)}
                className="text-sm font-medium text-[#240029] hover:text-[#df37a7] transition-colors"
              >
                {name}
              </a>
            ))}
          </div>

          {/* Primary Action Button */}
          <div className="flex items-center gap-3">
            <a
              href="#contact"
              onClick={(e) => handleClick(e, "#contact")}
              className="btn-primary-fuchsia hidden sm:inline-flex items-center gap-2 px-5 py-2.5 text-sm"
            >
              Let's Talk
              <FiArrowRight size={14} />
            </a>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-md text-[#240029] hover:bg-[#240029]/5 border border-[#d4ccd4] transition-colors"
              aria-label="Toggle navigation"
            >
              {mobileOpen ? <FiX size={18} /> : <FiMenu size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-[#d4ccd4] px-4 py-4 space-y-2 shadow-lg"
          >
            {navLinks.map(({ name, href }) => (
              <a
                key={name}
                href={href}
                onClick={(e) => handleClick(e, href)}
                className="block px-3 py-2 text-sm font-medium text-[#240029] hover:bg-[#240029]/5 rounded-md"
              >
                {name}
              </a>
            ))}
            <div className="pt-2">
              <a
                href="#contact"
                onClick={(e) => handleClick(e, "#contact")}
                className="btn-primary-fuchsia flex items-center justify-center gap-2 w-full py-2.5 text-sm"
              >
                Let's Talk
                <FiArrowRight size={14} />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
