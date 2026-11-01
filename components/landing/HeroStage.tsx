"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  createStage,
  paintSource,
  renderGrade,
  type Stage,
} from "@/lib/grade/stage";
import { applyLook, LOOKS } from "@/lib/grade/looks";
import { defaultParams } from "@/lib/grade/params";

const CYCLE = ["natural", "teal-orange", "golden-hour", "noir", "bleach-bypass"] as const;
const W = 1200;
const H = 675;

export function HeroStage() {
  const baseRef = useRef<HTMLCanvasElement>(null);
  const gradedRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<Stage | null>(null);
  const [split, setSplit] = useState(58);
  const [activeName, setActiveName] = useState("Original frame");

  // Paint the synthetic frame once.
  useEffect(() => {
    const stage = createStage(W, H);
    if (!stage) return;
    stageRef.current = stage;
    paintSource(stage);
    const bctx = baseRef.current?.getContext("2d");
    bctx?.drawImage(stage.source, 0, 0);
  }, []);

  // Auto-explore: alternate the wipe; advance the look every second wipe.
  useEffect(() => {
    let phase = 0;
    let mix = 0;
    const advance = () => {
      mix += 1;
      const id = CYCLE[mix % (CYCLE.length - 1)];
      const stage = stageRef.current;
      const look = LOOKS.find((l) => l.id === id);
      if (stage && look) {
        const params = applyLook(defaultParams(), look, 0.86);
        renderGrade(stage, params);
        const gctx = gradedRef.current?.getContext("2d");
        gctx?.drawImage(stage.graded, 0, 0);
        setActiveName(look.name);
      }
    };
    advance();
    const t1 = window.setInterval(() => {
      phase ^= 1;
      setSplit(phase === 0 ? 58 : 86);
    }, 3600);
    const t2 = window.setInterval(advance, 7200);
    return () => {
      window.clearInterval(t1);
      window.clearInterval(t2);
    };
  }, []);

  return (
    <div className="relative mx-auto max-w-6xl mt-16">
      <div className="absolute -inset-8 bg-bronze/[0.08] rounded-[2rem] blur-3xl pointer-events-none" />
      <div className="relative rounded-2xl border border-line overflow-hidden bg-bg-raised noise shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)]">
        <div className="relative aspect-[16/9]">
          <canvas
            ref={baseRef}
            width={W}
            height={H}
            className="absolute inset-0 w-full h-full"
          />
          <canvas
            ref={gradedRef}
            width={W}
            height={H}
            className="absolute inset-0 w-full h-full"
            style={{
              clipPath: `inset(0 0 0 ${split}%)`,
              transition: "clip-path 3.4s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          />
          <div
            className="absolute top-0 bottom-0 w-px via-bronze-bright/90"
            style={{
              left: `${split}%`,
              transition: "left 3.4s cubic-bezier(0.4, 0, 0.2, 1)",
              background:
                "linear-gradient(to bottom, transparent, rgba(232,207,162,0.9), transparent)",
              boxShadow: "0 0 24px rgba(232, 207, 162, 0.55)",
            }}
          />
          <div className="absolute left-4 bottom-4 flex items-center gap-3">
            <span className="pill-badge !bg-black/40">{activeName}</span>
          </div>
          <div className="absolute right-4 bottom-4">
            <span className="pill-badge !bg-black/40 text-bronze-bright">
              ● Rendered in-browser
            </span>
          </div>
        </div>
      </div>
      <div className="mt-5 flex items-center justify-center gap-2">
        <span className="size-1.5 rounded-full bg-bronze-bright pulse-soft" />
        <p className="mono-label !text-[10px]">
          Auto-comparing film looks
        </p>
      </div>
      <div className="mt-4 flex justify-center">
        <Link href="/studio" className="btn-ghost gap-2">
          Open Studio <ArrowRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}
