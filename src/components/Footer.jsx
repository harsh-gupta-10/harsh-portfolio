import { FiGithub, FiLinkedin, FiMail, FiHeart } from "react-icons/fi";

const footerLinks = [
  { name: "Home", href: "#home" },
  { name: "About", href: "#about" },
  { name: "Skills", href: "#skills" },
  { name: "Projects", href: "#projects" },
  { name: "Experience", href: "#experience" },
  { name: "Certificates", href: "#certificates" },
  { name: "Contact", href: "#contact" },
];

export default function Footer({ isDark }) {
  const handleClick = (e, href) => {
    e.preventDefault();
    const el = document.querySelector(href);
    if (el) {
      const offset = 80;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <footer
      className={`py-12 border-t ${isDark ? "bg-[#0F172A] border-[#1E293B]" : "bg-white border-[#E2E8F0]"}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Logo & tagline */}
          <div className="text-center md:text-left">
            <a
              href="#home"
              onClick={(e) => handleClick(e, "#home")}
              className="flex items-center gap-2 justify-center md:justify-start group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1E3A8A] to-[#3B82F6] flex items-center justify-center text-white font-display font-bold text-sm">
                H
              </div>
              <span
                className={`font-display font-semibold ${isDark ? "text-white" : "text-[#1E293B]"}`}
              >
                Harsh Gupta
              </span>
            </a>
            <p
              className={`mt-2 text-sm ${isDark ? "text-[#64748B]" : "text-[#94A3B8]"}`}
            >
              Front-End Developer &middot; UI/UX Designer &middot; Embedded &
              IoT Engineer
            </p>
          </div>

          {/* Nav Links */}
          <nav aria-label="Footer navigation" className="flex flex-wrap items-center justify-center gap-6">
            {footerLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleClick(e, link.href)}
                className={`text-sm transition-colors ${
                  isDark
                    ? "text-[#64748B] hover:text-white"
                    : "text-[#94A3B8] hover:text-[#1E293B]"
                }`}
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Social Links */}
          <div className="flex items-center gap-3">
            {[
              {
                icon: FiGithub,
                href: "https://github.com/harsh-gupta-10",
                label: "GitHub",
              },
              {
                icon: FiLinkedin,
                href: "https://linkedin.com/in/harsh-gupta-2b41692b1",
                label: "LinkedIn",
              },
              {
                icon: FiMail,
                href: "mailto:harshgupta24716@gmail.com",
                label: "Email",
              },
            ].map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className={`p-2.5 rounded-xl transition-all hover:scale-110 ${
                  isDark
                    ? "bg-[#1E293B] text-[#64748B] hover:text-white hover:bg-[#334155]"
                    : "bg-[#F1F5F9] text-[#94A3B8] hover:text-[#1E293B] hover:bg-[#E2E8F0]"
                }`}
              >
                <social.icon size={18} />
              </a>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div
          className={`mt-10 pt-6 border-t text-center text-sm ${
            isDark
              ? "border-[#1E293B] text-[#475569]"
              : "border-[#F1F5F9] text-[#94A3B8]"
          }`}
        >
          <p className="flex items-center justify-center gap-1">
            &copy; {new Date().getFullYear()} Harsh Gupta. Built with
            <FiHeart size={14} className="text-red-500" />
            using React & Tailwind CSS.
          </p>
        </div>
      </div>
    </footer>
  );
}
