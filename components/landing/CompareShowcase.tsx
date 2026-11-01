"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { MoveHorizontal } from "lucide-react";
import {
  createStage,
  paintSource,
  renderGrade,
  type Stage,
} from "@/lib/grade/stage";
import { applyLook, LOOKS } from "@/lib/grade/looks";
import { defaultParams } from "@/lib/grade/params";
import { cn } from "@/lib/cn";

const PICKED = ["natural", "teal-orange", "golden-hour", "noir", "bleach-bypass", "faded-70s"] as const;
const W = 1280;
const H = 720;

export function CompareShowcase() {
  const stageRef = useRef<Stage | null>(null);
  const baseRef = useRef<HTMLCanvasElement>(null);
  const gradedRef = useRef<HTMLCanvasElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [split, setSplit] = useState(62);
  const [lookId, setLookId] = useState<string>("teal-orange");
  const [grabbing, setGrabbing] = useState(false);

  useEffect(() => {
    const stage = createStage(W, H);
    if (!stage) return;
    stageRef.current = stage;
    paintSource(stage);
    const bctx = baseRef.current?.getContext("2d");
    bctx?.drawImage(stage.source, 0, 0);
    const look = LOOKS.find((l) => l.id === lookId);
    if (look) {
      renderGrade(stage, applyLook(defaultParams(), look, 1));
      const gctx = gradedRef.current?.getContext("2d");
      gctx?.drawImage(stage.graded, 0, 0);
    }
  }, []);

  const applyLookId = useCallback((id: string) => {
    setLookId(id);
    const stage = stageRef.current;
    if (!stage) return;
    const look = LOOKS.find((l) => l.id === id);
    if (!look) return;
    // Graded side shows the full look; left of split stays original.
    renderGrade(stage, applyLook(defaultParams(), look, 1));
    const gctx = gradedRef.current?.getContext("2d");
    gctx?.drawImage(stage.graded, 0, 0);
  }, []);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setGrabbing(true);
    (e.target as Element).setPointerCapture?.(e.pointerId);
    moveTo(e.clientX);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!grabbing) return;
    moveTo(e.clientX);
  };
  const end = () => setGrabbing(false);
  const moveTo = (clientX: number) => {
    const el = cardRef.current?.querySelector<HTMLElement>("[data-stage]") ?? null;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const pct = ((clientX - r.left) / r.width) * 100;
    setSplit(Math.min(95, Math.max(5, pct)));
  };

  const activeLook = LOOKS.find((l) => l.id === lookId);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-wrap items-center gap-2 justify-center mb-8">
        {LOOKS.filter((l) => (PICKED as readonly string[]).includes(l.id)).map(
          (l) => (
            <button
              key={l.id}
              onClick={() => applyLookId(l.id)}
              className={cn(
                "px-4 py-2 rounded-lg text-[13px] border transition-all duration-200",
                lookId === l.id
                  ? "border-bronze/50 bg-bronze/10 text-bronze-bright"
                  : "border-line text-ink-muted hover:text-ink hover:border-line-strong",
              )}
            >
              {l.name}
            </button>
          ),
        )}
      </div>

      <div
        className={cn(
          "relative rounded-2xl border border-line overflow-hidden bg-bg-raised select-none",
          grabbing && "cursor-grabbing",
        )}
        ref={cardRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={end}
        onPointerLeave={end}
        style={{ touchAction: grabbing ? "none" : "auto" }}
      >
        <div data-stage className="relative aspect-[16/9]">
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
            style={{ clipPath: `inset(0 0 0 ${split}%)` }}
          />
          <div
            className="absolute top-0 bottom-0 w-px"
            style={{
              left: `${split}%`,
              background:
                "linear-gradient(to bottom, transparent, rgba(232,207,162,0.9), transparent)",
              boxShadow: "0 0 24px rgba(232,207,162,0.5)",
            }}
          >
            <div
              data-handle=""
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 grid place-items-center size-9 rounded-full border border-bronze-bright/60 bg-black/60 backdrop-blur-md"
            >
              <MoveHorizontal className="size-4 text-bronze-bright" />
            </div>
          </div>
          <span className="absolute left-4 top-4 pill-badge !bg-black/40">Original</span>
          <span className="absolute right-4 top-4 pill-badge !bg-black/40 text-bronze-bright">
            {activeLook?.name ?? "Look"} — engine live
          </span>
        </div>
      </div>
      <p className="text-center mt-5 mono-label !text-[10px]">
        DRAG THE LINE — REAL GRADES, RENDERED IN YOUR BROWSER
      </p>
    </div>
  );
}
