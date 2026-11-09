import { FiArrowRight, FiDownload, FiExternalLink } from "react-icons/fi";
import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <section id="home" className="relative pt-28 pb-16 sm:pt-36 sm:pb-24 hero-sunset-gradient overflow-hidden">
      {/* Hand-drawn SVG Arrow Definitions */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Centered Hero Stack (max-w-850px) */}
        <div className="max-w-3xl mx-auto text-center flex flex-col items-center relative z-10">
          {/* Eyebrow Label: JetBrains Mono at 0.10em tracking */}
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="font-mono text-xs font-semibold tracking-[0.10em] text-[#240029] uppercase px-3 py-1 bg-white/60 border border-[#d4ccd4] rounded-full backdrop-blur-sm shadow-xs">
              // FULL-STACK WEB · EMBEDDED IOT · 3D FABRICATION
            </span>
          </div>

          {/* Bold Display Headline: Outseta single bold voice */}
          <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold text-[#240029] tracking-[-0.03em] leading-[1.08] mb-6">
            Building complete products from{" "}
            <span className="underline decoration-[#df37a7] decoration-wavy decoration-3 underline-offset-8">
              screen to solder
            </span>
            .
          </h1>

          {/* Subhead: Inter Var 18-20px */}
          <p className="text-lg sm:text-xl text-[#240029]/85 leading-relaxed max-w-2xl font-normal mb-8">
            Hi, I'm <strong>Harsh Gupta</strong>. I engineer real-world systems end-to-end — from high-performance React & edge cloud apps to custom microcontrollers, firmware, and functional 3D fabrication.
          </p>

          {/* Dual CTA Row */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-14">
            <a
              href="#projects"
              className="btn-primary-fuchsia inline-flex items-center gap-2 px-6 py-3.5 text-base font-semibold shadow-md"
            >
              Explore 14+ Projects
              <FiArrowRight size={16} />
            </a>
            <a
              href="https://drive.google.com/drive/folders/1QsjDgQIb9rnn2SBt4W5WgHpdeZpqym1C?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost-aubergine inline-flex items-center gap-2 px-6 py-3.5 text-base font-medium bg-white/70 backdrop-blur-xs"
            >
              <FiDownload size={16} />
              Download Resume
            </a>
          </div>

          {/* Hand-Drawn Annotation 1: Left */}
          <div className="hidden lg:flex items-center gap-2 absolute -left-12 top-48 rotate-[-6deg] z-20 pointer-events-none">
            <span className="font-marker text-lg text-[#df37a7] whitespace-nowrap drop-shadow-xs">
              yes, real hardware + software!
            </span>
            <svg width="48" height="42" viewBox="0 0 60 50" fill="none" className="text-[#df37a7] stroke-current stroke-2">
              <path d="M5 10 Q 30 5 45 35 M 32 32 L 46 36 L 44 22" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          {/* Hand-Drawn Annotation 2: Right */}
          <div className="hidden lg:flex items-center gap-2 absolute -right-16 top-64 rotate-[4deg] z-20 pointer-events-none">
            <svg width="44" height="38" viewBox="0 0 50 45" fill="none" className="text-[#240029] stroke-current stroke-2">
              <path d="M45 10 Q 20 15 10 35 M 22 30 L 8 36 L 14 24" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="font-marker text-lg text-[#240029] whitespace-nowrap drop-shadow-xs">
              shipped & live in prod!
            </span>
          </div>
        </div>

        {/* 3-Column Showcase Card Row (Hero Proof Points) */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          {/* Card 1: Arcion */}
          <div className="card-outseta overflow-hidden flex flex-col group bg-white">
            <div className="aspect-[16/10] overflow-hidden bg-slate-100 relative">
              <img
                src="/imgs/projects/arcion.gif"
                alt="Arcion Platform"
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
              />
              <span className="badge-success-outseta absolute top-3 left-3 text-[11px] px-2.5 py-0.5">
                ● Live Marketplace
              </span>
            </div>
            <div className="p-5 flex flex-col flex-1">
              <div className="flex items-center justify-between mb-1.5">
                <h3 className="font-display font-bold text-lg text-[#240029]">Arcion</h3>
                <a
                  href="https://arcion.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#6d526d] hover:text-[#df37a7] transition-colors"
                  aria-label="Visit Arcion"
                >
                  <FiExternalLink size={16} />
                </a>
              </div>
              <p className="text-sm text-[#6d526d] line-clamp-2 mb-3">
                Premium 3D printing marketplace across India with automated STL slicing, custom CAD quotes, and DTC store.
              </p>
              <div className="mt-auto flex flex-wrap gap-1.5">
                <span className="text-[11px] font-mono px-2 py-0.5 bg-[#240029]/5 text-[#240029] rounded-[4px]">Next.js</span>
                <span className="text-[11px] font-mono px-2 py-0.5 bg-[#240029]/5 text-[#240029] rounded-[4px]">TypeScript</span>
                <span className="text-[11px] font-mono px-2 py-0.5 bg-[#240029]/5 text-[#240029] rounded-[4px]">3D Printing</span>
              </div>
            </div>
          </div>

          {/* Card 2: BolKhata */}
          <div className="card-outseta overflow-hidden flex flex-col group bg-white">
            <div className="aspect-[16/10] overflow-hidden bg-slate-100 relative">
              <img
                src="/imgs/projects/bolkhata.webp"
                alt="BolKhata Voice Ledger"
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
              />
              <span className="badge-success-outseta absolute top-3 left-3 text-[11px] px-2.5 py-0.5">
                ● Edge Worker Live
              </span>
            </div>
            <div className="p-5 flex flex-col flex-1">
              <div className="flex items-center justify-between mb-1.5">
                <h3 className="font-display font-bold text-lg text-[#240029]">BolKhata</h3>
                <a
                  href="https://bolkhata.harshgupta24716.workers.dev/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#6d526d] hover:text-[#df37a7] transition-colors"
                  aria-label="Visit BolKhata"
                >
                  <FiExternalLink size={16} />
                </a>
              </div>
              <p className="text-sm text-[#6d526d] line-clamp-2 mb-3">
                Voice and AI-first digital ledger for Bharat. Track credit, customer balances, and utility bills in Hindi & Hinglish.
              </p>
              <div className="mt-auto flex flex-wrap gap-1.5">
                <span className="text-[11px] font-mono px-2 py-0.5 bg-[#240029]/5 text-[#240029] rounded-[4px]">Cloudflare D1</span>
                <span className="text-[11px] font-mono px-2 py-0.5 bg-[#240029]/5 text-[#240029] rounded-[4px]">React</span>
                <span className="text-[11px] font-mono px-2 py-0.5 bg-[#240029]/5 text-[#240029] rounded-[4px]">Voice AI</span>
              </div>
            </div>
          </div>

          {/* Card 3: Rewardlo */}
          <div className="card-outseta overflow-hidden flex flex-col group bg-white">
            <div className="aspect-[16/10] overflow-hidden bg-slate-100 relative">
              <img
                src="/imgs/projects/rewardlo.gif"
                alt="Rewardlo Loyalty Platform"
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
              />
              <span className="badge-success-outseta absolute top-3 left-3 text-[11px] px-2.5 py-0.5">
                ● SaaS Platform
              </span>
            </div>
            <div className="p-5 flex flex-col flex-1">
              <div className="flex items-center justify-between mb-1.5">
                <h3 className="font-display font-bold text-lg text-[#240029]">Rewardlo</h3>
                <a
                  href="https://rewardlo-app.harshgupta24716.workers.dev/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#6d526d] hover:text-[#df37a7] transition-colors"
                  aria-label="Visit Rewardlo"
                >
                  <FiExternalLink size={16} />
                </a>
              </div>
              <p className="text-sm text-[#6d526d] line-clamp-2 mb-3">
                Merchant digital stamp platform for cafés, salons, and stores to boost repeat visits without app downloads or SMS spam.
              </p>
              <div className="mt-auto flex flex-wrap gap-1.5">
                <span className="text-[11px] font-mono px-2 py-0.5 bg-[#240029]/5 text-[#240029] rounded-[4px]">Next.js</span>
                <span className="text-[11px] font-mono px-2 py-0.5 bg-[#240029]/5 text-[#240029] rounded-[4px]">Cloudflare</span>
                <span className="text-[11px] font-mono px-2 py-0.5 bg-[#240029]/5 text-[#240029] rounded-[4px]">TypeScript</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
