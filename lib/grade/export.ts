/**
 * EffectCraft Studio — deterministic still exporter.
 * Re-runs the exact preview pipeline at full resolution, then encodes.
 */

import { createStage, paintSource, renderGrade } from "./stage";
import type { GradeParams } from "./params";

export interface ExportRequest {
  img: HTMLImageElement | HTMLCanvasElement;
  params: GradeParams;
  cube: { size: number; data: Float32Array } | null;
  format: "png" | "jpeg";
  quality: number;
  maxLongEdge: number;
  filenameBase?: string;
}

const wait = (ms = 40) => new Promise<void>((r) => setTimeout(r, ms));

export async function renderExportBlob(
  req: ExportRequest,
): Promise<{ blob: Blob; filename: string }> {
  const { img, params, cube, format, quality, maxLongEdge } = req;
  const srcW =
    "naturalWidth" in img ? img.naturalWidth || img.width : img.width;
  const srcH =
    "naturalHeight" in img ? img.naturalHeight || img.height : img.height;
  const srcLong = Math.max(srcW, srcH);
  const targetLong = Math.min(maxLongEdge, srcLong);
  const scale = targetLong / srcLong;
  const tw = Math.max(2, Math.round((srcW * scale) / 2) * 2);
  const th = Math.max(2, Math.round((srcH * scale) / 2) * 2);

  const stage = createStage(tw, th);
  if (!stage) throw new Error("Could not initialize the render stage.");
  paintSource(stage, img);
  await wait(60);
  renderGrade(stage, params, { cube: cube ?? null });
  await wait(30);
  const blob = await new Promise<Blob | null>((resolve) =>
    stage.graded.toBlob(
      (b) => resolve(b),
      format === "png" ? "image/png" : "image/jpeg",
      format === "png" ? undefined : quality,
    ),
  );
  if (!blob) throw new Error("Encoder returned nothing — try PNG.");
  const base = req.filenameBase ?? "effectcraft-grade";
  const ext = format === "png" ? "png" : "jpg";
  const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-");
  return { blob, filename: `${base}-${tw}x${th}-${stamp}.${ext}` };
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
