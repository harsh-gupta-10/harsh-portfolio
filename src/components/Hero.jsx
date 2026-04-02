import { useRef } from "react";
import { useScroll } from "framer-motion";
import { ScrollyCanvas } from "./ScrollyCanvas";
import { Overlay } from "./Overlay";

export default function Hero({ isDark }) {
  const container = useRef(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start start", "end end"]
  });

  return (
    <section ref={container} id="home" className="relative h-[500vh] bg-[#121212]">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <ScrollyCanvas scrollYProgress={scrollYProgress} />
        <Overlay isDark={isDark} scrollYProgress={scrollYProgress} />
      </div>
    </section>
  );
}
