"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import {
  createStage,
  paintSource,
  renderGrade,
  type Stage,
} from "@/lib/grade/stage";
import { applyLook, LOOKS } from "@/lib/grade/looks";
import { defaultParams } from "@/lib/grade/params";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const W = 1600;
const H = 900;

/**
 * Pinned grade reveal — a full-bleed frame that stays pinned while you
 * scroll. The grade opens across the raw frame like a shutter (clip-path
 * scrub), labels crossfade, the whole board scales from rest to full.
 */
export function PinnedGradeReveal() {
  const sectionRef = useRef<HTMLElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const gradedRef = useRef<HTMLCanvasElement>(null);

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      /* ── Paint once (raw + graded) — home turf of the real engine ── */
      const stage: Stage | null = createStage(W, H);
      if (stage) {
        paintSource(stage);
        const look = LOOKS.find((l) => l.id === "teal-orange");
        if (look) {
          renderGrade(stage, applyLook(defaultParams(), look, 1));
        }
        const raw = boardRef.current?.querySelector<HTMLCanvasElement>(".pgc-raw");
        const bctx = raw?.getContext("2d");
        bctx?.drawImage(stage.source, 0, 0);
        const gctx = gradedRef.current?.getContext("2d");
        gctx?.drawImage(stage.graded, 0, 0);
      }

      if (reduced) {
        gsap.set(gradedRef.current, { clipPath: "inset(0% 0% 0% 0%)" });
        gsap.set(".pgc-label-graded", { opacity: 1 });
        gsap.set(".pgc-label-raw", { opacity: 0 });
        return;
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=1500",
          scrub: 0.6,
          pin: true,
          anticipatePin: 1,
        },
      });

      // wheel-of-fortune shutter open
      tl.fromTo(gradedRef.current,
        { clipPath: "inset(48% 0% 48% 0%)" },
        { clipPath: "inset(0% 0% 0% 0%)", ease: "none", duration: 1 },
        0,
      );
      // board settles into full view
      tl.fromTo(boardRef.current,
        { scale: 0.92 },
        { scale: 1, ease: "none", duration: 1 },
        0,
      );
      // labels crossfade
      tl.to(".pgc-label-raw", { opacity: 0, duration: 0.3, ease: "power1.in" }, 0.15);
      tl.to(".pgc-label-graded", { opacity: 1, duration: 0.3, ease: "power1.out" }, 0.5);
      tl.to(".pgc-caption", { yPercent: -42, opacity: 0.65, ease: "none", duration: 1 }, 0);
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} id="scene-grade" className="relative h-[100svh] overflow-hidden px-4 md:px-10">
      <div className="h-full max-w-6xl mx-auto flex flex-col justify-center">
        <div className="flex items-center justify-between mb-5 px-2">
          <p className="mono-label !text-[10px]">SCENE 03 — THE GRADE · TEAL &amp; ORANGE, 100% INTENSITY</p>
          <span className="mono-num text-[10px] text-ink-faint hidden md:block">WASM · REAL-TIME</span>
        </div>

        <div ref={boardRef} className="pgc-board relative rounded-2xl border border-line bg-bg-raised overflow-hidden shadow-[0_50px_140px_-40px_rgba(0,0,0,0.9)]">
          <div className="relative aspect-[16/9]">
            <canvas
              className="pgc-raw absolute inset-0 w-full h-full block"
              width={W}
              height={H}
            />
            <canvas
              ref={gradedRef}
              width={W}
              height={H}
              className="absolute inset-0 w-full h-full block"
              style={{ clipPath: "inset(48% 0% 48% 0%)", willChange: "clip-path" }}
            />
            <span className="pgc-label-raw absolute left-4 bottom-4 pill-badge !bg-black/50 transition-opacity">
              RAW
            </span>
            <span className="pgc-label-graded absolute right-4 bottom-4 pill-badge !bg-black/50 text-bronze-bright transition-opacity opacity-0">
              GRADED
            </span>
            <span className="absolute left-4 top-4 mono-label !text-[9px] !bg-black/40 rounded-full px-3 py-1.5 opacity-70">
              FX.170 — SYNTHETIC DUSK TEST CHART
            </span>
          </div>
        </div>

        <div className="relative h-8 mt-6 px-2">
          <p className="pgc-caption absolute inset-x-2 bottom-0 text-center text-sm text-ink-muted">
            One context, one engine, zero uploads — scrub through an actual
            grade, not an image.
          </p>
        </div>
      </div>
    </section>
  );
}
