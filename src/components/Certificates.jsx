import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiChevronLeft, FiChevronRight, FiExternalLink, FiCheckCircle } from "react-icons/fi";
import Hammer from "hammerjs";
import initialCertificatesData from "../data/certificates.json";
import { usePortfolioData } from "../lib/localAdmin";

function ScrollingRow({ certificates, direction, isDark, onSelect }) {
  const containerRef = useRef(null);
  const wrapperRef = useRef(null);
  const [animX, setAnimX] = useState(0);
  const speedRef = useRef(direction === "left" ? -0.5 : 0.5);
  const rafRef = useRef(null);
  const pausedRef = useRef(false);
  const dragOffsetRef = useRef(0);
  const isDraggingRef = useRef(false);
  const xRef = useRef(0); // mutable x for the rAF loop

  // Duplicate items for seamless loop
  const items = [...certificates, ...certificates];

  useEffect(() => {
    const singleWidth = containerRef.current
      ? containerRef.current.scrollWidth / 2
      : 0;

    let x = 0;
    const animate = () => {
      if (!pausedRef.current && !isDraggingRef.current) {
        x += speedRef.current;
        if (direction === "left" && x <= -singleWidth) x += singleWidth;
        if (direction === "right" && x >= 0) x -= singleWidth;
        xRef.current = x;
        setAnimX(x);
      }
      rafRef.current = requestAnimationFrame(animate);
    };

    // Start right-moving rows offset so they scroll from the other side
    if (direction === "right") x = -singleWidth;

    xRef.current = x;
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [direction]);

  // Hammer.js touch gesture integration
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const hammer = new Hammer(el, {
      recognizers: [
        [Hammer.Pan, { direction: Hammer.DIRECTION_HORIZONTAL, threshold: 10 }],
        [Hammer.Swipe, { direction: Hammer.DIRECTION_HORIZONTAL }],
      ],
    });

    hammer.on("panstart", () => {
      isDraggingRef.current = true;
      dragOffsetRef.current = xRef.current;
    });

    hammer.on("panmove", (e) => {
      const newX = dragOffsetRef.current + e.deltaX;
      xRef.current = newX;
      setAnimX(newX);
    });

    hammer.on("panend pancancel", (e) => {
      // Apply momentum: add velocity-based offset
      const momentum = e.velocityX * 150;
      xRef.current = xRef.current + momentum;
      setAnimX(xRef.current);
      isDraggingRef.current = false;
    });

    hammer.on("swipeleft swiperight", (e) => {
      const boost = e.velocityX * 200;
      xRef.current = xRef.current + boost;
      setAnimX(xRef.current);
    });

    return () => {
      hammer.destroy();
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="overflow-hidden cursor-grab active:cursor-grabbing touch-pan-y"
      onMouseEnter={() => (pausedRef.current = true)}
      onMouseLeave={() => {
        pausedRef.current = false;
        isDraggingRef.current = false;
      }}
    >
      <div
        ref={containerRef}
        className="flex gap-5 w-max will-change-transform"
        style={{ transform: `translateX(${animX}px)` }}
      >
        {items.map((cert, i) => (
          <button
            key={`${cert.title}-${i}`}
            onClick={() => {
              // Don't open modal if the user was dragging
              if (!isDraggingRef.current) onSelect(cert);
            }}
            className="flex-shrink-0 w-[320px] h-[220px] sm:w-[400px] sm:h-[275px] lg:w-[450px] lg:h-[310px] p-2 bg-white border border-[#d4ccd4] rounded-[16px] shadow-[0_2px_8px_rgba(36,0,41,0.06)] hover:border-[#df37a7] hover:shadow-lg transition-all duration-300 cursor-pointer group text-left relative overflow-hidden"
          >
            <div className="w-full h-full rounded-[10px] overflow-hidden bg-slate-50 flex items-center justify-center relative">
              <img
                src={cert.image}
                alt={cert.title}
                className="w-full h-full object-contain p-1 group-hover:scale-102 transition-transform duration-300"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#240029]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end p-4">
                <span className="text-white text-xs sm:text-sm font-semibold truncate drop-shadow-md">
                  {cert.title}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Certificates({ isDark }) {
  const [certificatesData] = usePortfolioData("certificates", initialCertificatesData);
  const rows = [certificatesData?.row1 || [], certificatesData?.row2 || []];
  const allCerts = [...(certificatesData?.row1 || []), ...(certificatesData?.row2 || [])];
  const [selected, setSelected] = useState(null);
  const modalRef = useRef(null);

  // Close modal on Escape key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") setSelected(null);
    };
    if (selected) window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [selected]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (selected) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selected]);

  // Hammer.js swipe navigation in modal
  useEffect(() => {
    const el = modalRef.current;
    if (!el || !selected) return;

    const hammer = new Hammer(el, {
      recognizers: [
        [Hammer.Swipe, { direction: Hammer.DIRECTION_HORIZONTAL, threshold: 50 }],
      ],
    });

    hammer.on("swipeleft", () => {
      const idx = allCerts.findIndex((c) => c.title === selected.title);
      if (idx < allCerts.length - 1) setSelected(allCerts[idx + 1]);
    });

    hammer.on("swiperight", () => {
      const idx = allCerts.findIndex((c) => c.title === selected.title);
      if (idx > 0) setSelected(allCerts[idx - 1]);
    });

    return () => hammer.destroy();
  }, [selected, allCerts]);

  // Navigate modal with arrows
  const navigateModal = useCallback(
    (dir) => {
      if (!selected) return;
      const idx = allCerts.findIndex((c) => c.title === selected.title);
      const next = idx + dir;
      if (next >= 0 && next < allCerts.length) setSelected(allCerts[next]);
    },
    [selected, allCerts]
  );

  const directions = ["left", "right", "left"];

  return (
    <section
      id="certificates"
      className="py-24 bg-[#fdfafc] border-b border-[#d4ccd4]"
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="font-mono text-xs font-semibold tracking-[0.10em] text-[#240029] uppercase mb-3 block">
            // 06 · CREDENTIALS & LICENSES
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#240029] tracking-tight leading-tight">
            Certificates & credentials.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#6d526d] leading-relaxed">
            Professional certifications and credentials earned across cloud, web, and hardware engineering.
          </p>
        </div>
      </div>

      {/* Scrolling Rows - full width */}
      <div className="space-y-6">
        {rows.map((rowCerts, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.15 }}
          >
            <ScrollingRow
              certificates={rowCerts}
              direction={directions[i]}
              isDark={isDark}
              onSelect={setSelected}
            />
          </motion.div>
        ))}
      </div>

      {/* Modal with swipe navigation */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md"
            onClick={() => setSelected(null)}
          >
            <motion.div
              ref={modalRef}
              role="dialog"
              aria-modal="true"
              aria-label={selected.title}
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              className="relative max-w-5xl w-full max-h-[94vh] rounded-2xl overflow-hidden bg-white shadow-2xl flex flex-col border border-[#d4ccd4]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-5 sm:px-7 py-3.5 sm:py-4 bg-white border-b border-[#d4ccd4] z-10">
                <div className="flex items-center gap-3 min-w-0 pr-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#dcfce7] text-[#15803d] shrink-0 border border-[#bbf7d0]">
                    <FiCheckCircle size={13} />
                    Verified Credential
                  </span>
                  <h3 className="font-display font-bold text-sm sm:text-base text-[#240029] truncate">
                    {selected.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={selected.image}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#240029] bg-[#240029]/5 hover:bg-[#240029]/10 transition-colors"
                  >
                    <FiExternalLink size={13} />
                    View Full Image
                  </a>
                  <button
                    onClick={() => setSelected(null)}
                    className="p-1.5 sm:p-2 rounded-lg text-[#240029] hover:bg-[#240029]/10 transition-colors cursor-pointer"
                    aria-label="Close"
                  >
                    <FiX size={20} />
                  </button>
                </div>
              </div>

              {/* Certificate Image Viewport */}
              <div className="relative bg-[#0d040f] flex items-center justify-center p-4 sm:p-8 overflow-auto max-h-[78vh]">
                {/* Prev / Next arrows */}
                {allCerts.findIndex((c) => c.title === selected.title) > 0 && (
                  <button
                    onClick={() => navigateModal(-1)}
                    className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/20 hover:bg-white/40 text-white transition-all backdrop-blur-md shadow-lg cursor-pointer hover:scale-105"
                    aria-label="Previous certificate"
                  >
                    <FiChevronLeft size={24} />
                  </button>
                )}
                {allCerts.findIndex((c) => c.title === selected.title) < allCerts.length - 1 && (
                  <button
                    onClick={() => navigateModal(1)}
                    className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/20 hover:bg-white/40 text-white transition-all backdrop-blur-md shadow-lg cursor-pointer hover:scale-105"
                    aria-label="Next certificate"
                  >
                    <FiChevronRight size={24} />
                  </button>
                )}

                <img
                  src={selected.image}
                  alt={selected.title}
                  className="max-w-full max-h-[72vh] w-auto h-auto object-contain rounded-md shadow-2xl bg-white select-none"
                />
              </div>

              {/* Modal Footer */}
              <div className="px-5 sm:px-7 py-3 bg-[#fdfafc] border-t border-[#d4ccd4] flex items-center justify-between text-xs text-[#6d526d]">
                <span>Use keyboard left/right arrow keys or swipe to navigate</span>
                <span className="font-mono">
                  {allCerts.findIndex((c) => c.title === selected.title) + 1} / {allCerts.length}
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
