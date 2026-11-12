import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiMenu, FiX, FiArrowRight } from "react-icons/fi";
import { useNavigate, useLocation, Link } from "react-router-dom";

const navLinks = [
  { name: "About", href: "/#about" },
  { name: "Skills", href: "/#skills" },
  { name: "Projects", href: "/projects" },
  { name: "Experience", href: "/#experience" },
  { name: "Certificates", href: "/#certificates" },
  { name: "Contact", href: "/#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === "/";
  // On home, top of page is dark hero canvas. Scrolled or other pages are light.
  const isDarkHeroState = isHome && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleClick = (e, href) => {
    e.preventDefault();
    setMobileOpen(false);

    if (href.startsWith("/#")) {
      const hash = href.slice(1);
      if (location.pathname === "/") {
        const el = document.querySelector(hash);
        if (el) {
          const offset = 76;
          const top = el.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top, behavior: "smooth" });
        }
      } else {
        navigate("/" + hash);
      }
      return;
    }

    if (href.startsWith("/")) {
      navigate(href);
      window.scrollTo({ top: 0, behavior: "smooth" });
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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
        isDarkHeroState
          ? "bg-black/40 backdrop-blur-md border-white/10 text-white"
          : "bg-white/95 backdrop-blur-md border-[#d4ccd4] shadow-[0_1px_3px_rgba(36,0,41,0.04)] text-[#240029]"
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-18">
          {/* Brand Mark & Name */}
          <Link
            to="/"
            onClick={() => {
              setMobileOpen(false);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex items-center gap-3 group"
          >
            {/* Outseta concentric circle mark */}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs transition-transform group-hover:scale-105 shadow-sm ${
                isDarkHeroState ? "bg-white text-[#240029]" : "bg-[#240029] text-white"
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  isDarkHeroState ? "border-[#240029]/60" : "border-white/60"
                }`}
              >
                <span className="w-1.5 h-1.5 bg-[#df37a7] rounded-full" />
              </span>
            </div>
            <div className="flex flex-col">
              <span
                className={`font-display font-extrabold text-base tracking-tight leading-tight ${
                  isDarkHeroState ? "text-white" : "text-[#240029]"
                }`}
              >
                Harsh Gupta
              </span>
              <span
                className={`font-mono text-[10px] tracking-wider uppercase hidden sm:block ${
                  isDarkHeroState ? "text-[#ffbdd3]" : "text-[#6d526d]"
                }`}
              >
                Screen · Solder · Code
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(({ name, href }) => {
              const isCurrent = href === "/projects" && location.pathname === "/projects";

              return (
                <a
                  key={name}
                  href={href}
                  onClick={(e) => handleClick(e, href)}
                  className={`text-sm font-medium transition-colors ${
                    isCurrent
                      ? "text-[#df37a7] font-semibold"
                      : isDarkHeroState
                      ? "text-white/85 hover:text-[#df37a7]"
                      : "text-[#240029] hover:text-[#df37a7]"
                  }`}
                >
                  {name}
                </a>
              );
            })}
          </div>

          {/* Primary Action Button */}
          <div className="flex items-center gap-3">
            <a
              href="/#contact"
              onClick={(e) => handleClick(e, "/#contact")}
              className="btn-primary-fuchsia hidden sm:inline-flex items-center gap-2 px-5 py-2.5 text-sm"
            >
              Let's Talk
              <FiArrowRight size={14} />
            </a>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={`md:hidden p-2.5 min-w-[42px] min-h-[42px] flex items-center justify-center rounded-lg border transition-colors ${
                isDarkHeroState
                  ? "text-white border-white/20 hover:bg-white/10"
                  : "text-[#240029] border-[#d4ccd4] hover:bg-[#240029]/5"
              }`}
              aria-label="Toggle navigation"
            >
              {mobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
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
            className={`md:hidden border-b px-5 py-4 space-y-1.5 shadow-xl transition-colors ${
              isDarkHeroState
                ? "bg-[#180a1c] text-white border-white/10"
                : "bg-white text-[#240029] border-[#d4ccd4]"
            }`}
          >
            {navLinks.map(({ name, href }) => {
              const isCurrent = href === "/projects" && location.pathname === "/projects";
              return (
                <a
                  key={name}
                  href={href}
                  onClick={(e) => handleClick(e, href)}
                  className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                    isCurrent
                      ? "bg-[#df37a7]/10 text-[#df37a7] font-semibold"
                      : isDarkHeroState
                      ? "text-white/90 hover:bg-white/10"
                      : "text-[#240029] hover:bg-[#240029]/5"
                  }`}
                >
                  {name}
                </a>
              );
            })}
            <div className="pt-2">
              <a
                href="/#contact"
                onClick={(e) => handleClick(e, "/#contact")}
                className="btn-primary-fuchsia flex items-center justify-center gap-2 w-full py-3.5 text-base font-semibold rounded-lg"
              >
                Let's Talk
                <FiArrowRight size={16} />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
