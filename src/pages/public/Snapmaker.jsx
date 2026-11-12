import { useSEO } from "../../hooks/useSEO";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function Snapmaker() {
  useSEO({
    title: "Snapmaker 3D Printing & Manufacturing Lab | Harsh Gupta",
    description: "Harsh Gupta's 3D manufacturing vision, rapid prototyping setup, custom fabrication capabilities, and hardware ecosystem in India.",
    canonical: "https://harshugupta.in/snapmaker",
  });

  return (
    <div className="min-h-screen bg-[#fdfafc] text-[#240029] flex flex-col">
      <Navbar />

      <main className="flex-1 pt-28 sm:pt-36 pb-16 sm:pb-20 px-5 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-4xl">
          <div className="card-outseta overflow-hidden bg-white shadow-xl">
            <div className="border-b border-[#d4ccd4] bg-gradient-to-r from-[#ffbdd3]/30 via-[#fff1bd]/20 to-[#ffcb0f]/20 px-5 py-6 sm:px-10 sm:py-8">
              <span className="font-mono text-xs font-semibold uppercase tracking-[0.15em] text-[#240029] mb-2 block">
                // HARDWARE PARTNERSHIP · SNAPMAKER
              </span>
              <h1 className="font-display text-2xl font-extrabold leading-tight text-[#240029] sm:text-4xl">
                Welcome, Snapmaker Team!
              </h1>
            </div>

            <div className="space-y-5 sm:space-y-6 px-5 py-6 text-sm sm:text-base leading-relaxed text-[#240029]/85 sm:px-10 sm:py-10">
              <p>Thank you for taking the time to visit this page.</p>

              <p>
                My name is <strong>Harsh Gupta</strong>, and I am building a long-term 3D manufacturing
                business in India focused on custom manufacturing, rapid prototyping,
                product development, and e-commerce.
              </p>

              <p>
                My vision extends beyond offering 3D printing services. I aim to build
                a complete 3D printing ecosystem that includes custom product
                manufacturing, educational content, an online marketplace, and, in the
                future, the sale of 3D printers, filaments, accessories, and other
                maker products.
              </p>

              <p>
                I previously managed the YouTube channel <strong>IZOOG10</strong>, which has grown to
                over 7,500 subscribers. While the channel has been inactive in recent
                years, it provided me with valuable experience in content creation and
                audience building. As I launch my business, I will begin a new content
                journey dedicated to 3D printing, entrepreneurship, and digital
                manufacturing, documenting every step—from my first machine to building
                a professional print farm.
              </p>

              <p>
                I am currently developing my own custom e-commerce platform, which will
                initially provide 3D printing services and custom products before
                expanding into the retail of 3D printers, filaments, accessories, and
                other maker products.
              </p>

              <p>
                I believe Snapmaker&apos;s innovative ecosystem is an excellent fit for
                this vision. Rather than seeking a one-time sponsorship, I hope to
                build a long-term relationship through authentic content, real-world
                business use, and future collaboration opportunities.
              </p>

              <p>
                Thank you again for reviewing my proposal. I appreciate your time and
                consideration, and I look forward to the opportunity to grow alongside
                Snapmaker.
              </p>

              <div className="rounded-2xl border border-[#d4ccd4] bg-[#fdfafc] p-6 shadow-xs">
                <p className="font-display text-lg font-bold text-[#240029]">Harsh Gupta</p>
                <ul className="mt-3 space-y-2 text-sm sm:text-base font-medium text-[#6d526d]">
                  <li>
                    <span className="mr-2">📧</span>
                    <a
                      href="mailto:info@harshugupta.in"
                      className="text-[#df37a7] hover:underline"
                    >
                      info@harshugupta.in
                    </a>
                  </li>
                  <li>
                    <span className="mr-2">📞</span>
                    <a
                      href="tel:+919821185590"
                      className="text-[#240029] hover:underline"
                    >
                      +91 9821185590
                    </a>
                  </li>
                  <li>
                    <span className="mr-2">🔗</span>
                    <a
                      href="https://www.linkedin.com/in/harsh-gupta-2b41692b1"
                      target="_blank"
                      rel="noreferrer"
                      className="break-all text-[#df37a7] hover:underline"
                    >
                      LinkedIn Profile
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
