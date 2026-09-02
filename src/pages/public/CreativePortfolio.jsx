import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiArrowLeft,
  FiSun,
  FiMoon,
  FiYoutube,
  FiLayers,
  FiFileText,
  FiVideo,
  FiFeather,
  FiTv,
  FiMaximize2,
  FiX,
  FiCheckCircle,
  FiUsers,
  FiMail,
  FiDownload,
  FiExternalLink,
} from "react-icons/fi";
import {
  SiAdobephotoshop,
  SiAdobepremierepro,
  SiAdobeaftereffects,
  SiFigma,
  SiDavinciresolve,
  SiAffinityphoto,
  SiCanva,
  SiYoutube,
  SiInstagram,
} from "react-icons/si";

import creativeData from "../../data/creativePortfolio.json";
import { useDarkMode } from "../../hooks/useDarkMode";

// Official Brand SVG Icons for KineMaster and CapCut
function KineMasterIcon({ size = 22 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 210 210"
      fill="currentColor"
      className="shrink-0"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M 104.90325,0 A 104.90328,104.90305 0 1 0 209.80656,104.90306 104.85776,104.85753 0 0 0 104.90325,0 Z m 0,11.860785 c 6.82966,-0.478075 12.74869,5.452318 12.74869,12.737251 A 12.748664,12.748636 0 1 1 104.90325,11.815264 Z M 29.219452,93.053668 c -7.28495,0 -13.215357,-5.930393 -12.748664,-12.748636 a 12.748664,12.748636 0 1 1 12.748664,12.748636 z m 28.274717,88.944502 a 13.033232,13.033203 0 0 1 -12.748663,-12.73725 12.748664,12.748636 0 1 1 12.748663,12.73725 z m 74.158521,-34.72865 a 8.5142863,8.5142673 0 0 1 -6.39711,-2.8343 L 95.933667,112.23354 h -3.8246 v 26.43065 a 8.6622619,8.6622426 0 0 1 -17.31314,0 V 68.444249 a 8.6622619,8.6622426 0 0 1 17.31314,0 v 26.430652 h 3.619711 L 121.90906,63.936695 a 8.6736447,8.6736253 0 1 1 13.15845,11.189203 l -23.90374,28.217732 26.79496,29.41292 a 8.6053482,8.605329 0 0 1 -6.39711,14.43329 z m 20.24989,34.72865 c -7.29633,0 -13.22674,-5.91901 -12.74866,-12.73725 a 12.748664,12.748636 0 1 1 12.74866,12.73725 z M 193.33574,79.826958 A 12.748664,12.748636 0 1 1 180.58707,67.089704 12.69175,12.691722 0 0 1 193.2902,79.781428 Z"
      />
    </svg>
  );
}

function CapCutIcon({ size = 22 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 25 24"
      fill="currentColor"
      fillRule="evenodd"
      clipRule="evenodd"
      className="shrink-0"
    >
      <path d="M24.189 6.442V2.671l-4.535 2.383V4.91c.002-1.505-1.078-2.411-2.638-2.411H2.64C.993 2.5 0 3.407 0 4.91V8.72L6.354 12 0 15.316v3.8C0 20.595 1 21.5 2.64 21.5h14.373c1.56 0 2.639-.907 2.639-2.382v-.197l4.536 2.409v-3.828L13.64 12 24.19 6.443zM9.982 13.873l7.797 4.083H2.157l7.825-4.083zm7.741-7.828l-7.742 4.057-7.825-4.057h15.567z" />
    </svg>
  );
}

const softwareIcons = {
  SiAdobephotoshop: SiAdobephotoshop,
  SiAdobepremierepro: SiAdobepremierepro,
  SiAdobeaftereffects: SiAdobeaftereffects,
  SiFigma: SiFigma,
  SiDavinciresolve: SiDavinciresolve,
  SiAffinityphoto: SiAffinityphoto,
  SiCanva: SiCanva,
  KineMaster: KineMasterIcon,
  CapCut: CapCutIcon,
};

