"use client";

/**
 * Story spine — the words prepare the scenes before they happen.
 * GSAP drives the marquee (replaces the CSS loop) so it can bend to the
 * reader: scroll velocity raises the timeScale, scrolling up reverses
 * the whole flow, and it relaxes back to cruising speed.
 */

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const ITEMS: { label: string; solid: boolean }[] = [
  { label: "FLAT", solid: false },
  { label: "LIGHT", solid: true },
  { label: "COLOR", solid: false },
  { label: "TEXTURE", solid: true },
  { label: "MOTION", solid: false },
  { label: "4K", solid: true },
  { label: "DELIVER", solid: false },
];

export function Ticker() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const track = sectionRef.current?.querySelector<HTMLElement>(".ticker-track");
      if (!track) return;

      const flow = gsap.to(track, { xPercent: -50, ease: "none", duration: 30, repeat: -1 });
      flow.timeScale(1);

      let settle: gsap.core.Tween | null = null;
      ScrollTrigger.create({
        onUpdate: (self) => {
          const v = Math.abs(self.getVelocity());
          const dir = self.direction || 1;
          const strength = gsap.utils.clamp(0.5, 7, 1 + v / 2200);
          gsap.to(flow, { timeScale: dir * strength, duration: 0.3, overwrite: "auto" });
          settle?.kill();
          settle = gsap.to(flow, { timeScale: dir, duration: 1.1, delay: 0.3, overwrite: false });
        },
      });
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} aria-hidden className="relative py-14 md:py-20 overflow-hidden select-none">
      <div className="w-full overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
        <div className="ticker-track flex items-center gap-10 md:gap-16 w-max will-change-transform">
          {[0, 1].map((half) => (
            <div key={half} className="flex items-center gap-10 md:gap-16 shrink-0">
              {ITEMS.map((item) => (
                <span
                  key={`${half}-${item.label}`}
                  className={`display leading-none text-[12vw] md:text-[7rem] whitespace-nowrap ${
                    item.solid ? "gradient-text" : "display ticker-outline"
                  }`}
                >
                  {item.label}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
