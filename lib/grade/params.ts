/**
 * EffectCraft Studio — grading parameter model.
 * Pure data; engine + UI + exports all speak this shape.
 */

import type { HslBand, HslBandKey } from "./types";

export type { HslBand, HslBandKey };

export interface GradeParams {
  look: string;            // active Look id ("" = none)
  lookIntensity: number;   // 0..100

  exposure: number;        // -100..100
  contrast: number;        // -100..100
  brightness: number;      // -100..100
  saturation: number;      // -100..100
  temperature: number;     // -100..100  (cool ↔ warm)
  tint: number;            // -100..100  (green ↔ magenta)

  liftHue: number;         // shadows hue rotation
  liftSat: number;         // shadows saturation
  gammaHue: number;        // midtones hue
  gammaSat: number;        // midtones saturation
  gainHue: number;         // highlights hue
  gainSat: number;         // highlights saturation

  hdr: number;             // 0..100
  highlightRecovery: number; // 0..100
  filmGrain: number;       // 0..100   (Studio+)
  halation: number;        // 0..100   (Studio+)
  bloom: number;           // 0..100   (Studio+)
  vignette: number;        // 0..100

  hsl: Record<HslBandKey, HslBand>;
}

export const HSL_BANDS: HslBandKey[] = [
  "red", "orange", "yellow", "green",
  "aqua", "blue", "purple", "magenta",
];

export const HSL_BAND_COLORS: Record<HslBandKey, string> = {
  red: "#f05545",
  orange: "#f07f3e",
  yellow: "#eecb4a",
  green: "#68c96a",
  aqua: "#4ecfd6",
  blue: "#4d8ef0",
  purple: "#8a6cf0",
  magenta: "#e866c4",
};

export function zeroHsl(): Record<HslBandKey, HslBand> {
  const zero = (): HslBand => ({ h: 0, s: 0, l: 0 });
  return {
    red: zero(), orange: zero(), yellow: zero(), green: zero(),
    aqua: zero(), blue: zero(), purple: zero(), magenta: zero(),
  };
}

export function defaultParams(): GradeParams {
  return {
    look: "",
    lookIntensity: 60,

    exposure: 0,
    contrast: 0,
    brightness: 0,
    saturation: 0,
    temperature: 0,
    tint: 0,

    liftHue: 0, liftSat: 0,
    gammaHue: 0, gammaSat: 0,
    gainHue: 0, gainSat: 0,

    hdr: 0,
    highlightRecovery: 0,
    filmGrain: 0,
    halation: 0,
    bloom: 0,
    vignette: 0,

    hsl: zeroHsl(),
  };
}

export function paramsSignature(p: GradeParams): string {
  const parts: string[] = [];
  for (const [k, v] of Object.entries(p)) {
    if (k === "hsl" && v && typeof v === "object") {
      const hsl = v as GradeParams["hsl"];
      for (const band of HSL_BANDS) {
        const b = hsl[band];
        parts.push(`${band}:${b ? `${b.h},${b.s},${b.l}` : "0"}`);
      }
    } else {
      parts.push(`${k}:${String(v)}`);
    }
  }
  return parts.join("|");
}
