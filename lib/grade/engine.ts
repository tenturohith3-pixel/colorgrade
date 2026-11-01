/**
 * EffectCraft Studio — Canvas 2D grading engine.
 *
 * One deterministic pass over pixels:
 *   base curve (exposure/contrast/brightness) → temperature/tint per-channel
 *   LUTs → global saturation → optional HSL/3-way/luma work in HSL space
 *   → optional .cube 3D LUT → vignette → luma grain.
 * Halation + bloom are cheap bright-pass composites done post-pass.
 */

import type { GradeParams, HslBandKey } from "./params";
import { HSL_BANDS } from "./params";

const clamp = (v: number, lo: number, hi: number) =>
  v < lo ? lo : v > hi ? hi : v;

const BAND_CENTER: Record<HslBandKey, number> = {
  red: 0, orange: 32, yellow: 60, green: 115,
  aqua: 175, blue: 220, purple: 275, magenta: 320,
};

function hueDistance(a: number, b: number): number {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

/* ────────────────────────────────────────────
 * Core pass
 * ──────────────────────────────────────────── */

export function gradePass(
  src: Uint8ClampedArray,
  dst: Uint8ClampedArray,
  w: number,
  h: number,
  p: GradeParams,
  cube: { size: number; data: Float32Array } | null,
  seed: number,
): void {
  // 1) Base curve LUT: exposure → contrast → brightness
  const expMult = Math.pow(2, (p.exposure / 100) * 2);
  const contrastK = (p.contrast / 100) * 0.9;
  const brightOff = (p.brightness / 100) * 48;
  const lut = new Int16Array(256);
  for (let i = 0; i < 256; i++) {
    const li = i;
    let x = (li / 255) * expMult;
    x = (x - 0.5) * (1 + contrastK) + 0.5;
    x += brightOff / 255;
    lut[li] = clamp(Math.round(x * 255), 0, 255);
  }

  // 2) Temperature/tint LUTs (additive, per channel)
  const tempR = Math.round((p.temperature / 100) * 26);
  const tempB = Math.round((-p.temperature / 100) * 26);
  const tintG = Math.round((-p.tint / 100) * 18);
  const lutR = new Int16Array(256);
  const lutG = new Int16Array(256);
  const lutB = new Int16Array(256);
  for (let i = 0; i < 256; i++) {
    lutR[i] = clamp((lut[i] ?? 128) + tempR, 0, 255);
    lutG[i] = clamp((lut[i] ?? 128) + tintG, 0, 255);
    lutB[i] = clamp((lut[i] ?? 128) + tempB, 0, 255);
  }


  const satFactor = clamp(1 + p.saturation / 100, 0, 2);
  const vignK = (p.vignette / 100) * 0.85;
  const grainK = (p.filmGrain / 100) * 26;

  // HSL / 3-way activity detection
  const wb = p.hsl;
  let hslActive = false;
  for (const band of HSL_BANDS) {
    const b = wb[band];
    if (b && ((b.h ?? 0) !== 0 || (b.s ?? 0) !== 0 || (b.l ?? 0) !== 0)) {
      hslActive = true;
      break;
    }
  }
  const threeActive =
    p.liftHue !== 0 || p.liftSat !== 0 ||
    p.gammaHue !== 0 || p.gammaSat !== 0 ||
    p.gainHue !== 0 || p.gainSat !== 0;
  const useHsl = hslActive || threeActive || p.hdr > 0 || p.highlightRecovery > 0;

  // HSL band constants (secret spicy math, precomputed)
  const bandKeys = HSL_BANDS;
  const bandCenters = bandKeys.map((k) => BAND_CENTER[k]);
  const bandH = bandKeys.map((k) => ((wb[k]?.h ?? 0) / 100) * 45);
  const bandS = bandKeys.map((k) => ((wb[k]?.s ?? 0) / 100) * 0.5);
  const bandL = bandKeys.map((k) => ((wb[k]?.l ?? 0) / 100) * 0.42);
  const inv2Sig2 = 1 / (2 * 34 * 34);

  const liftH = (p.liftHue / 100) * 22;
  const gammaH = (p.gammaHue / 100) * 22;
  const gainH = (p.gainHue / 100) * 22;
  const liftS = (p.liftSat / 100) * 0.24;
  const gammaS = (p.gammaSat / 100) * 0.24;
  const gainS = (p.gainSat / 100) * 0.24;
  const hdrK = p.hdr / 100;
  const recK = p.highlightRecovery / 100;
  const vignCx = w * 0.5;
  const vignCy = h * 0.5;
  const vignMax = Math.sqrt(vignCx * vignCx + vignCy * vignCy);

  const gauss = (x: number) => Math.exp(-x * x * inv2Sig2);

  for (let idx = 0, y = 0; y < h; y++) {
    for (let x = 0; x < w; x++, idx += 4) {
      let r = lutR[src[idx] ?? 0] ?? 0;
      let g = lutG[src[idx + 1] ?? 0] ?? 0;
      let b = lutB[src[idx + 2] ?? 0] ?? 0;

      let Y = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

      if (useHsl) {
        // rgb → hsl
        const rn = r / 255, gn = g / 255, bn = b / 255;
        const max = Math.max(rn, gn, bn);
        const min = Math.min(rn, gn, bn);
        const l0 = (max + min) / 2;
        let hue = 0;
        let sat = 0;
        if (max !== min) {
          const d = max - min;
          sat = l0 > 0.5 ? d / (2 - max - min) : d / (max + min);
          if (max === rn) hue = ((gn - bn) / d + (gn < bn ? 6 : 0)) * 60;
          else if (max === gn) hue = ((bn - rn) / d + 2) * 60;
          else hue = ((rn - gn) / d + 4) * 60;
        }
        let hh = hue;
        let ss = sat * satFactor;
        let ll = l0;

        if (hslActive) {
          let accH = 0, accS = 0, accL = 0;
          for (let bi = 0; bi < 8; bi++) {
            const w8 = gauss(hueDistance(hue, bandCenters[bi] ?? 0));
            if (w8 < 0.05) continue;
            accH += (bandH[bi] ?? 0) * w8;
            accS += (bandS[bi] ?? 0) * w8;
            accL += (bandL[bi] ?? 0) * w8;
          }
          hh += accH;
          ss = clamp(ss * (1 + accS), 0, 1);
          ll = clamp(ll * (1 + accL), 0, 1);
        }
        if (threeActive) {
          const wsh = 1 - smoothstep(0, 0.55, Y);
          const whi = smoothstep(0.45, 1, Y);
          const wmid = Math.max(0, 1 - wsh - whi);
          hh += liftH * wsh + gammaH * wmid + gainH * whi;
          ss = clamp(ss * (1 + liftS * wsh + gammaS * wmid + gainS * whi), 0, 1);
        }
        if (hdrK > 0) {
          // punchy mid contrast with graceful top/bottom
          const sc = 0.5 + (ll - 0.5) * (1 + hdrK * 0.42);
          ll = clamp(sc + hdrK * 0.05 * (1 - ll), 0, 1) as number;
        }
        if (recK > 0) {
          const top = 0.8;
          if (ll > top) {
            ll = top + (ll - top) * (1 - recK * 0.5);
            ss *= 1 - recK * 0.12;
          }
        }
        // hsl → rgb
        const c = new Float32Array(3);
        hslToRgb(hh, ss, ll, c);
        r = c[0] ?? 0;
        g = c[1] ?? 0;
        b = c[2] ?? 0;
      } else {
        // Fast path: saturation only
        if (satFactor !== 1) {
          r = Y * 255 + (r - Y * 255) * satFactor;
          g = Y * 255 + (g - Y * 255) * satFactor;
          b = Y * 255 + (b - Y * 255) * satFactor;
        }
      }

      if (cube && cube.size > 0) {
        sampleCube(cube, r / 255, g / 255, b / 255, cubeOut);
        r = cubeOut[0] ?? 0; g = cubeOut[1] ?? 0; b = cubeOut[2] ?? 0;
      }

      // Vignette
      if (vignK > 0) {
        const dx = (x - vignCx) / vignMax;
        const dy = (y - vignCy) / vignMax;
        const d2 = (dx * dx + dy * dy) * 2;
        const mul = 1 - vignK * d2 * d2;
        r = r * mul; g = g * mul; b = b * mul;
      }

      // Luma grain (deterministic)
      if (grainK > 0) {
        const n =
          (Math.sin(x * 12.9898 + y * 78.233 + seed * 37.719) * 43758.5453) % 1;
        const nz = (n < 0 ? n + 1 : n) - 0.5;
        const gNoise = nz * grainK * 2;
        r = r + gNoise; g = g + gNoise; b = b + gNoise;
      }

      dst[idx] = clamp(r, 0, 255);
      dst[idx + 1] = clamp(g, 0, 255);
      dst[idx + 2] = clamp(b, 0, 255);
      dst[idx + 3] = src[idx + 3] ?? 255;
    }
  }
}

const cubeOut = new Float32Array(3);

function smoothstep(e0: number, e1: number, x: number): number {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
}

function hslToRgb(h: number, s: number, l: number, out: Float32Array): void {
  if (s <= 0) {
    const v = l * 255;
    out[0] = v; out[1] = v; out[2] = v;
    return;
  }
  const hh = (((h % 360) + 360) % 360) / 60;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((hh % 2) - 1));
  let r = 0, g = 0, b = 0;
  if (hh < 1) { r = c; g = x; }
  else if (hh < 2) { r = x; g = c; }
  else if (hh < 3) { g = c; b = x; }
  else if (hh < 4) { g = x; b = c; }
  else if (hh < 5) { r = x; b = c; }
  else { r = c; b = x; }
  const m = l - c / 2;
  out[0] = (r + m) * 255;
  out[1] = (g + m) * 255;
  out[2] = (b + m) * 255;
}

