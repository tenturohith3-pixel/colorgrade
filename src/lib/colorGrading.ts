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

// ── LUT Preset Color Maps ───────────────────────

const LUT_MAPS: Record<string, (r: number, g: number, b: number) => [number, number, number]> = {
  moody: (r, g, b) => [
    Math.min(255, r * 0.6 + b * 0.2 + 20),
    Math.min(255, g * 0.7 + 30),
    Math.min(255, b * 0.9 + 40),
  ],
  warm: (r, g, b) => [
    Math.min(255, r * 1.15 + 20),
    Math.min(255, g * 1.05 + 15),
    Math.min(255, b * 0.75),
  ],
  clean: (r, g, b) => {
    const avg = (r + g + b) / 3;
    return [
      Math.min(255, avg * 0.95 + 20),
      Math.min(255, avg * 0.97 + 15),
      Math.min(255, avg * 1.0 + 10),
    ];
  },
  vintage: (r, g, b) => [
    Math.min(255, r * 0.9 + 40),
    Math.min(255, g * 0.85 + 30),
    Math.min(255, b * 0.6 + 20),
  ],
  cool: (r, g, b) => [
    Math.min(255, r * 0.7),
    Math.min(255, g * 0.85 + 10),
    Math.min(255, b * 1.2 + 30),
  ],
  neon: (r, g, b) => [
    Math.min(255, r * 1.4),
    Math.min(255, g * 1.3),
    Math.min(255, b * 1.5),
  ],
  pastel: (r, g, b) => [
    Math.min(255, r * 0.7 + 80),
    Math.min(255, g * 0.7 + 80),
    Math.min(255, b * 0.7 + 80),
  ],
};

// ── Auto Color Correction ─────────────────────

/**
 * Analyze an image's pixel data and return optimal GradeSettings.
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
  let rMin = 255, gMin = 255, bMin = 255;
  let rMax = 0, gMax = 0, bMax = 0;
  let rHistogram = new Array(256).fill(0);
  let gHistogram = new Array(256).fill(0);
  let bHistogram = new Array(256).fill(0);
  let lumHistogram = new Array(256).fill(0);
  let darkPixels = 0;
  let brightPixels = 0;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    rSum += r; gSum += g; bSum += b;
    rMin = Math.min(rMin, r); gMin = Math.min(gMin, g); bMin = Math.min(bMin, b);
    rMax = Math.max(rMax, r); gMax = Math.max(gMax, g); bMax = Math.max(bMax, b);
    rHistogram[r]++; gHistogram[g]++; bHistogram[b]++;
    const lum = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    lumHistogram[lum]++;
    if (lum < 50) darkPixels++;
    if (lum > 205) brightPixels++;
  }

  const rAvg = rSum / pixelCount;
  const gAvg = gSum / pixelCount;
  const bAvg = bSum / pixelCount;
  const lumAvg = 0.299 * rAvg + 0.587 * gAvg + 0.114 * bAvg;

  // --- White Balance ---
  // Gray world assumption: in a well-balanced image, R≈G≈B averages
  const grayDiff = (rAvg - bAvg);
  const whiteBalance = Math.round(Math.max(-50, Math.min(50, grayDiff * 0.4)));

  // --- Temperature ---
  // Slight warm shift if image is cool, vice versa
  const tempShift = Math.round(Math.max(-30, Math.min(30, (bAvg - rAvg) * 0.2)));

  // --- Exposure ---
  // Target luminance around 128 (mid-gray)
  const exposureTarget = 128;
  const exposureDiff = exposureTarget - lumAvg;
  const exposure = Math.round(Math.max(-40, Math.min(40, exposureDiff * 0.3)));

  // --- Contrast ---
  // Measure histogram spread — low spread = low contrast
  let lowestBin = 255, highestBin = 0;
  for (let i = 0; i < 256; i++) {
    if (lumHistogram[i] > pixelCount * 0.001) {
      lowestBin = Math.min(lowestBin, i);
      highestBin = Math.max(highestBin, i);
    }
  }
  const spread = highestBin - lowestBin;
  const contrast = spread < 180
    ? Math.round(Math.min(30, (180 - spread) * 0.25))
    : spread > 230
    ? Math.round(Math.max(-20, (230 - spread) * 0.15))
    : 0;

  // --- Saturation ---
  // Measure color variance — low variance = desaturated
  let chromaSum = 0;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    chromaSum += max > 0 ? (max - min) / max : 0;
  }
  const avgChroma = chromaSum / pixelCount;
  const saturation = avgChroma < 0.3
    ? Math.round(Math.min(25, (0.3 - avgChroma) * 80))
    : 0;

  // --- Brightness ---
  // Nudge if overall too dark or too bright
  const brightness = Math.round(Math.max(-15, Math.min(15, (128 - lumAvg) * 0.12)));

  // --- HDR ---
  // Boost if highlights are clipped or shadows are crushed
  const highlightClip = brightPixels / pixelCount;
  const shadowCrush = darkPixels / pixelCount;
  const hdrStrength = (highlightClip > 0.02 || shadowCrush > 0.15)
    ? Math.round(Math.min(20, (highlightClip + shadowCrush) * 100))
    : 0;

  return {
    lutPreset: "none",
    whiteBalance,
    exposure,
    contrast,
    saturation,
    brightness,
    temperature: tempShift,
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

  const wbShift = settings.whiteBalance * 0.8;
  const tempShift = settings.temperature * 0.6;
  const expMul = Math.pow(2, settings.exposure / 100);
  const contrastVal = (100 + settings.contrast * 0.5) / 100;
  const satVal = (100 + settings.saturation * 0.5) / 100;
  const brightShift = settings.brightness * 0.5;

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
    g += wbShift * 0.3;
    b += wbShift * 0.5 - tempShift;

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
    if (l < 33) hueShift = settings.shadowsHue * 0.3;
    else if (l < 66) hueShift = settings.midtonesHue * 0.3;
    else hueShift = settings.highlightsHue * 0.3;

    const newH = ((h + hueShift) % 360 + 360) % 360;
    [r, g, b] = hslToRgb(newH, newS, l);

    // 8. HDR / Highlight Recovery
    if (settings.hdrStrength > 0) {
      const lum = (r + g + b) / 3;
      if (lum > 200) {
        const recover = (lum - 200) / 55 * (settings.hdrStrength / 100);
        r -= recover * 30;
        g -= recover * 30;
        b -= recover * 30;
      }
      // Boost shadows slightly
      if (lum < 50) {
        const boost = (50 - lum) / 50 * (settings.hdrStrength / 100) * 15;
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
    const noise = (Math.random() - 0.5) * intensity * 60;
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
  ctx.globalAlpha = intensity * 0.25;
  ctx.filter = `blur(${Math.round(intensity * 20)}px)`;

  // Extract bright areas with warm tint
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = w;
  tempCanvas.height = h;
  const tempCtx = tempCanvas.getContext("2d")!;
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;
  const tempData = tempCtx.createImageData(w, h);

  for (let i = 0; i < data.length; i += 4) {
    const lum = (data[i] + data[i + 1] + data[i + 2]) / 3;
    if (lum > 180) {
      tempData.data[i]     = data[i] * 1.1;
      tempData.data[i + 1] = data[i + 1] * 0.7;
      tempData.data[i + 2] = data[i + 2] * 0.5;
      tempData.data[i + 3] = (lum - 180) / 75 * 200;
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
  ctx.globalAlpha = intensity * 0.2;
  ctx.filter = `blur(${Math.round(intensity * 30)}px) brightness(1.5)`;
  ctx.drawImage(ctx.canvas, 0, 0);
  ctx.restore();
}
