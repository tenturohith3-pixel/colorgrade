"use client";

/**
 * Shared synthetic test frame — one canvas, painted by the real engine.
 * `paintSource` composes the literary "synthetic dusk" shot; pass a look id
 * to receive the graded twin.
 */

import { useEffect, useRef } from "react";
import {
  createStage,
  paintSource,
  renderGrade,
  type Stage,
} from "@/lib/grade/stage";
import { applyLook, LOOKS } from "@/lib/grade/looks";
import { defaultParams } from "@/lib/grade/params";

export function FrameCanvas({
  w,
  h,
  look,
  intensity = 1,
  className = "",
}: {
  w: number;
  h: number;
  /** Render the graded variant of this look instead of the raw frame. */
  look?: string;
  intensity?: number;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    /* phones: render at half resolution — the CSS box stays identical,
       memory & paint cost drop to ~25% */
    const small =
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 640px)").matches;
    const scale = small ? 0.5 : 1;
    const sw = Math.max(160, Math.round(w * scale));
    const sh = Math.max(90, Math.round(h * scale));

    const canvas = ref.current;
    if (!canvas) return;
    canvas.width = sw;
    canvas.height = sh;

    const stage: Stage | null = createStage(sw, sh);
    if (!stage) return;
    paintSource(stage);
    if (look) {
      const L = LOOKS.find((l) => l.id === look);
      if (L) renderGrade(stage, applyLook(defaultParams(), L, intensity));
    }
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.drawImage(look ? stage.graded : stage.source, 0, 0);
  }, [w, h, look, intensity]);

  return (
    <canvas
      ref={ref}
      width={w}
      height={h}
      className={className}
      aria-label="synthetic test frame rendered by the EffectCraft engine"
    />
  );
}
