"use client";

/**
 * SCENE 05 — TEXTURE & TONE. The frame has light and color; now it gets
 * skin. Film grain, halation, bloom — and the catalog count assembles:
 * "6" and "5" fly in from opposite edges and lock into 65 while three
 * Prism module tickets stack in from alternating sides.
 */

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { FrameCanvas } from "@/components/landing/FrameCanvas";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const TICKETS = [
  { label: "S_GLOW.TASK", sub: "HALATION · WARP-SOFT", side: -1 },
  { label: "S_LIGHT_RAYS", sub: "VOLUMETRIC SHAFTS", side: 1 },
  { label: "S_HALATION", sub: "BOUNCE · DIGITAL FILM", side: -1 },
];

export function ActTexture() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced || !sectionRef.current) return;
      const mobile = window.matchMedia("(max-width: 767px)").matches;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: mobile ? "+=950" : "+=1600",
          scrub: 0.6,
          pin: true,
          anticipatePin: 1,
        },
      });

      /* backdrop frame drifts through the pin */
      tl.fromTo(".tx-backdrop", { yPercent: -12, scale: 1.04 }, { yPercent: 10, scale: 1.12, ease: "none", duration: 3.4 }, 0);

      /* the count assembles */
      tl.from(".tx-digit-l", { x: -360, rotate: -38, opacity: 0, ease: "back.out(1.6)", duration: 0.9 }, 0.2)
        .from(".tx-digit-r", { x: 360, rotate: 38, opacity: 0, ease: "back.out(1.6)", duration: 0.9 }, 0.45)
        .fromTo(".tx-count-label", { opacity: 0, letterSpacing: "0.7em" }, { opacity: 1, letterSpacing: "0.28em", duration: 0.8, ease: "power2.out" }, 0.9);

      /* module tickets stack in */
      TICKETS.forEach((t, i) => {
        tl.from(`.tx-ticket-${i}`, {
          x: t.side * 380,
          y: t.side * 40,
          rotate: t.side * 10,
          opacity: 0,
          ease: "power3.out",
          duration: 0.7,
        }, 1.2 + i * 0.28);
      });

      /* closing line */
      tl.from(".tx-verdict", { opacity: 0, y: 20, ease: "power2.out", duration: 0.5 }, 2.3)
        .to({}, { duration: 0.7 });
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} id="scene-texture" className="relative h-[100svh] overflow-hidden px-6 md:px-12 noise">
      {/* graded backdrop, drifting */}
      <div className="tx-backdrop absolute inset-0 opacity-[0.16] pointer-events-none" aria-hidden>
        <FrameCanvas w={1280} h={720} look="neon-tokyo" className="block w-full h-full object-cover" />
      </div>

      <div className="relative h-full max-w-6xl mx-auto flex flex-col">
        <div className="pt-8 md:pt-10 flex items-center justify-between shrink-0">
          <p className="mono-label !text-[10px]">SCENE 05 — TEXTURE &amp; TONE</p>
          <span className="mono-num text-[11px] text-ink-faint">GRAIN · HALATION · BLOOM</span>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center text-center">
          {/* the assembling count */}
          <div className="relative flex items-baseline">
            <span className="tx-digit-l display gradient-text leading-none text-[34vw] md:text-[12rem]" style={{ willChange: "transform" }}>6</span>
            <span className="tx-digit-r display gradient-text leading-none text-[34vw] md:text-[12rem]" style={{ willChange: "transform" }}>5</span>
            <span aria-hidden className="absolute inset-0 flex items-baseline opacity-0 pointer-events-none">
              <span className="display leading-none text-[34vw] md:text-[12rem] text-ink/10">65</span>
            </span>
          </div>
          <p className="tx-count-label mono-label !text-[10px] mt-2">MODULES SHIP IN THE PRISM BUNDLE</p>

          {/* module tickets */}
          <div className="mt-10 flex flex-col md:flex-row items-center gap-3.5 md:gap-5">
            {TICKETS.map((t, i) => (
              <div
                key={t.label}
                className={`tx-ticket-${i} glass rounded-xl px-5 py-4 md:px-6 min-w-[210px] md:min-w-[250px] text-left [will-change:transform]`}
                style={{ willChange: "transform" }}
              >
                <p className="mono-num text-[11px] text-bronze-bright">{t.label}</p>
                <p className="mono-label !text-[8px] mt-1.5 !text-ink-faint">{t.sub}</p>
              </div>
            ))}
          </div>

          <p className="tx-verdict max-w-xl mt-10 text-sm md:text-base text-ink-muted font-light leading-relaxed">
            Studio keys get them free. Every future module too — the bundle
            only ever grows, it is never sold one by one.
          </p>
        </div>
      </div>
    </section>
  );
}
