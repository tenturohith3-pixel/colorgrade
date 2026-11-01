/**
 * EffectCraft Studio — canvas stage utilities (client).
 * Manages source/graded canvas pairs, the single grade pass, and the
 * halation/bloom bright-pass composites.
 */

import { gradePass, glowsThreshold } from "./engine";
import { paintSampleFrame } from "./sample";
import type { GradeParams } from "./params";

export interface Stage {
  source: HTMLCanvasElement;
  graded: HTMLCanvasElement;
  sourceCtx: CanvasRenderingContext2D;
  gradedCtx: CanvasRenderingContext2D;
  outData: ImageData | null;
  sourceData: ImageData | null;
  w: number;
  h: number;
}

export function createStage(w: number, h: number): Stage | null {
  if (typeof document === "undefined") return null;
  const source = document.createElement("canvas");
  const graded = document.createElement("canvas");
  source.width = w; source.height = h;
  graded.width = w; graded.height = h;
  const sourceCtx = source.getContext("2d", { willReadFrequently: true });
  const gradedCtx = graded.getContext("2d", { willReadFrequently: true });
  if (!sourceCtx || !gradedCtx) return null;
  return { source, graded, sourceCtx, gradedCtx, w, h, sourceData: null, outData: null };
}

/** Fit an image (or the synthetic sample) into the stage, cover-crop. */
export function paintSource(
  stage: Stage,
  img?: HTMLImageElement | HTMLCanvasElement | null,
): void {
  const { sourceCtx, w, h, source } = stage;
  sourceCtx.clearRect(0, 0, w, h);
  if (
    img &&
    "naturalWidth" in img &&
    (img as HTMLImageElement).naturalWidth > 0
  ) {
    const iw = (img as HTMLImageElement).naturalWidth;
    const ih = (img as HTMLImageElement).naturalHeight;
    const scale = Math.max(w / iw, h / ih);
    const dw = iw * scale;
    const dh = ih * scale;
    sourceCtx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
  } else if (img) {
    // canvas source
    const iw = (img as HTMLCanvasElement).width;
    const ih = (img as HTMLCanvasElement).height;
    const scale = Math.max(w / iw, h / ih);
    const dw = iw * scale;
    const dh = ih * scale;
    sourceCtx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
  } else {
    sourceCtx.fillStyle = "#0b0b0e";
    sourceCtx.fillRect(0, 0, w, h);
    paintSampleFrame(sourceCtx, w, h);
  }
  stage.sourceData = sourceCtx.getImageData(0, 0, w, h);
  // Warm graded canvas + reusable output buffer with the same dims.
  stage.graded.width = w;
  stage.graded.height = h;
  stage.outData = stage.gradedCtx.createImageData(w, h);
  void source;
}

export interface StageRenderOpts {
  cube?: { size: number; data: Float32Array } | null;
  seed?: number;
  skipPostFx?: boolean;
}

export function renderGrade(stage: Stage, params: GradeParams, opts?: StageRenderOpts): void {
  if (!stage.sourceData) paintSource(stage);
  const src = stage.sourceData!;
  if (!stage.outData) stage.outData = stage.gradedCtx.createImageData(stage.w, stage.h);
  const out = stage.outData;
  gradePass(src.data, out.data, stage.w, stage.h, params, opts?.cube ?? null, opts?.seed ?? 11);
  stage.gradedCtx.putImageData(out, 0, 0);
  if (!opts?.skipPostFx) {
    applyGlows(stage, params);
  }
}

/** Halation + bloom: bright-pass → blur → additive composite. */
export function applyGlows(stage: Stage, params: GradeParams): void {
  const halation = params.halation / 100;
  const bloom = params.bloom / 100;
  if (halation < 0.02 && bloom < 0.02) return;

  const w = stage.w;
  const h = stage.h;
  const sw = Math.max(8, (w >> 2));
  const sh = Math.max(8, (h >> 2));

  const bright = document.createElement("canvas");
  bright.width = sw; bright.height = sh;
  const bctx = bright.getContext("2d", { willReadFrequently: true });
  if (!bctx) return;
  bctx.drawImage(stage.graded, 0, 0, sw, sh);

  // Threshold in-place into a second buffer (Pass 1: source copy)
  const base = bctx.getImageData(0, 0, sw, sh);
  const warm = bctx.createImageData(sw, sh);
  glowsThreshold(base.data, warm.data, 0.62, 1.0);
  bctx.putImageData(warm, 0, 0);

  const ctx = stage.gradedCtx;
  if (halation > 0.02) {
    ctx.save();
    ctx.filter = `blur(${Math.max(4, w / 56)}px)`;
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = 0.85 * halation;
    ctx.drawImage(bright, 0, 0, w, h);
    ctx.restore();
  }
  if (bloom > 0.02) {
    const cool = bctx.createImageData(sw, sh);
    glowsThreshold(base.data, cool.data, 0.7, 0.15);
    bctx.putImageData(cool, 0, 0);
    ctx.save();
    ctx.filter = `blur(${Math.max(6, w / 36)}px)`;
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = 0.6 * bloom;
    ctx.drawImage(bright, 0, 0, w, h);
    ctx.restore();
  }
}
