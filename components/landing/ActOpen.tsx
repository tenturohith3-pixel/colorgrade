"use client";

/**
 * SCENE 01 — COLD OPEN, full parallax.
 * One cinematic title-card: a giant ghost word drifting deep in the back,
 * the flat frame center stage, and floating read-out chips at three
 * different depths — every layer travels at its own velocity while the
 * scene flows past, so the intro itself already feels dimensional.
 */

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { FrameCanvas } from "@/components/landing/FrameCanvas";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const CHIPS = [
  { label: "SATURATION", value: "0.0", pos: "left-[6%] md:left-[12%] top-[24%]",
    exit: { yPercent: -46, xPercent: -9, rotate: -4, opacity: 0 } },
  { label: "CONTRAST", value: "±0.00", pos: "right-[6%] md:right-[10%] top-[20%]",
    exit: { yPercent: -22, xPercent: 12, rotate: 3, opacity: 0 } },
  { label: "EXPOSURE", value: "+0.0 EV", pos: "right-[10%] md:right-[22%] bottom-[18%]",
    exit: { yPercent: -78, xPercent: -14, rotate: -6, opacity: 0 } },
];

export function ActOpen() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const root = sectionRef.current;
      if (!root) return;
      if (reduced) return;

      /* ── Entrance ── */
      gsap.set(".open-line", { yPercent: 118, rotate: 2.5 });
      gsap.set(".open-fx", { y: 26, opacity: 0 });
      gsap.set(".open-frame", { y: 60, opacity: 0, rotate: 3.5, scale: 0.94 });
      gsap.set(".open-chip", { y: 22, opacity: 0 });

      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
      tl.to(".open-line", { yPercent: 0, rotate: 0, duration: 1.25, stagger: 0.12 }, 0.1)
        .to(".open-frame", { y: 0, opacity: 1, rotate: 0, scale: 1, duration: 1.2 }, 0.45)
        .to(".open-chip", { y: 0, opacity: 1, duration: 0.7, stagger: 0.09 }, 0.8)
        .to(".open-fx", { y: 0, opacity: 1, duration: 0.8, stagger: 0.09 }, 0.9);

      /* ── Parallax pass — one exit window per layer ── */
      const pass = (start: string, end: string) => ({
        trigger: root,
        start,
        end,
        scrub: 0.5,
      } as const);

      /* deep background: travels the whole pass, slower than everything */
      gsap.to(".open-ghost", {
        yPercent: 26,
        xPercent: -5,
        ease: "none",
        scrollTrigger: pass("top bottom", "bottom top"),
      });
      gsap.to(".open-halo", {
        yPercent: -14,
        opacity: 0.1,
        scale: 1.12,
        ease: "none",
        scrollTrigger: pass("top bottom", "bottom top"),
      });

      /* content plane: exits as the section leaves */
      gsap.to(".open-head", {
        yPercent: -55,
        opacity: 0,
        ease: "none",
        scrollTrigger: pass("top top", "70% top"),
      });
      gsap.to(".open-frame", {
        yPercent: -10,
        scale: 1.07,
        rotate: -1.5,
        ease: "none",
        scrollTrigger: pass("top top", "bottom top"),
      });

      /* floating chips: three distinct velocities → depth */
      gsap.utils.toArray<HTMLElement>(".open-chip").forEach((chip, i) => {
        const exit = CHIPS[i]?.exit ?? { yPercent: -40, xPercent: 0, rotate: 0, opacity: 0 };
        gsap.to(chip, {
          ...exit,
          ease: "none",
          scrollTrigger: pass("top top", "bottom top"),
        });
      });

      /* scroll cue dies immediately */
      gsap.to(".open-cue", {
        opacity: 0,
        y: 14,
        ease: "none",
        scrollTrigger: pass("top top", "22% top"),
      });
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      id="scene-open"
      className="relative h-[104svh] overflow-hidden flex flex-col justify-center px-6 md:px-12 pt-28 pb-14"
    >
      {/* ghost word — the deepest layer */}
      <div
        aria-hidden
        className="open-ghost absolute inset-0 grid place-items-center pointer-events-none select-none"
      >
        <span className="display italic ticker-outline leading-none text-[30vw] md:text-[22vw] opacity-[0.08]">
          FLAT
        </span>
      </div>

      {/* halo behind the frame */}
      <div
        aria-hidden
        className="open-halo absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-[42rem] max-w-[120vw] rounded-full blur-[120px] opacity-25 pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(201,160,106,0.32), transparent 62%)",
        }}
      />

      <div className="relative mx-auto max-w-6xl w-full text-center">
        {/* kicker */}
        <p className="open-fx mono-label !text-[10px]">
          EFFECTCRAFT — A GRADING STORY
        </p>

        {/* heading overlaps the top of the frame */}
        <h1 className="open-head display text-5xl md:text-7xl lg:text-[6.4rem] leading-[1.03] mt-6 md:-mb-7 lg:-mb-10 relative z-10 text-balance">
          <span className="hero-mask"><span className="open-line">Every shot</span></span>{" "}
          <span className="hero-mask"><span className="open-line">starts</span></span>{" "}
          <span className="hero-mask"><span className="open-line display italic ticker-outline">flat.</span></span>
        </h1>

        {/* exhibit A — center stage */}
        <div className="open-frame relative mx-auto mt-10 md:mt-8 w-full max-w-[min(86vw,640px)]">
          <div className="relative rounded-2xl border border-line overflow-hidden noise shadow-[0_60px_150px_-45px_rgba(0,0,0,0.95)] bg-bg-raised">
            <FrameCanvas w={1280} h={720} className="block w-full h-auto opacity-85" />
            <div className="flex items-center justify-between px-4 py-3 border-t border-line">
              <span className="mono-label !text-[9px]">EXHIBIT A — THE FLAT FRAME</span>
              <span className="mono-num text-[9px] text-ink-faint">WASM · RENDERED LIVE</span>
            </div>
          </div>

          {/* read-out chips at three depths */}
          {CHIPS.map((chip) => (
            <div
              key={chip.label}
              className={`open-chip absolute glass rounded-lg px-3.5 py-2.5 text-left hidden sm:block [will-change:transform] ${chip.pos}`}
            >
              <p className="mono-label !text-[8px] !text-ink-faint">{chip.label}</p>
              <p className="mono-num text-[11px] text-bronze-bright mt-0.5">{chip.value}</p>
            </div>
          ))}
        </div>

        {/* instruction + cue */}
        <p className="open-fx mt-8 text-sm md:text-base text-ink-muted font-light">
          Scroll — this story is graded live by the same engine you&rsquo;re about to use.
        </p>
        <div className="open-cue open-fx mt-6 flex items-center justify-center gap-4">
          <span className="relative block h-10 w-px bg-line overflow-hidden">
            <span className="absolute inset-x-0 top-0 h-3 bg-bronze-bright animate-[scrolldot_1.8s_ease-in-out_infinite]" />
          </span>
          <p className="mono-label !text-[10px]">SCROLL</p>
        </div>
      </div>
    </section>
  );
}
