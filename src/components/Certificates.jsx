import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import Hammer from "hammerjs";
import certificatesData from "../data/certificates.json";

const rows = [
  certificatesData.row1,
  certificatesData.row2,
  
];

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
            className={`flex-shrink-0 w-72 h-48 rounded-2xl border overflow-hidden transition-all hover:scale-105 hover:shadow-xl cursor-pointer group ${
              isDark
                ? "bg-[#1E293B] border-[#334155] hover:border-[#3B82F6]/40"
                : "bg-white border-[#E2E8F0] hover:border-[#3B82F6]/40 hover:shadow-blue-500/10"
            }`}
          >
            <img
              src={cert.image}
              alt={cert.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Certificates({ isDark }) {
  const [selected, setSelected] = useState(null);
  const allCerts = [...(certificatesData.row1 || []), ...(certificatesData.row2 || [])];
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
      className={`py-24 ${isDark ? "bg-[#0F172A]" : "bg-white"}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-[#3B82F6] font-semibold text-sm uppercase tracking-wider">
            Certifications
          </span>
          <h2
            className={`mt-3 text-3xl sm:text-4xl font-display font-bold ${isDark ? "text-white" : "text-[#1E293B]"}`}
          >
            Certificates &{" "}
            <span className="bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6] bg-clip-text text-transparent">
              Credentials
            </span>
          </h2>
          <p
            className={`mt-4 max-w-2xl mx-auto ${isDark ? "text-[#94A3B8]" : "text-[#64748B]"}`}
          >
            Professional certifications and credentials earned across various
            technology domains. Swipe or drag to browse.
          </p>
        </motion.div>
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
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelected(null)}
          >
            <motion.div
              ref={modalRef}
              role="dialog"
              aria-modal="true"
              aria-label={selected.title}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className={`relative max-w-4xl w-full max-h-[90vh] rounded-2xl overflow-hidden ${
                isDark ? "bg-[#1E293B]" : "bg-white"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setSelected(null)}
                className={`absolute top-4 right-4 z-10 p-2 rounded-xl transition-colors ${
                  isDark
                    ? "bg-[#0F172A]/80 text-white hover:bg-[#334155]"
                    : "bg-white/80 text-[#1E293B] hover:bg-[#F1F5F9]"
                }`}
                aria-label="Close"
              >
                <FiX size={20} />
              </button>

              {/* Prev / Next arrows */}
              {allCerts.findIndex((c) => c.title === selected.title) > 0 && (
                <button
                  onClick={() => navigateModal(-1)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors backdrop-blur-sm"
                  aria-label="Previous certificate"
                >
                  <FiChevronLeft size={22} />
                </button>
              )}
              {allCerts.findIndex((c) => c.title === selected.title) <
                allCerts.length - 1 && (
                <button
                  onClick={() => navigateModal(1)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors backdrop-blur-sm"
                  aria-label="Next certificate"
                >
                  <FiChevronRight size={22} />
                </button>
              )}

              {/* Certificate Image */}
              <img
                src={selected.image}
                alt={selected.title}
                className="w-full h-auto max-h-[80vh] object-contain"
              />

              {/* Title bar */}
              <div
                className={`px-6 py-4 border-t ${
                  isDark
                    ? "border-[#334155] text-white"
                    : "border-[#E2E8F0] text-[#1E293B]"
                }`}
              >
                <h3 className="font-display font-semibold text-lg text-center">
                  {selected.title}
                </h3>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
