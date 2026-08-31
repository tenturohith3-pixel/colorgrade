/**
 * ColorGrade — Client-Side Canvas Color Grading Engine
 *
 * Applies real pixel-level color transformations in the browser
 * using the Canvas 2D API.
 */

export interface GradeSettings {
  lutPreset: string;
  whiteBalance: number;
  exposure: number;
  contrast: number;
  saturation: number;
  brightness: number;
  temperature: number;
  shadowsHue: number;
  midtonesHue: number;
  highlightsHue: number;
  shadowsSat: number;
  midtonesSat: number;
  highlightsSat: number;
  hdrStrength: number;
  highlightRecovery: number;
  filmGrain: number;
  halation: number;
  bloom: number;
}

// ── Color Space Conversions ──────────────────────

export function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [h * 360, s * 100, l * 100];
}

export function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h /= 360; s /= 100; l /= 100;
  let r: number, g: number, b: number;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function clamp(v: number, min = 0, max = 255): number {
  return v < min ? min : v > max ? max : v;
}

// ── LUT Preset Color Maps ───────────────────────
// Each preset transforms (r,g,b) → (r',g',b') using
// proper cinematic color science.

const LUT_MAPS: Record<string, (r: number, g: number, b: number) => [number, number, number]> = {
  /**
   * Moody Cinematic — Teal & Orange blockbuster look
   * Shadows pushed toward teal, highlights toward warm orange
   */
  moody: (r, g, b) => {
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    const t = lum / 255; // 0=dark, 1=bright
    // Shadows → teal, Highlights → warm
    const shadowMix = 1 - t;
    const highlightMix = t;
    return [
      clamp(r * 0.9 + 15 * highlightMix + 0 * shadowMix),         // R: warm highlights
      clamp(g * 0.85 + 10 * highlightMix + 15 * shadowMix),       // G: teal in shadows
      clamp(b * 0.8 + 5 * highlightMix + 30 * shadowMix),         // B: teal in shadows
    ];
  },

  /**
   * Warm Tone — Golden hour warmth
   * Boost reds/yellows, reduce blue, add warmth to midtones
   */
  warm: (r, g, b) => {
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    const t = lum / 255;
    return [
      clamp(r * 1.08 + 12 * t),                                   // R: warm boost
      clamp(g * 1.02 + 8 * t),                                    // G: slight warm
      clamp(b * 0.82 - 5 * t + 10),                               // B: reduce blue
    ];
  },

  /**
   * Clean Minimal — Desaturated, high contrast, clean
   * Pull saturation down, boost contrast, lift blacks slightly
   */
  clean: (r, g, b) => {
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    // Desaturate toward luminance
    const mix = 0.35; // 35% desaturation
    const nr = r + (lum - r) * mix;
    const ng = g + (lum - g) * mix;
    const nb = b + (lum - b) * mix;
    // Boost contrast slightly
    const cr = ((nr / 255 - 0.5) * 1.15 + 0.5) * 255;
    const cg = ((ng / 255 - 0.5) * 1.15 + 0.5) * 255;
    const cb = ((nb / 255 - 0.5) * 1.15 + 0.5) * 255;
    // Lift blacks slightly for editorial feel
    return [
      clamp(cr * 0.95 + 12),
      clamp(cg * 0.95 + 12),
      clamp(cb * 0.95 + 14),
    ];
  },

  /**
   * Vintage Film — Warm highlights, faded blacks, green tint in shadows
   * Emulates expired film stock
   */
  vintage: (r, g, b) => {
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    const t = lum / 255;
    // Lift blacks (faded film look)
    const lifted = 18;
    // Warm highlights, green shadows
    return [
      clamp(r * 0.92 + 20 * t + lifted * (1 - t)),                // R: warm highlights
      clamp(g * 0.88 + 5 * t + lifted * (1 - t) + 8 * (1 - t)),  // G: green in shadows
      clamp(b * 0.7 + 8 * t + lifted * (1 - t) - 10 * t),        // B: reduce blue in highlights
    ];
  },

  /**
   * Cool Blue — Cinematic blue tones
   * Blue-shifted shadows, neutral-to-cool highlights
   */
  cool: (r, g, b) => {
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    const t = lum / 255;
    return [
      clamp(r * 0.88 - 8 * (1 - t)),                              // R: reduce in shadows
      clamp(g * 0.92 + 5 * t),                                     // G: slight boost
      clamp(b * 1.1 + 15 * (1 - t) + 8 * t),                     // B: strong in shadows, mild in highlights
    ];
  },

  /**
   * Neon Pop — High saturation, vibrant, punchy
   * Boost all channels, increase contrast
   */
  neon: (r, g, b) => {
    // Increase contrast
    const cr = ((r / 255 - 0.5) * 1.3 + 0.5) * 255;
    const cg = ((g / 255 - 0.5) * 1.3 + 0.5) * 255;
    const cb = ((b / 255 - 0.5) * 1.3 + 0.5) * 255;
    // Boost saturation by pushing away from gray
    const lum = 0.299 * cr + 0.587 * cg + 0.114 * cb;
    const satBoost = 1.25;
    return [
      clamp(lum + (cr - lum) * satBoost),
      clamp(lum + (cg - lum) * satBoost),
      clamp(lum + (cb - lum) * satBoost),
    ];
  },

  /**
   * Muted Pastel — Soft, low contrast, lifted blacks
   * Pastel color palette with dreamy feel
   */
  pastel: (r, g, b) => {
    // Desaturate significantly
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    const mix = 0.5; // 50% desaturation
    const dr = r + (lum - r) * mix;
    const dg = g + (lum - g) * mix;
    const db = b + (lum - b) * mix;
    // Reduce contrast (flatten)
    const flatR = dr * 0.7 + 65;
    const flatG = dg * 0.7 + 65;
    const flatB = db * 0.7 + 65;
    // Add slight warm tint
    return [
      clamp(flatR + 5),
      clamp(flatG),
      clamp(flatB - 3),
    ];
  },
};

