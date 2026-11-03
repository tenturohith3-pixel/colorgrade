"use client";

/**
 * SCENE 01 — COLD OPEN.
 * A dark, near-silent scene: the seed of a story. The "flat frame"
 * (Exhibit A) presented as evidence, and one instruction: scroll.
 * On exit the scene breathes apart — kicker rises, type sinks, frame drifts.
 */

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { FrameCanvas } from "@/components/landing/FrameCanvas";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function ActOpen() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced || !sectionRef.current) return;

      /* ── Entrance ── */
      gsap.set(".open-line", { yPercent: 118, rotate: 2.5 });
      gsap.set(".open-fx", { y: 26, opacity: 0 });
      gsap.set(".open-frame", { y: 46, opacity: 0, rotate: 3, scale: 0.96 });

      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
      tl.to(".open-line", { yPercent: 0, rotate: 0, duration: 1.2, stagger: 0.12 }, 0.1)
        .to(".open-frame", { y: 0, opacity: 1, rotate: 0, scale: 1, duration: 1.1 }, 0.5)
        .to(".open-fx", { y: 0, opacity: 1, duration: 0.8, stagger: 0.1 }, 0.7);

      /* ── Exit: the scene breathes apart ── */
      gsap.to(".open-rise", {
        yPercent: -34,
        opacity: 0,
        ease: "none",
        scrollTrigger: { trigger: sectionRef.current, start: "top top", end: "80% top", scrub: 0.5 },
      });
      gsap.to(".open-fall", {
        yPercent: 22,
        opacity: 0.25,
        ease: "none",
        scrollTrigger: { trigger: sectionRef.current, start: "top top", end: "80% top", scrub: 0.5 },
      });
      gsap.to(".open-frame", {
        yPercent: -16,
        scale: 1.16,
        rotate: -2,
        ease: "none",
        scrollTrigger: { trigger: sectionRef.current, start: "top top", end: "80% top", scrub: 0.5 },
      });
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} id="scene-open" className="relative min-h-[100svh] flex flex-col justify-center overflow-hidden px-6 md:px-12 pt-32 pb-20">
      <div className="mx-auto max-w-6xl w-full">
        {/* scene header */}
        <div className="open-rise flex items-center justify-between">
          <p className="open-fx mono-label !text-[10px]">
            EFFECTCRAFT — A GRADING STORY, TOLD IN SEVEN SCENES
          </p>
          <span className="open-fx mono-num text-[11px] text-ink-faint">SCENE 01</span>
        </div>

        {/* statement */}
        <h1 className="open-rise display text-5xl md:text-7xl lg:text-[6.4rem] leading-[1.03] mt-10 md:mt-14 text-balance max-w-none">
          <span className="hero-mask"><span className="open-line">Every shot</span></span>{" "}
          <span className="hero-mask"><span className="open-line">starts</span></span>{" "}
          <span className="hero-mask"><span className="open-line display italic ticker-outline">flat.</span></span>
        </h1>

        <div className="open-rise flex flex-col lg:flex-row lg:items-end gap-10 lg:gap-16 mt-12 md:mt-16">
          {/* exhibit A */}
          <div className="open-fall relative shrink-0 w-full max-w-[420px]">
            <div className="open-frame relative rounded-xl border border-line overflow-hidden noise shadow-[0_40px_110px_-40px_rgba(0,0,0,0.9)] bg-bg-raised">
              <FrameCanvas w={800} h={450} className="block w-full h-auto opacity-80" />
              <div className="flex items-center justify-between px-4 py-3 border-t border-line">
                <span className="mono-label !text-[9px]">EXHIBIT A — THE FLAT FRAME</span>
                <span className="mono-num text-[9px] text-ink-faint">SATURATION 0.0</span>
              </div>
            </div>
          </div>

          {/* the instruction */}
          <div className="open-rise max-w-md">
            <p className="open-fx text-lg md:text-xl text-ink-muted font-light leading-relaxed">
              This whole page is graded live — same engine, same math as the
              Studio. No screenshots, no videos.{" "}
              <span className="text-ink">Scroll, and watch a frame earn its color.</span>
            </p>
            <div className="open-fx mt-8 flex items-center gap-4">
              <span className="relative block h-10 w-px bg-line overflow-hidden">
                <span className="absolute inset-x-0 top-0 h-3 bg-bronze-bright animate-[scrolldot_1.8s_ease-in-out_infinite]" />
              </span>
              <p className="mono-label !text-[10px]">SCROLL — THE STORY MOVES WITH YOU</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