const milestoneIcons = {
  FiYoutube: FiYoutube,
  FiLayers: FiLayers,
  FiFileText: FiFileText,
  FiVideo: FiVideo,
  FiFeather: FiFeather,
  FiTv: FiTv,
};

const categoryTabs = [
  { key: "all", label: "All Works" },
  { key: "branding", label: "Brand Identity & Systems" },
  { key: "social", label: "Social Media Campaigns" },
  { key: "uiux", label: "UI/UX & Web Design" },
];

export default function CreativePortfolio() {
  const { isDark, toggle } = useDarkMode();
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedItem, setSelectedItem] = useState(null);
  const { creator, stats, software, storyMilestones, gallery } = creativeData;

  const filteredGallery =
    activeCategory === "all"
      ? gallery
      : gallery.filter((item) => item.category === activeCategory);

  return (
    <div className={isDark ? "dark" : ""}>
      <div
        className={`min-h-screen transition-colors duration-300 ${
          isDark ? "bg-[#0A0F1D] text-[#F1F5F9]" : "bg-[#F8FAFC] text-[#0F172A]"
        }`}
      >
        {/* ── TOP NAVIGATION BAR ─────────────────────────────── */}
        <header
          className={`sticky top-0 z-40 backdrop-blur-xl border-b transition-all ${
            isDark
              ? "bg-[#0A0F1D]/85 border-[#1E293B]"
              : "bg-white/85 border-[#E2E8F0] shadow-xs"
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
            {/* Back Button */}
            <Link
              to="/"
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                isDark
                  ? "bg-[#1E293B] text-slate-300 hover:text-white hover:bg-[#334155]"
                  : "bg-slate-100 text-slate-700 hover:text-slate-950 hover:bg-slate-200"
              }`}
            >
              <FiArrowLeft size={16} />
              <span className="hidden sm:inline">Main Portfolio</span>
              <span className="sm:hidden">Back</span>
            </Link>

            {/* Title / Badge */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-500 border border-blue-500/20">
                <FiLayers size={13} />
                <span>Creative Work</span>
              </span>
              <span
                className={`hidden md:inline text-xs ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Graphic Design & Video Editing
              </span>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              <a
                href="/Harsh_Gupta_Resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className={`hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all ${
                  isDark
                    ? "border-slate-700 text-slate-300 hover:bg-slate-800"
                    : "border-slate-300 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <FiDownload size={14} />
                <span>Resume / CV</span>
              </a>

              <a
                href="mailto:harshgupta24716@gmail.com?subject=Job%20Opportunity%20-%20Graphic%20Designer%20%26%20Video%20Editor"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-all hover:scale-105"
              >
                <FiMail size={15} />
                <span>Hire Me</span>
              </a>

              <button
                onClick={toggle}
                aria-label="Toggle theme"
                className={`p-2.5 rounded-xl border transition-colors ${
                  isDark
                    ? "bg-[#1E293B] border-[#334155] text-amber-400 hover:bg-[#334155]"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                {isDark ? <FiSun size={18} /> : <FiMoon size={18} />}
              </button>
            </div>
          </div>
        </header>

        <main>
          {/* ── 1. HERO SECTION ─────────────────────────────────── */}
          <section className="relative pt-12 pb-16 sm:pt-16 sm:pb-24 overflow-hidden">
            {/* Background Glow */}
            <div
              className={`absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 pointer-events-none ${
                isDark
                  ? "bg-gradient-to-b from-blue-600/10 via-purple-600/5 to-transparent blur-3xl"
                  : "bg-gradient-to-b from-blue-200/50 via-purple-100/40 to-transparent blur-2xl"
              }`}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="text-center max-w-3xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mb-6"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Available for Full-Time Roles & Creative Contracts</span>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight"
                >
                  Graphic Designer, Video Editor &{" "}
                  <span className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent">
                    Multimedia Producer
                  </span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className={`mt-6 text-base sm:text-lg leading-relaxed ${
                    isDark ? "text-slate-300" : "text-slate-600"
                  }`}
                >
                  {creator.bio}
                </motion.p>

                {/* Hero CTAs */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="mt-8 flex flex-wrap items-center justify-center gap-4"
                >
                  <a
                    href="#gallery"
                    className="px-6 py-3.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 hover:scale-105 transition-all"
                  >
                    View Work Showcase
                  </a>
                  <a
                    href="/Harsh_Gupta_Resume.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm border transition-all ${
                      isDark
                        ? "border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                        : "border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <FiDownload size={15} />
                    <span>Download Resume</span>
                  </a>
                  <a
                    href="mailto:harshgupta24716@gmail.com?subject=Job%20Opportunity%20-%20Graphic%20Designer%20%26%20Video%20Editor"
                    className={`inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm border transition-all ${
                      isDark
                        ? "border-blue-500/30 text-blue-400 bg-blue-500/10 hover:bg-blue-500/20"
                        : "border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100"
                    }`}
                  >
                    <FiMail size={15} />
                    <span>Get In Touch</span>
                  </a>
                </motion.div>
              </div>

              {/* Stats Bar */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mt-14 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
              >
                {stats.map((stat, i) => (
                  <div
                    key={i}
                    className={`p-5 sm:p-6 rounded-2xl border transition-all hover:scale-[1.02] ${
                      isDark
                        ? "bg-[#11192E] border-[#1E293B] shadow-lg shadow-black/20"
                        : "bg-white border-slate-200 shadow-sm"
                    }`}
                  >
                    <div className="text-2xl sm:text-4xl font-extrabold bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
                      {stat.value}
                    </div>
                    <div className="mt-1 font-semibold text-sm sm:text-base">
                      {stat.label}
                    </div>
                    <div
                      className={`text-xs mt-0.5 ${
                        isDark ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      {stat.sub}
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>
          </section>

          {/* ── 2. CURATED DESIGN & VIDEO WORKS (DIRECTLY BELOW HERO) ── */}
          <section id="gallery" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="text-blue-500 font-semibold text-xs uppercase tracking-wider">
                Portfolio Showcase
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold mt-2">
                Curated Design & Video Works
              </h2>
              <p
                className={`mt-3 text-sm sm:text-base ${
                  isDark ? "text-slate-400" : "text-slate-600"
                }`}
              >
                Explore real brand identity design systems, high-engagement social media
                campaigns, and responsive UI/UX platforms with working live links.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
              {categoryTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveCategory(tab.key)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                    activeCategory === tab.key
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-105"
                      : isDark
                      ? "bg-[#11192E] text-slate-300 hover:text-white border border-[#1E293B]"
                      : "bg-white text-slate-700 hover:text-slate-900 border border-slate-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Media Grid - Improved Container View with Working Links */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredGallery.map((item, index) => {
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    onClick={() => setSelectedItem(item)}
                    className={`group cursor-pointer rounded-3xl border overflow-hidden transition-all duration-300 hover:scale-[1.02] flex flex-col ${
                      isDark
                        ? "bg-[#11192E] border-[#1E293B] hover:border-blue-500/40 hover:shadow-2xl hover:shadow-blue-500/10"
                        : "bg-white border-slate-200 hover:border-blue-500/40 hover:shadow-xl hover:shadow-blue-500/10"
                    }`}
                  >
                    {/* Consistent Uniform Media Stage */}
                    <div
                      className={`relative w-full h-64 sm:h-72 p-3 sm:p-4 flex items-center justify-center overflow-hidden transition-colors ${
                        isDark
                          ? "bg-gradient-to-b from-[#0F172A] to-[#090D1A]"
                          : "bg-gradient-to-b from-slate-100 to-slate-200/70"
                      }`}
                    >
                      <img
                        src={item.image}
                        alt={item.title}
                        loading="lazy"
                        className="w-full h-full object-contain rounded-xl drop-shadow-lg transition-transform duration-500 group-hover:scale-105"
                      />

                      {/* Overlay On Hover with Dual Action Buttons */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col sm:flex-row items-center justify-center gap-2.5 p-4 text-white backdrop-blur-[2px]">
                        <button
                          type="button"
                          onClick={() => setSelectedItem(item)}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white text-xs font-semibold shadow-lg backdrop-blur-md transition-all border border-white/10 hover:scale-105"
                        >
                          <FiMaximize2 size={13} />
                          <span>Inspect</span>
                        </button>
                        {item.projectUrl && (
                          <a
                            href={item.projectUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg transition-all hover:scale-105"
                          >
                            {item.linkLabel?.includes("Figma") ? (
                              <SiFigma size={13} />
                            ) : (
                              <SiInstagram size={13} />
                            )}
                            <span>{item.linkLabel}</span>
                            <FiExternalLink size={13} />
                          </a>
                        )}
                      </div>

                      {/* Category Badge */}
                      <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/75 backdrop-blur-md text-white shadow-sm border border-white/10">
                        {item.categoryLabel}
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-base sm:text-lg leading-snug group-hover:text-blue-500 transition-colors">
                          {item.title}
                        </h3>
                        <p
                          className={`mt-2.5 text-xs sm:text-sm line-clamp-2 leading-relaxed ${
                            isDark ? "text-slate-300" : "text-slate-600"
                          }`}
                        >
                          {item.description}
                        </p>
                      </div>

                      {/* Tools & Working Action Button */}
                      <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800/90 flex items-center justify-between gap-2">
                        <div className="flex flex-wrap gap-1.5">
                          {item.tools.slice(0, 2).map((tool) => (
                            <span
                              key={tool}
                              className={`text-[11px] px-2.5 py-0.5 rounded-md font-medium ${
                                isDark
                                  ? "bg-slate-800 text-slate-300"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {tool}
                            </span>
                          ))}
                          {item.tools.length > 2 && (
                            <span
                              className={`text-[11px] px-1.5 py-0.5 rounded-md font-medium ${
                                isDark ? "text-slate-400" : "text-slate-500"
                              }`}
                            >
                              +{item.tools.length - 2}
                            </span>
                          )}
                        </div>

                        {/* Working Link Button */}
                        {item.projectUrl ? (
                          <a
                            href={item.projectUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md transition-all hover:scale-105 shrink-0"
                            title={`Open ${item.linkLabel}`}
                          >
                            {item.linkLabel?.includes("Figma") ? (
                              <SiFigma size={12} />
                            ) : (
                              <SiInstagram size={12} />
                            )}
                            <span>{item.linkLabel}</span>
                            <FiExternalLink size={12} />
                          </a>
                        ) : (
                          <span className="text-xs font-bold text-blue-500 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                            <span>Details</span>
                            <FiExternalLink size={12} />
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>

          {/* ── 3. SOFTWARE & TOOL MASTERY (BELOW CURATED WORKS) ── */}
          <section id="skills" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="text-blue-500 font-semibold text-xs uppercase tracking-wider">
                Creative Arsenal
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold mt-2">
                Software & Tool Mastery
              </h2>
              <p
                className={`mt-2 text-sm sm:text-base ${
                  isDark ? "text-slate-400" : "text-slate-600"
                }`}
              >
                Production-proven workflows across design, timeline pacing, and motion graphics.
              </p>
            </div>

            {/* Compact Grid: 2 columns on mobile, 3x3 on PC fitting in single viewport */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 max-w-6xl mx-auto">
              {software.map((s, index) => {
                const IconComponent = softwareIcons[s.icon] || SiFigma;
                return (
                  <motion.div
                    key={s.name}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: index * 0.04 }}
                    className={`p-3.5 sm:p-4 rounded-2xl border transition-all hover:scale-[1.02] flex flex-col justify-between h-[96px] sm:h-[102px] ${
                      isDark
                        ? "bg-[#11192E] border-[#1E293B] hover:border-slate-700"
                        : "bg-white border-slate-200 hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Icon */}
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md"
                        style={{
                          backgroundColor: s.color,
                          boxShadow: `0 4px 14px ${s.color}35`,
                        }}
                      >
                        <IconComponent size={22} />
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <h3 className="text-xs sm:text-sm font-bold truncate leading-tight">
                            {s.name}
                          </h3>
                          <span
                            className="text-[11px] font-extrabold font-mono px-2 py-0.5 rounded-full shrink-0"
                            style={{
                              color: s.color,
                              backgroundColor: `${s.color}15`,
                            }}
                          >
                            {s.proficiency}%
                          </span>
                        </div>
                        <p
                          className={`text-[10px] sm:text-[11px] truncate mt-0.5 ${
                            isDark ? "text-slate-400" : "text-slate-500"
                          }`}
                        >
                          {s.category}
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{
                          width: `${s.proficiency}%`,
                          backgroundColor: s.color,
                        }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>

          {/* ── 4. THE STORY & JOURNEY CHAPTERS ─────────────────── */}
          <section id="story" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-blue-500 font-semibold text-xs uppercase tracking-wider">
                The Narrative
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold mt-2">
                From Viral Tutorials to Agency Design
              </h2>
              <p
                className={`mt-3 text-sm sm:text-base ${
                  isDark ? "text-slate-400" : "text-slate-600"
                }`}
              >
                Every milestone helped shape the multifaceted visual creator and
                director I am today.
              </p>
            </div>

            <div className="relative border-l-2 border-blue-500/20 dark:border-blue-500/10 ml-4 sm:ml-8 md:ml-12 pl-6 sm:pl-10 space-y-12">
              {storyMilestones.map((m, index) => {
                const Icon = milestoneIcons[m.icon] || FiLayers;
                return (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.5, delay: index * 0.08 }}
                    className="relative group"
                  >
                    {/* Node Dot */}
                    <div
                      className={`absolute -left-[37px] sm:-left-[53px] top-1.5 w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md bg-gradient-to-br ${m.accentColor}`}
                    >
                      {index + 1}
                    </div>

                    <div
                      className={`p-6 sm:p-8 rounded-2xl border transition-all ${
                        isDark
                          ? "bg-[#11192E] border-[#1E293B] hover:border-blue-500/30"
                          : "bg-white border-slate-200 hover:border-blue-500/30 shadow-xs"
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <span
                          className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                            isDark
                              ? "bg-slate-800 text-blue-400 border border-slate-700"
                              : "bg-blue-50 text-blue-600 border border-blue-100"
                          }`}
                        >
                          {m.tag} • {m.period}
                        </span>
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-blue-500/10 text-blue-500">
                          {m.badge}
                        </span>
                      </div>

                      <h3 className="text-xl sm:text-2xl font-bold mb-3 flex items-center gap-2">
                        <Icon className="text-blue-500 shrink-0" size={20} />
                        {m.title}
                      </h3>

                      <p
                        className={`text-sm sm:text-base leading-relaxed ${
                          isDark ? "text-slate-300" : "text-slate-600"
                        }`}
                      >
                        {m.story}
                      </p>

                      {/* Highlights */}
                      <div className="mt-5 pt-5 border-t border-slate-200 dark:border-slate-800 grid sm:grid-cols-2 gap-2.5">
                        {m.highlights.map((hl, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-2 text-xs sm:text-sm font-medium"
                          >
                            <FiCheckCircle
                              size={15}
                              className="text-emerald-500 shrink-0 mt-0.5"
                            />
                            <span className={isDark ? "text-slate-300" : "text-slate-700"}>
                              {hl}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>

          {/* ── 5. NETWORK & CONNECTIONS (MOVED LAST BEFORE HIRE ME) ── */}
          <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div
              className={`rounded-3xl p-6 sm:p-8 border relative overflow-hidden ${
                isDark
                  ? "bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-blue-950/40 border-indigo-500/20"
                  : "bg-gradient-to-r from-indigo-50 via-purple-50 to-blue-50 border-indigo-100"
              }`}
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-500/20">
                    <FiUsers size={26} />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-500">
                      Network & Connections
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold mt-0.5">
                      Collaborations Across 100K, 200K & 1M+ Creators
                    </h3>
                    <p
                      className={`text-sm mt-1 max-w-2xl ${
                        isDark ? "text-slate-300" : "text-slate-600"
                      }`}
                    >
                      Growing IzooG10 into an 8K-subscriber community unlocked direct
                      connections with top creators in the gaming and tech sphere.
                      These relationships gave me an insider understanding of YouTube
                      algorithm dynamics, click-through rates (CTR), thumbnail packaging,
                      and retention engineering.
                    </p>
                  </div>
                </div>

                <a
                  href="mailto:harshgupta24716@gmail.com?subject=Creative%20Collaboration%20Inquiry"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-all shrink-0 hover:shadow-lg hover:shadow-blue-600/30"
                >
                  <FiMail size={16} />
                  <span>Get In Touch</span>
                </a>
              </div>
            </div>
          </section>

          {/* ── 6. HIRE ME & CAREER OPPORTUNITIES SECTION ──────────── */}
          <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div
              className={`rounded-3xl p-8 sm:p-12 border relative overflow-hidden shadow-2xl ${
                isDark
                  ? "bg-gradient-to-br from-[#11192E] via-[#0F172A] to-[#1E1B4B] border-blue-500/20"
                  : "bg-gradient-to-br from-white via-blue-50/50 to-indigo-50/50 border-blue-200"
              }`}
            >
              {/* Ambient Glow */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mb-4">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Actively Seeking Job Opportunities</span>
                </div>

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                  Looking for a Versatile{" "}
                  <span className="bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
                    Graphic Designer & Video Editor
                  </span>?
                </h2>

                <p
                  className={`mt-4 text-base sm:text-lg leading-relaxed ${
                    isDark ? "text-slate-300" : "text-slate-600"
                  }`}
                >
                  I bring a rare blend of creative storytelling, technical precision, and proven leadership. Whether you need end-to-end video post-production (Premiere Pro, DaVinci Resolve, KineMaster), compelling brand identities and marketing collateral (Photoshop, Figma, Canva), or a creative lead who can direct live multi-cam productions and manage design teams—I am ready to deliver impact from day one.
                </p>

                {/* Job Fit Bullet Highlights */}
                <div className="mt-8 grid sm:grid-cols-2 gap-4">
                  {[
                    { title: "End-to-End Video Production", desc: "Pacing, multi-cam editing, color grading & audio mastering." },
                    { title: "High-CTR Graphic Design", desc: "Thumbnails, posters, branding systems & social media sets." },
                    { title: "Proven Team Leadership", desc: "Led college IT design teams & directed live event broadcasts." },
                    { title: "Rapid Turnaround & Reliability", desc: "Disciplined workflow, attention to detail, and deadline focused." },
                  ].map((fit, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border ${
                        isDark
                          ? "bg-slate-900/60 border-slate-800"
                          : "bg-white border-slate-200 shadow-xs"
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold text-sm text-blue-500">
                        <FiCheckCircle size={16} />
                        <span>{fit.title}</span>
                      </div>
                      <p className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                        {fit.desc}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Action CTAs */}
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <a
                    href="mailto:harshgupta24716@gmail.com?subject=Job%20Opportunity%20-%20Graphic%20Designer%20%26%20Video%20Editor"
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 hover:scale-105 transition-all"
                  >
                    <FiMail size={17} />
                    <span>Get In Touch / Hire Me</span>
                  </a>

                  <a
                    href="/Harsh_Gupta_Resume.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm border transition-all ${
                      isDark
                        ? "border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700"
                        : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <FiDownload size={16} />
                    <span>Download Resume / CV</span>
                  </a>

                  <Link
                    to="/"
                    className={`inline-flex items-center gap-2 px-5 py-3.5 rounded-xl font-semibold text-sm transition-colors ${
                      isDark ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <FiArrowLeft size={16} />
                    <span>Engineering Portfolio</span>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* ── LIGHTBOX MODAL ─────────────────────────────────── */}
        <AnimatePresence>
          {selectedItem && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
              onClick={() => setSelectedItem(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ duration: 0.2 }}
                onClick={(e) => e.stopPropagation()}
                className={`relative w-full max-w-4xl rounded-3xl border overflow-hidden shadow-2xl max-h-[92vh] flex flex-col ${
                  isDark ? "bg-[#11192E] border-slate-800" : "bg-white border-slate-200"
                }`}
              >
                {/* Close Button */}
                <button
                  onClick={() => setSelectedItem(null)}
                  aria-label="Close modal"
                  className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/60 hover:bg-black text-white transition-colors"
                >
                  <FiX size={18} />
                </button>

                {/* Media Preview Stage */}
                <div
                  className={`relative w-full flex items-center justify-center overflow-hidden p-4 sm:p-6 max-h-[60vh] ${
                    isDark ? "bg-black/60" : "bg-slate-100"
                  }`}
                >
                  <img
                    src={selectedItem.image}
                    alt={selectedItem.title}
                    className="w-full h-full max-h-[55vh] object-contain rounded-xl shadow-2xl"
                  />
                </div>

                {/* Modal Description & Action Links */}
                <div className="p-6 sm:p-8 overflow-y-auto">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-blue-500/10 text-blue-500">
                      {selectedItem.categoryLabel}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold">
                    {selectedItem.title}
                  </h3>

                  <p
                    className={`mt-3 text-sm sm:text-base leading-relaxed ${
                      isDark ? "text-slate-300" : "text-slate-600"
                    }`}
                  >
                    {selectedItem.description}
                  </p>

                  <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                    <span
                      className={`text-xs font-semibold uppercase tracking-wider block mb-2 ${
                        isDark ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      Tools & Technologies
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {selectedItem.tools.map((t) => (
                        <span
                          key={t}
                          className={`text-xs font-semibold px-3 py-1 rounded-lg ${
                            isDark
                              ? "bg-slate-800 text-blue-400"
                              : "bg-blue-50 text-blue-700"
                          }`}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Modal Working Link Button */}
                  {selectedItem.projectUrl && (
                    <div className="mt-6 pt-2">
                      <a
                        href={selectedItem.projectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.01]"
                      >
                        {selectedItem.linkLabel?.includes("Figma") ? (
                          <SiFigma size={18} />
                        ) : (
                          <SiInstagram size={18} />
                        )}
                        <span>{selectedItem.linkLabel}</span>
                        <FiExternalLink size={16} />
                      </a>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ── FOOTER ─────────────────────────────────────────── */}
        <footer
          className={`py-8 border-t text-center text-xs transition-colors ${
            isDark
              ? "bg-[#070B14] border-[#1E293B] text-slate-500"
              : "bg-white border-slate-200 text-slate-400"
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>© {new Date().getFullYear()} Harsh Gupta • Graphic Designer & Video Editor</p>
            <div className="flex items-center gap-4">
              <Link to="/" className="hover:text-blue-500 transition-colors">
                Main Portfolio
              </Link>
              <a
                href={creator.channelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-red-500 transition-colors inline-flex items-center gap-1"
              >
                <SiYoutube />
                <span>@IzooG10</span>
              </a>
              <a
                href="mailto:harshgupta24716@gmail.com"
                className="hover:text-blue-500 transition-colors"
              >
                Contact
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
