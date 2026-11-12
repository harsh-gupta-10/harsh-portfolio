import { useState } from "react";
import { FiMail, FiGithub, FiLinkedin, FiMapPin, FiCopy, FiCheck, FiArrowUpRight, FiDownload } from "react-icons/fi";

export default function Contact() {
  const [copied, setCopied] = useState(false);
  const email = "info@harshugupta.in";

  const handleCopy = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section id="contact" className="py-16 sm:py-24 lg:py-32 bg-[#240029] text-white relative overflow-hidden">
      {/* Subtle atmospheric glow behind email card */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#df37a7]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1000px] mx-auto px-5 sm:px-6 lg:px-8 relative z-10 text-center">
        {/* Eyebrow */}
        <span className="font-mono text-xs font-semibold tracking-[0.12em] text-[#ffbdd3] uppercase mb-3 sm:mb-4 inline-block px-3.5 py-1 rounded-full bg-white/10 border border-white/15">
          // 07 · GET IN TOUCH
        </span>

        {/* Headline */}
        <h2 className="font-display text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1] mb-4 sm:mb-6">
          Let's build something real together.
        </h2>

        {/* Subhead */}
        <p className="text-sm sm:text-lg text-[#d4ccd4] leading-relaxed max-w-2xl mx-auto font-normal mb-8 sm:mb-12">
          Have a project in mind, an embedded system to prototype, or a high-performance web platform to build? Reach out directly — I'm always open to new engineering collaborations and contracts.
        </p>

        {/* Hero Email Box */}
        <div className="max-w-2xl mx-auto bg-white/5 border border-white/15 rounded-2xl sm:rounded-3xl p-5 sm:p-10 backdrop-blur-md shadow-2xl">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#df37a7] flex items-center justify-center mx-auto mb-4 sm:mb-5 shadow-lg shadow-[#df37a7]/30">
            <FiMail size={24} className="text-white" />
          </div>

          <div className="text-[11px] sm:text-xs font-mono uppercase tracking-widest text-[#ffbdd3] mb-2">
            Direct Contact Email
          </div>

          <a
            href={`mailto:${email}`}
            className="font-display font-bold text-xl sm:text-3xl md:text-4xl text-white hover:text-[#ffbdd3] transition-colors break-all inline-block mb-6"
          >
            {email}
          </a>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 w-full max-w-sm sm:max-w-none mx-auto">
            <a
              href={`mailto:${email}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#df37a7] hover:bg-[#b82586] text-white font-semibold text-sm sm:text-base shadow-lg shadow-[#df37a7]/25 transition-all hover:scale-102 cursor-pointer"
            >
              <FiMail size={16} />
              Send an Email
              <FiArrowUpRight size={16} />
            </a>

            <button
              onClick={handleCopy}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-sm sm:text-base transition-all hover:scale-102 cursor-pointer"
            >
              {copied ? (
                <>
                  <FiCheck size={16} className="text-emerald-400" />
                  <span className="text-emerald-300">Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <FiCopy size={16} />
                  <span>Copy Address</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Secondary Info & Socials */}
        <div className="mt-10 sm:mt-12 flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-[#d4ccd4]">
          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/5 border border-white/10 text-center">
            <FiMapPin size={15} className="text-[#ffbdd3] shrink-0" />
            <span>Mumbai, India · Available for Remote Contracts</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
            <a
              href="https://github.com/harsh-gupta-10"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/15 text-white transition-colors"
            >
              <FiGithub size={15} />
              <span>GitHub</span>
            </a>
            <a
              href="https://linkedin.com/in/harsh-gupta-2b41692b1"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/15 text-white transition-colors"
            >
              <FiLinkedin size={15} />
              <span>LinkedIn</span>
            </a>
            <a
              href="/Harsh_Gupta_Resume.pdf"
              download="Harsh_Gupta_Resume.pdf"
              className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/15 text-white transition-colors"
            >
              <FiDownload size={15} />
              <span>Resume</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
