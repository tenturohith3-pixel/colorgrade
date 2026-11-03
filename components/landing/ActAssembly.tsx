"use client";

/**
 * SCENE 02 — THE ASSEMBLY. The signature moment.
 * The scene pins; ten scattered control fragments (wheels, curve, LUT,
 * sliders, waveform, look chip …) fly in from the page edges and lock
 * into a live grading rig around Exhibit A. Control surfaces become a
 * machine — that's the story beat: the tools gather, then they grade.
 */

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { FrameCanvas } from "@/components/landing/FrameCanvas";

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface Frag {
  label: string;
  detail: string;
  pos: string;
  /** hidden on small screens to avoid clutter */
  desktop?: boolean;
  fx: { x: number; y: number; r: number };
}

const FRAGS: Frag[] = [
  { label: "3-WAY WHEELS", detail: "LIFT · GAMMA · GAIN", pos: "left-[2%] top-[10%]", fx: { x: -420, y: -220, r: -26 } },
  { label: "LOG CURVE", detail: "FILM-LINEAR RESPONSE", pos: "right-[2%] top-[7%] desktop-md", desktop: true, fx: { x: 440, y: -200, r: 24 } },
  { label: ".CUBE LUT", detail: "3D LOOKUP · LOADED", pos: "right-[10%] top-[38%]", desktop: true, fx: { x: 380, y: 60, r: 18 } },
  { label: "EXPOSURE", detail: "+0.40 EV", pos: "left-[4%] bottom-[16%]", fx: { x: -360, y: 180, r: -18 } },
  { label: "WAVEFORM", detail: "IRE NOMINAL ✓", pos: "left-[0%] top-[44%]", desktop: true, fx: { x: -520, y: 40, r: -8 } },
  { label: "KODAK 250D", detail: "LOADED — 86%", pos: "right-[4%] bottom-[10%]", fx: { x: 420, y: 220, r: 26 } },
  { label: "GRAIN", detail: "350T · 12%", pos: "left-[30%] bottom-[5%]", fx: { x: -80, y: 300, r: -14 } },
  { label: "ENGINE", detail: "WASM · 60 FPS", pos: "left-[44%] top-[2%]", desktop: true, fx: { x: 40, y: -320, r: -6 } },
  { label: "8-CH HSL", detail: "ORANGE +10 SAT", pos: "left-[12%] top-[30%]", desktop: true, fx: { x: -300, y: -60, r: 30 } },
  { label: "4K EXPORT", detail: "3840PX READY", pos: "right-[16%] bottom-[30%]", desktop: true, fx: { x: 460, y: 120, r: 12 } },
];

export function ActAssembly() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const frags = sectionRef.current
        ? gsap.utils.toArray<HTMLElement>(".as-frag", sectionRef.current)
        : [];
      if (!sectionRef.current || !frags.length) {
        return;
      }
      if (reduced) return; /* fragments already sit in place (SSR default) */

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=2400",
          scrub: 0.6,
          pin: true,
          anticipatePin: 1,
        },
      });

      /* the exhibit arrives first */
      tl.from(".as-frame", { y: 90, scale: 0.82, opacity: 0, ease: "power3.out", duration: 1 }, 0);

      /* then the machine gathers — every fragment from a different edge */
      FRAGS.forEach((frag, i) => {
        const fragEl = frags[i];
        if (!fragEl) return;
        tl.from(fragEl, {
          x: frag.fx.x,
          y: frag.fx.y,
          rotate: frag.fx.r,
          opacity: 0,
          ease: "power3.out",
          duration: 1,
        }, 0.25 + i * 0.12);
      });

      /* lock-in pulse + verdict */
      tl.fromTo(".as-ring", { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1.25, duration: 0.35, ease: "power2.out" }, 1.7)
        .to(".as-ring", { opacity: 0, scale: 1.7, duration: 0.45, ease: "power2.in" }, 2.05)
        .from(".as-verdict", { opacity: 0, y: 24, ease: "power2.out", duration: 0.5 }, 2.3)
        .to({}, { duration: 0.7 }); /* hold the assembled rig */
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} id="scene-assembly" className="relative h-[100svh] overflow-hidden px-4 md:px-8">
      <div className="h-full max-w-6xl mx-auto flex flex-col">
        <div className="pt-8 md:pt-10 flex items-center justify-between shrink-0">
          <p className="mono-label !text-[10px]">SCENE 02 — THE ASSEMBLY</p>
          <span className="mono-num text-[11px] text-ink-faint">TEN DECISIONS · ONE ENGINE</span>
        </div>

        {/* the rig */}
        <div className="relative flex-1 my-4">
          {/* center exhibit */}
          <div className="absolute inset-0 grid place-items-center pointer-events-none">
            <div>
              <div className="as-frame relative rounded-2xl border border-line overflow-hidden noise bg-bg-raised shadow-[0_60px_160px_-50px_rgba(0,0,0,0.95)] w-[min(72vw,540px)]">
                <FrameCanvas w={960} h={540} className="block w-full h-auto" />
                <span className="absolute left-3 top-3 pill-badge !bg-black/50 !text-[8px]">EXHIBIT A — STILL FLAT</span>
              </div>
              <div className="as-ring absolute -inset-6 rounded-3xl border border-bronze-bright/50 pointer-events-none opacity-0" />
            </div>
          </div>

          {/* fragments */}
          {FRAGS.map((frag) => (
            <div
              key={frag.label}
              className={`as-frag absolute glass px-4 py-3.5 rounded-xl backdrop-blur [will-change:transform] ${frag.desktop ? "hidden md:block" : ""} ${frag.pos}`}
            >
              <p className="mono-num text-[10px] text-bronze-bright">{frag.label}</p>
              <p className="mono-label !text-[8px] mt-1 !text-ink-faint">{frag.detail}</p>
            </div>
          ))}

          {/* verdict — the assembly completes */}
          <div className="as-verdict absolute inset-x-0 bottom-6 md:bottom-10 text-center px-6">
            <p className="display text-2xl md:text-4xl gradient-text">
              The tools arrive. First, they grade the light.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
