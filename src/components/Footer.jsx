import { FiGithub, FiLinkedin, FiMail } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const footerLinks = [
  { name: "About", href: "/#about" },
  { name: "Skills", href: "/#skills" },
  { name: "Featured Projects", href: "/#projects" },
  { name: "All Works", href: "/projects" },
  { name: "3D Lab", href: "/snapmaker" },
  { name: "Contact", href: "/#contact" },
];

export default function Footer() {
  const navigate = useNavigate();

  const handleClick = (e, href) => {
    e.preventDefault();

    if (href === "#home") {
      if (window.location.pathname !== "/") {
        navigate("/");
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (href.startsWith("/")) {
      navigate(href);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (href.startsWith("#")) {
      if (window.location.pathname !== "/") {
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
    <footer className="py-10 sm:py-14 bg-[#1b001f] text-[#d4ccd4] border-t border-white/10">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
          {/* Logo & Tagline */}
          <div className="text-center md:text-left">
            <a
              href="#home"
              onClick={(e) => handleClick(e, "#home")}
              className="inline-flex items-center gap-2.5 group"
            >
              <div className="w-7 h-7 rounded-full bg-[#df37a7] flex items-center justify-center text-white font-bold text-xs">
                H
              </div>
              <span className="font-display font-extrabold text-white text-base">
                Harsh Gupta
              </span>
            </a>
            <p className="mt-1.5 text-xs text-[#d4ccd4]/70 font-mono tracking-wide">
              Engineering software & hardware products · Mumbai, India
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 sm:gap-6 text-xs font-medium text-[#d4ccd4]">
            {footerLinks.map(({ name, href }) => (
              <a
                key={name}
                href={href}
                onClick={(e) => handleClick(e, href)}
                className="hover:text-white transition-colors py-1"
              >
                {name}
              </a>
            ))}
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/harsh-gupta-10"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white transition-colors"
              aria-label="GitHub"
            >
              <FiGithub size={15} />
            </a>
            <a
              href="https://linkedin.com/in/harsh-gupta-2b41692b1"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white transition-colors"
              aria-label="LinkedIn"
            >
              <FiLinkedin size={15} />
            </a>
            <a
              href="mailto:info@harshugupta.in"
              className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white transition-colors"
              aria-label="Email"
            >
              <FiMail size={15} />
            </a>
          </div>
        </div>

        {/* Bottom row */}
        <div className="mt-8 sm:mt-10 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-center sm:text-left text-[11px] font-mono text-[#d4ccd4]/50">
          <div>
            &copy; {new Date().getFullYear()} Harsh Gupta. All rights reserved.
          </div>
          <div>
            Built with React, Cloudflare Workers & D1 · Designed with Outseta Language
          </div>
        </div>
      </div>
    </footer>
  );
}
