import { useState, useEffect, useCallback } from "react";
import { motion, useTransform } from "framer-motion";
import { FiGithub, FiLinkedin, FiDownload, FiArrowRight } from "react-icons/fi";

const roles = [
  "Front-End Developer",
  "UI/UX Designer",
  "Embedded & IoT Engineer",
  "Electronics & Prototyping",
  "3D Printing Specialist",
];

export const Overlay = ({ isDark, scrollYProgress }) => {

    // Section 1: 0% to 20%
    const opacity1 = useTransform(scrollYProgress, [0, 0.15, 0.25], [1, 1, 0]);
    const y1 = useTransform(scrollYProgress, [0, 0.25], [0, -100]);

    // Section 2: 30% to 50%
    const opacity2 = useTransform(scrollYProgress, [0.2, 0.3, 0.45, 0.55], [0, 1, 1, 0]);
    const y2 = useTransform(scrollYProgress, [0.2, 0.55], [100, -100]);

    // Section 3: 60% to 80%
    const opacity3 = useTransform(scrollYProgress, [0.55, 0.65, 0.8, 0.9], [0, 1, 1, 0]);
    const y3 = useTransform(scrollYProgress, [0.55, 0.9], [100, -100]);

    // Typing effect logic
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
        <div className="absolute inset-0 pointer-events-none z-10 text-white">
            {/* Section 1 */}
            <motion.div
                style={{ opacity: opacity1, y: y1 }}
                className="absolute inset-0 flex items-center justify-center p-5 sm:p-8"
            >
                <div className="text-center max-w-4xl mx-auto flex flex-col items-center">
                    <span
                        className="mb-6 sm:mb-8 inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium bg-white/10 text-emerald-300 border border-white/15 backdrop-blur-md"
                    >
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                        Available for opportunities
                    </span>
                    <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-extrabold tracking-tight mb-4 drop-shadow-[0_0_20px_rgba(0,0,0,0.9)]">
                        Hi, I'm <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-[#ffbdd3]">
                        Harsh Gupta
                        </span>
                    </h1>
                    
                    {/* Typing animation */}
                    <div className="mt-3 sm:mt-4 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 drop-shadow-[0_0_12px_rgba(0,0,0,0.9)]">
                        <span className="text-lg sm:text-xl md:text-2xl font-medium text-slate-300">
                        I'm a{" "}
                        </span>
                        <span className="text-lg sm:text-xl md:text-2xl font-bold text-[#df37a7] min-w-[170px] sm:min-w-[220px] text-left">
                            {text}
                            <span className="typing-cursor text-[#df37a7]">|</span>
                        </span>
                    </div>
                </div>
            </motion.div>

            {/* Section 2 */}
            <motion.div
                style={{ opacity: opacity2, y: y2 }}
                className="absolute inset-0 flex items-center justify-center md:justify-start p-6 sm:p-12 md:p-24"
            >
                <div className="max-w-xl text-center md:text-left">
                    <h2 className="text-2xl sm:text-4xl md:text-6xl font-bold tracking-tight leading-tight drop-shadow-[0_0_20px_rgba(0,0,0,0.9)] text-white">
                        I build <span className="text-[#ffbdd3]">digital interfaces</span>,<br/> embedded systems, <br/>and <span className="text-[#ffcb0f]">physical products</span>.
                    </h2>
                </div>
            </motion.div>

            {/* Section 3 text mapping for the last part */}
            <motion.div
                style={{ opacity: opacity3, y: y3 }}
                className="absolute inset-0 flex flex-col items-center justify-center p-5 sm:p-8 pointer-events-auto"
            >
                <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-center leading-tight drop-shadow-[0_0_15px_rgba(0,0,0,0.8)] mb-8 sm:mb-12">
                     Ready to <span className="text-blue-400">Collaborate?</span>
                </h2>
                {/* CTA Buttons - We make these pointer-events-auto so they can be clicked */}
                <div className="flex flex-col sm:flex-row justify-center items-center gap-3.5 sm:gap-5 w-full max-w-xs sm:max-w-none pointer-events-auto">
                    <a
                        href="/projects"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 sm:px-8 py-3.5 sm:py-4 bg-[#df37a7] hover:bg-[#b82586] text-white font-semibold rounded-xl shadow-lg shadow-[#df37a7]/25 transition-all hover:scale-105 group text-base sm:text-lg cursor-pointer text-center"
                    >
                        Explore All Projects
                        <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </a>
                    
                    <a
                        href="/Harsh_Gupta_Resume.pdf"
                        download="Harsh_Gupta_Resume.pdf"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 font-semibold rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm text-white hover:bg-white/15 transition-all hover:scale-105 text-base sm:text-lg cursor-pointer text-center"
                    >
                        <FiDownload size={20} />
                        Download Resume
                    </a>
                </div>

                {/* Social Links */}
                <div className="mt-8 sm:mt-12 flex items-center justify-center gap-5 sm:gap-6 pointer-events-auto">
                    <a
                        href="https://github.com/harsh-gupta-10"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3.5 sm:p-4 rounded-xl transition-all hover:scale-110 bg-[#1E293B] text-[#94A3B8] hover:text-white hover:bg-[#334155] cursor-pointer"
                        aria-label="GitHub"
                    >
                        <FiGithub size={22} className="sm:w-6 sm:h-6" />
                    </a>
                    <a
                        href="https://linkedin.com/in/harsh-gupta-2b41692b1"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3.5 sm:p-4 rounded-xl transition-all hover:scale-110 bg-[#1E293B] text-[#94A3B8] hover:text-white hover:bg-[#334155] cursor-pointer"
                        aria-label="LinkedIn"
                    >
                        <FiLinkedin size={22} className="sm:w-6 sm:h-6" />
                    </a>
                </div>
            </motion.div>
        </div>
    );
};