// ── Auto Color Correction ─────────────────────

/**
 * Analyze an image's pixel data and return optimal GradeSettings.
 * Subtle corrections only — most photos need minimal adjustment.
 * Fully client-side — no API calls, no credits, runs instantly.
 */
export function autoColorCorrect(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): GradeSettings {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const pixelCount = data.length / 4;

  // Accumulate channel stats
  let rSum = 0, gSum = 0, bSum = 0;
  let rHistogram = new Array(256).fill(0);
  let gHistogram = new Array(256).fill(0);
  let bHistogram = new Array(256).fill(0);
  let lumHistogram = new Array(256).fill(0);
  let darkPixels = 0;
  let brightPixels = 0;

  // For saturation analysis
  let chromaSum = 0;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    rSum += r; gSum += g; bSum += b;
    rHistogram[r]++; gHistogram[g]++; bHistogram[b]++;
    const lum = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    lumHistogram[lum]++;
    if (lum < 30) darkPixels++;
    if (lum > 225) brightPixels++;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    chromaSum += max > 0 ? (max - min) / max : 0;
  }

  const rAvg = rSum / pixelCount;
  const gAvg = gSum / pixelCount;
  const bAvg = bSum / pixelCount;
  const lumAvg = 0.299 * rAvg + 0.587 * gAvg + 0.114 * bAvg;
  const avgChroma = chromaSum / pixelCount;

  // ── White Balance (subtle) ──
  // Gray world: in a balanced image R≈G≈B
  // Only correct if there's a clear cast (>10 units off)
  const grayDiff = rAvg - bAvg;
  const whiteBalance = Math.abs(grayDiff) > 10
    ? Math.round(Math.max(-12, Math.min(12, grayDiff * 0.12)))
    : 0;

  // ── Temperature (subtle) ──
  const tempDiff = bAvg - rAvg;
  const temperature = Math.abs(tempDiff) > 15
    ? Math.round(Math.max(-10, Math.min(10, tempDiff * 0.08)))
    : 0;

  // ── Exposure (subtle) ──
  // Target luminance around 120 (slightly below mid-gray for cinematic feel)
  const exposureTarget = 120;
  const exposureDiff = exposureTarget - lumAvg;
  const exposure = Math.abs(exposureDiff) > 15
    ? Math.round(Math.max(-10, Math.min(10, exposureDiff * 0.08)))
    : 0;

  // ── Contrast (subtle) ──
  // Measure histogram spread
  let lowestBin = 255, highestBin = 0;
  for (let i = 0; i < 256; i++) {
    if (lumHistogram[i] > pixelCount * 0.001) {
      lowestBin = Math.min(lowestBin, i);
      highestBin = Math.max(highestBin, i);
    }
  }
  const spread = highestBin - lowestBin;
  const contrast = spread < 160
    ? Math.round(Math.min(12, (160 - spread) * 0.1))
    : spread > 240
    ? Math.round(Math.max(-8, (240 - spread) * 0.08))
    : 0;

  // ── Saturation (subtle) ──
  // Most photos are fine — only boost if clearly desaturated
  const saturation = avgChroma < 0.2
    ? Math.round(Math.min(10, (0.2 - avgChroma) * 50))
    : avgChroma > 0.5
    ? Math.round(Math.max(-5, (0.5 - avgChroma) * 10))
    : 0;

  // ── Brightness (very subtle) ──
  const brightness = Math.abs(lumAvg - 128) > 20
    ? Math.round(Math.max(-5, Math.min(5, (128 - lumAvg) * 0.04)))
    : 0;

  // ── HDR (conservative) ──
  const highlightClip = brightPixels / pixelCount;
  const shadowCrush = darkPixels / pixelCount;
  const hdrStrength = (highlightClip > 0.03 || shadowCrush > 0.2)
    ? Math.round(Math.min(12, (highlightClip + shadowCrush) * 60))
    : 0;

  return {
    lutPreset: "none",
    whiteBalance,
    exposure,
    contrast,
    saturation,
    brightness,
    temperature,
    shadowsHue: 0,
    midtonesHue: 0,
    highlightsHue: 0,
    shadowsSat: 100,
    midtonesSat: 100,
    highlightsSat: 100,
    hdrStrength,
    highlightRecovery: 0,
    filmGrain: 0,
    halation: 0,
    bloom: 0,
  };
}

