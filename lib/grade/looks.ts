/**
 * EffectCraft Studio — film Looks (LUT presets).
 *
 * Each Look is a transparent set of grading parameter overrides blended
 * onto defaults at the user's intensity. No license needed for Basic looks;
 * Pro-locked looks are flagged so the UI can gate them.
 */

import { defaultParams, type GradeParams, type HslBandKey, type HslBand } from "./params";

export interface Look {
  id: string;
  name: string;
  tag: string;
  locked: "free" | "pro" | "studio";
  params: Partial<Omit<GradeParams, "hsl" | "look" | "lookIntensity">>;
  hsl?: Partial<Record<HslBandKey, Partial<HslBand>>>;
}

export const LOOKS: Look[] = [
  {
    id: "natural",
    name: "Natural",
    tag: "No grading",
    locked: "free",
    params: {},
  },
  {
    id: "kodak-250d",
    name: "Kodak 250D",
    tag: "Film emulation",
    locked: "free",
    params: {
      exposure: -2,
      contrast: 14,
      saturation: 8,
      temperature: 14,
      liftHue: -8,
      liftSat: 4,
      gainHue: 6,
      gainSat: -3,
      vignette: 12,
      highlightRecovery: 18,
    },
    hsl: {
      orange: { s: 10, l: 4 },
      yellow: { s: -8 },
      blue: { h: -6, s: -6 },
    },
  },
  {
    id: "teal-orange",
    name: "Teal & Orange",
    tag: "Blockbuster",
    locked: "free",
    params: {
      contrast: 20,
      saturation: 6,
      temperature: 10,
      liftHue: -26,
      liftSat: 14,
      gammaHue: -10,
      gainHue: 14,
      gainSat: 6,
      highlightRecovery: 10,
      vignette: 14,
    },
    hsl: {
      orange: { s: 12, l: 6 },
      aqua: { h: -8, s: 16 },
      blue: { h: 6, s: 10 },
    },
  },
  {
    id: "golden-hour",
    name: "Golden Hour",
    tag: "Warm signature",
    locked: "free",
    params: {
      exposure: 3,
      contrast: 10,
      temperature: 28,
      tint: -5,
      saturation: 12,
      gainHue: 8,
      gainSat: 2,
      halation: 14,
      highlightRecovery: 22,
      vignette: 10,
    },
  },
  {
    id: "noir",
    name: "Slate Noir",
    tag: "Monochrome",
    locked: "free",
    params: {
      saturation: -100,
      contrast: 28,
      brightness: -4,
      liftSat: 6,
      gainSat: 8,
      vignette: 22,
      filmGrain: 14,
    },
  },
  {
    id: "bleach-bypass",
    name: "Bleach Bypass",
    tag: "Aggressive",
    locked: "free",
    params: {
      exposure: -5,
      contrast: 38,
      saturation: -42,
      liftHue: -10,
      gainSat: 10,
      filmGrain: 10,
      vignette: 18,
      highlightRecovery: 26,
    },
  },
  {
    id: "faded-70s",
    name: "Faded '70s",
    tag: "Vintage",
    locked: "free",
    params: {
      exposure: 2,
      contrast: -12,
      saturation: -18,
      temperature: 16,
      liftHue: 18,
      liftSat: -8,
      gammaHue: 6,
      filmGrain: 22,
      halation: 10,
      vignette: 26,
      highlightRecovery: 14,
    },
  },
  {
    id: "arctic",
    name: "Arctic",
    tag: "Cool editorial",
    locked: "free",
    params: {
      contrast: 16,
      temperature: -30,
      tint: -6,
      saturation: -8,
      liftHue: 10,
      liftSat: 8,
      gammaHue: -12,
      gainHue: -6,
      gainSat: 4,
      highlightRecovery: 18,
      vignette: 12,
    },
  },
  {
    id: "neon-tokyo",
    name: "Neon Tokyo",
    tag: "Night city",
    locked: "pro",
    params: {
      exposure: -6,
      contrast: 24,
      saturation: 18,
      tint: 8,
      liftHue: -22,
      liftSat: 18,
      gammaHue: -14,
      gainHue: 20,
      gainSat: 14,
      bloom: 22,
      halation: 12,
      vignette: 24,
    },
    hsl: {
      magenta: { h: 8, s: 22 },
      purple: { s: 18 },
      aqua: { s: 20 },
    },
  },
  {
    id: "vernacular",
    name: "Everglade",
    tag: "Wetland green",
    locked: "studio",
    params: {
      exposure: -3,
      contrast: 12,
      temperature: -8,
      saturation: 6,
      liftHue: 22,
      liftSat: 10,
      gammaHue: 14,
      gammaSat: 6,
      gainHue: -12,
      filmGrain: 12,
      halation: 12,
      bloom: 10,
      vignette: 16,
      hdr: 18,
    },
    hsl: {
      green: { h: -10, s: 16 },
      yellow: { h: 8, s: 12 },
      aqua: { h: 6, s: 8 },
    },
  },
];

export const lookById = new Map(LOOKS.map((l) => [l.id, l]));

export function getLook(id: string): Look | null {
  return lookById.get(id) ?? null;
}

/** Blend look overrides onto a target params object at `dose` (0..1). */
export function applyLook(
  target: GradeParams,
  look: Look,
  dose: number,
): GradeParams {
  if (dose <= 0) return target;
  const base = defaultParams();
  const numericKeys = Object.keys(look.params) as (keyof typeof look.params)[];
  for (const k of numericKeys) {
    const v = look.params[k];
    if (typeof v !== "number") continue;
    const baseVal = base[k as keyof GradeParams] as number;
    // Blend toward the look value from the default, scaled by dose.
    (target[k as keyof GradeParams] as number) =
      baseVal + (v - baseVal) * dose;
  }
  if (look.hsl) {
    for (const band of Object.keys(look.hsl) as HslBandKey[]) {
      const ov = look.hsl[band];
      if (!ov) continue;
      const slot = target.hsl[band];
      const safe = slot ?? { h: 0, s: 0, l: 0 };
      target.hsl[band] = {
        h: (safe.h ?? 0) + ((ov.h ?? 0) * dose),
        s: (safe.s ?? 0) + ((ov.s ?? 0) * dose),
        l: (safe.l ?? 0) + ((ov.l ?? 0) * dose),
      };
    }
  }
  return target;
}

/** Helpers for building look params. */
export function hslBand(
  h = 0,
  s = 0,
  l = 0,
): Partial<HslBand> {
  return { h, s, l };
}

