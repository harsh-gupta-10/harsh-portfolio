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
                className="absolute inset-0 flex items-center justify-center p-8"
            >
                <div className="text-center max-w-4xl mx-auto flex flex-col items-center">
                    <span
                        className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-[#1E293B] text-[#60A5FA] border border-[#334155]"
                    >
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        Available for opportunities
                    </span>
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold tracking-tight mb-4 drop-shadow-[0_0_15px_rgba(0,0,0,0.8)]">
                        Hi, I'm <br/><span className="bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6] bg-clip-text text-transparent">
                        Harsh Gupta
                        </span>
                    </h1>
                    
                    {/* Typing animation */}
                    <div className="mt-4 flex items-center justify-center gap-2 drop-shadow-[0_0_10px_rgba(0,0,0,0.8)]">
                        <span className="text-xl md:text-2xl font-medium text-[#CBD5E1]">
                        I'm a{" "}
                        </span>
                        <span className="text-xl md:text-2xl font-semibold text-[#3B82F6] min-w-[200px] text-left">
                            {text}
                            <span className="typing-cursor text-[#1E3A8A]">|</span>
                        </span>
                    </div>
                </div>
            </motion.div>

            {/* Section 2 */}
            <motion.div
                style={{ opacity: opacity2, y: y2 }}
                className="absolute inset-0 flex items-center justify-center md:justify-start p-8 md:p-24"
            >
                <div className="max-w-xl text-center md:text-left">
                    <h2 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight drop-shadow-[0_0_15px_rgba(0,0,0,0.8)]">
                        I build <span className="text-blue-400">digital interfaces</span>,<br/> embedded systems, <br/>and <span className="text-blue-400">physical products</span>.
                    </h2>
                </div>
            </motion.div>

            {/* Section 3 text mapping for the last part */}
            <motion.div
                style={{ opacity: opacity3, y: y3 }}
                className="absolute inset-0 flex flex-col items-center justify-center p-8 pointer-events-auto"
            >
                <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-center leading-tight drop-shadow-[0_0_15px_rgba(0,0,0,0.8)] mb-12">
                     Ready to <span className="text-blue-400">Collaborate?</span>
                </h2>
                {/* CTA Buttons - We make these pointer-events-auto so they can be clicked */}
                <div className="flex flex-wrap justify-center items-center gap-6 pointer-events-auto">
                    <a
                        href="#projects"
                        onClick={(e) => handleScroll(e, "#projects")}
                        className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6] text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-blue-500/25 transition-all hover:scale-105 group text-lg"
                    >
                        View Projects
                        <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </a>
                    
                    <a
                        href="https://drive.google.com/drive/folders/1QsjDgQIb9rnn2SBt4W5WgHpdeZpqym1C?usp=sharing"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-8 py-4 font-semibold rounded-xl border-2 border-[#334155] text-white hover:bg-[#1E293B] transition-all hover:scale-105 text-lg cursor-pointer"
                    >
                        <FiDownload size={20} />
                        Download Resume
                    </a>
                </div>

                {/* Social Links */}
                <div className="mt-12 flex items-center justify-center gap-6 pointer-events-auto">
                    <a
                        href="https://github.com/harsh-gupta-10"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-4 rounded-xl transition-all hover:scale-110 bg-[#1E293B] text-[#94A3B8] hover:text-white hover:bg-[#334155] cursor-pointer"
                        aria-label="GitHub"
                    >
                        <FiGithub size={26} />
                    </a>
                    <a
                        href="https://linkedin.com/in/harsh-gupta-2b41692b1"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-4 rounded-xl transition-all hover:scale-110 bg-[#1E293B] text-[#94A3B8] hover:text-white hover:bg-[#334155] cursor-pointer"
                        aria-label="LinkedIn"
                    >
                        <FiLinkedin size={26} />
                    </a>
                </div>
            </motion.div>
        </div>
    );
};