/* ────────────────────────────────────────────
 * .cube 3D LUT sampling (Pro)
 * ──────────────────────────────────────────── */

function sampleCube(
  cube: { size: number; data: Float32Array },
  rn: number,
  gn: number,
  bn: number,
  out: Float32Array,
): void {
  const n = cube.size;
  const x = clamp(rn, 0, 1) * (n - 1);
  const y = clamp(gn, 0, 1) * (n - 1);
  const z = clamp(bn, 0, 1) * (n - 1);
  const x0 = Math.floor(x), y0 = Math.floor(y), z0 = Math.floor(z);
  const x1 = Math.min(x0 + 1, n - 1), y1 = Math.min(y0 + 1, n - 1), z1 = Math.min(z0 + 1, n - 1);
  const fx = x - x0, fy = y - y0, fz = z - z0;
  const idx = (i: number, j: number, k: number) => (i + j * n + k * n * n) * 3;
  for (let ch = 0; ch < 3; ch++) {
    const c000 = cube.data[idx(x0, y0, z0) + ch] ?? 0;
    const c100 = cube.data[idx(x1, y0, z0) + ch] ?? 0;
    const c010 = cube.data[idx(x0, y1, z0) + ch] ?? 0;
    const c110 = cube.data[idx(x1, y1, z0) + ch] ?? 0;
    const c001 = cube.data[idx(x0, y0, z1) + ch] ?? 0;
    const c101 = cube.data[idx(x1, y0, z1) + ch] ?? 0;
    const c011 = cube.data[idx(x0, y1, z1) + ch] ?? 0;
    const c111 = cube.data[idx(x1, y1, z1) + ch] ?? 0;
    const c00 = c000 + (c100 - c000) * fx;
    const c10 = c010 + (c110 - c010) * fx;
    const c01 = c001 + (c101 - c001) * fx;
    const c11 = c011 + (c111 - c011) * fx;
    const c0 = c00 + (c10 - c00) * fy;
    const c1 = c01 + (c11 - c01) * fy;
    out[ch] = (c0 + (c1 - c0) * fz) * 255;
  }
}

/* ────────────────────────────────────────────
 * Glow composites (halation / bloom) — Studio+
 * ──────────────────────────────────────────── */

export function glowsThreshold(
  srcData: Uint8ClampedArray,
  dstData: Uint8ClampedArray,
  threshold: number,
  warmth: number,
): void {
  for (let i = 0; i < srcData.length; i += 4) {
    const r = srcData[i] ?? 0;
    const g = srcData[i + 1] ?? 0;
    const b = srcData[i + 2] ?? 0;
    const Y = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    if (Y > threshold) {
      const k = (Y - threshold) / (1 - threshold);
      dstData[i] = r * k * (1 + warmth) + warmth * 70 * k;
      dstData[i + 1] = g * k;
      dstData[i + 2] = b * k * (1 - warmth);
      dstData[i + 3] = 255;
    } else {
      dstData[i] = 0; dstData[i + 1] = 0; dstData[i + 2] = 0; dstData[i + 3] = 255;
    }
  }
}