// ── Main Grading Function ───────────────────────

export function applyColorGrading(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  settings: GradeSettings
): void {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  // Pre-compute LUT
  const lutFn = LUT_MAPS[settings.lutPreset] || null;

  const wbShift = settings.whiteBalance * 0.6;
  const tempShift = settings.temperature * 0.5;
  const expMul = Math.pow(2, settings.exposure / 120);
  const contrastVal = (100 + settings.contrast * 0.4) / 100;
  const satVal = (100 + settings.saturation * 0.4) / 100;
  const brightShift = settings.brightness * 0.4;

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // 1. LUT Preset
    if (lutFn) {
      [r, g, b] = lutFn(r, g, b);
    }

    // 2. White Balance & Temperature
    r += wbShift + tempShift;
    g += wbShift * 0.2;
    b += wbShift * 0.4 - tempShift;

    // 3. Exposure
    r *= expMul;
    g *= expMul;
    b *= expMul;

    // 4. Contrast
    r = ((r / 255 - 0.5) * contrastVal + 0.5) * 255;
    g = ((g / 255 - 0.5) * contrastVal + 0.5) * 255;
    b = ((b / 255 - 0.5) * contrastVal + 0.5) * 255;

    // 5. Brightness
    r += brightShift;
    g += brightShift;
    b += brightShift;

    // 6. Saturation (via HSL)
    const [h, s, l] = rgbToHsl(
      Math.max(0, Math.min(255, r)),
      Math.max(0, Math.min(255, g)),
      Math.max(0, Math.min(255, b))
    );
    const newS = Math.max(0, Math.min(100, s * satVal));

    // 7. Tone-based hue shift (3-way simulation)
    let hueShift = 0;
    if (l < 33) hueShift = settings.shadowsHue * 0.25;
    else if (l < 66) hueShift = settings.midtonesHue * 0.25;
    else hueShift = settings.highlightsHue * 0.25;

    const newH = ((h + hueShift) % 360 + 360) % 360;
    [r, g, b] = hslToRgb(newH, newS, l);

    // 8. HDR / Highlight Recovery
    if (settings.hdrStrength > 0) {
      const lum = (r + g + b) / 3;
      if (lum > 210) {
        const recover = (lum - 210) / 45 * (settings.hdrStrength / 100);
        r -= recover * 25;
        g -= recover * 25;
        b -= recover * 25;
      }
      if (lum < 40) {
        const boost = (40 - lum) / 40 * (settings.hdrStrength / 100) * 12;
        r += boost; g += boost; b += boost;
      }
    }

    // Clamp
    data[i]     = Math.max(0, Math.min(255, Math.round(r)));
    data[i + 1] = Math.max(0, Math.min(255, Math.round(g)));
    data[i + 2] = Math.max(0, Math.min(255, Math.round(b)));
  }

  ctx.putImageData(imageData, 0, 0);

  // 9. Film Grain (post-process overlay)
  if (settings.filmGrain > 0) {
    applyFilmGrain(ctx, width, height, settings.filmGrain / 100);
  }

  // 10. Halation (glow bleed)
  if (settings.halation > 0) {
    applyHalation(ctx, width, height, settings.halation / 100);
  }

  // 11. Bloom (soft glow)
  if (settings.bloom > 0) {
    applyBloom(ctx, width, height, settings.bloom / 100);
  }
}

// ── Film Grain ──────────────────────────────────

function applyFilmGrain(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  intensity: number
): void {
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * intensity * 50;
    data[i]     = Math.max(0, Math.min(255, data[i] + noise));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
  }
  ctx.putImageData(imageData, 0, 0);
}

// ── Halation (warm light bleed) ─────────────────

function applyHalation(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  intensity: number
): void {
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.globalAlpha = intensity * 0.2;
  ctx.filter = `blur(${Math.round(intensity * 18)}px)`;

  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = w;
  tempCanvas.height = h;
  const tempCtx = tempCanvas.getContext("2d")!;
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;
  const tempData = tempCtx.createImageData(w, h);

  for (let i = 0; i < data.length; i += 4) {
    const lum = (data[i] + data[i + 1] + data[i + 2]) / 3;
    if (lum > 190) {
      tempData.data[i]     = data[i] * 1.08;
      tempData.data[i + 1] = data[i + 1] * 0.72;
      tempData.data[i + 2] = data[i + 2] * 0.55;
      tempData.data[i + 3] = (lum - 190) / 65 * 180;
    }
  }

  tempCtx.putImageData(tempData, 0, 0);
  ctx.drawImage(tempCanvas, 0, 0);
  ctx.restore();
}

// ── Bloom (soft glow) ───────────────────────────

function applyBloom(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  intensity: number
): void {
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.globalAlpha = intensity * 0.18;
  ctx.filter = `blur(${Math.round(intensity * 25)}px) brightness(1.4)`;
  ctx.drawImage(ctx.canvas, 0, 0);
  ctx.restore();
}
