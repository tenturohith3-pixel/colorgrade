"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const LINES = [
  "Most tools adjust pixels.",
  "EffectCraft grades films.",
  "Light, color, texture — decided once,",
  "then identical on every frame, every export.",
];

/**
 * Pinned manifesto — the section nails itself to the viewport and the copy
 * wipes from dim to lit line-by-line as you scroll through the pin.
 */
export function PinnedManifesto() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const root = sectionRef.current;
      const wipes = root ? gsap.utils.toArray<HTMLElement>(".mp-wipe", root) : [];
      if (!wipes.length) return;

      if (reduced) {
        gsap.set(wipes, { clipPath: "inset(0 0% 0 0)" });
        return;
      }

      gsap.set(wipes, { clipPath: "inset(0 100% 0 0)" });
      const mobile = window.matchMedia("(max-width: 767px)").matches;
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: mobile ? "+=1000" : "+=1700",
          scrub: 0.55,
          pin: true,
          anticipatePin: 1,
        },
      });
      wipes.forEach((line, i) => {
        tl.to(line, {
          clipPath: "inset(0 0% 0 0)",
          ease: "power2.inOut",
          duration: 1,
        }, i * 0.85 + 0.1);
      });
      // counter / progress PR badge at the end
      tl.to(".mp-progress", { scaleX: 1, ease: "none", duration: wipes.length * 0.85 + 0.4 }, 0);
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} id="scene-thesis" className="relative h-[100svh] overflow-hidden px-6 md:px-12">
      <div className="h-full max-w-5xl mx-auto flex flex-col justify-center">
        <div className="flex items-center justify-between mb-10 md:mb-14">
          <p className="mono-label !text-[10px]">SCENE 03½ — THE DOCTRINE</p>
          <div className="flex items-center gap-3">
            <div className="w-28 md:w-44 h-px bg-line/60 relative overflow-hidden">
              <div className="mp-progress absolute inset-0 origin-left scale-x-0 bg-bronze-bright" />
            </div>
            <span className="mono-num text-[10px] text-ink-faint">PIN 04</span>
          </div>
        </div>

        <div className="space-y-3 md:space-y-4">
          {LINES.map((line) => (
            <p
              key={line}
              className={`display relative text-3xl md:text-6xl lg:text-[4.2rem] leading-[1.12]`}
            >
              {/* base: dim layer */}
              <span className="text-ink-faint">{line}</span>
              {/* overlay: lit layer revealed by scroll */}
              <span
                aria-hidden
                className="mp-wipe absolute inset-0 text-ink"
                style={{ willChange: "clip-path" }}
              >
                {line}
              </span>
            </p>
          ))}
        </div>

        <p className="mt-12 md:mt-16 text-sm md:text-base text-ink-muted font-light max-w-xl">
          No menu-driven guessing, no non-repeatable "&ldquo;vibes&rdquo;. The grading engine is a
          WASM function: parameters in, photons out — bit-for-bit stable in
          CI or on set.
        </p>
      </div>
    </section>
  );
}
