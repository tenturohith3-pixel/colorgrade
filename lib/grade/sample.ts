/**
 * EffectCraft Studio — deterministic synthetic sample frame.
 * Painted once per session on demand; acts as the default grade source so the
 * editor works instantly, offline, with zero asset downloads.
 */

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function ridgeLine(
  x: number,
  base: number,
  amp: number,
  freq: number,
  phase: number,
  rough: number,
  rng: () => number,
): number {
  let y = Math.sin(x * freq + phase) * amp * 0.55;
  y += Math.sin(x * freq * 2.17 + phase * 1.7) * amp * 0.28;
  y += Math.sin(x * freq * 4.31 + phase * 2.3) * amp * 0.12;
  const jit = (rng() - 0.5) * rough * 0.001;
  return base + y + jit;
}

export function paintSampleFrame(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
): void {
  const rng = mulberry32(7042);
  const horizon = h * 0.62;

  // Sky — dusk gradient
  const sky = ctx.createLinearGradient(0, 0, 0, horizon);
  sky.addColorStop(0, "#101c38");
  sky.addColorStop(0.42, "#27355c");
  sky.addColorStop(0.68, "#8f5d63");
  sky.addColorStop(0.88, "#e0936a");
  sky.addColorStop(1, "#f4c68e");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, horizon);

  // Stars (upper sky)
  ctx.save();
  for (let i = 0; i < 60; i++) {
    const sx = rng() * w;
    const sy = rng() * horizon * 0.45;
    const a = (rng() * 0.5 + 0.15) * (1 - sy / (horizon * 0.5));
    ctx.globalAlpha = Math.max(0, a);
    ctx.fillStyle = "#dfe8ff";
    ctx.fillRect(sx, sy, 1.6, 1.6);
  }
  ctx.restore();

  // Sun
  const sunX = w * 0.66;
  const sunY = horizon - h * 0.075;
  const glow = ctx.createRadialGradient(sunX, sunY, 4, sunX, sunY, h * 0.34);
  glow.addColorStop(0, "rgba(255, 214, 150, 0.95)");
  glow.addColorStop(0.12, "rgba(255, 190, 120, 0.72)");
  glow.addColorStop(0.4, "rgba(233, 140, 90, 0.30)");
  glow.addColorStop(1, "rgba(150, 90, 90, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, horizon + 2);
  ctx.beginPath();
  ctx.arc(sunX, sunY, 26, 0, Math.PI * 2);
  ctx.fillStyle = "#ffdf9d";
  ctx.fill();

  // Cloud bands
  ctx.save();
  for (let i = 0; i < 7; i++) {
    const cy = horizon * (0.2 + rng() * 0.55);
    const cx = rng() * w;
    const len = w * (0.12 + rng() * 0.22);
    ctx.globalAlpha = 0.13 + rng() * 0.12;
    ctx.fillStyle = i % 2 ? "#1c2340" : "#f0b98a";
    ctx.beginPath();
    ctx.ellipse(cx, cy, len, 5 + rng() * 9, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Ridge layers
  const layers = 5;
  for (let L = 0; L < layers; L++) {
    const depth = L / (layers - 1);
    const amp = h * (0.05 + depth * 0.055);
    const base = horizon + h * (0.005 + (depth - 0.4) * 0.02) - h * 0.005;
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 6) {
      const y = ridgeLine(x, base, amp, 0.004 + L * 0.0022, L * 2.6, 10, rng);
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    const t = 0.16 + depth * 0.5;
    const shade = ctx.createLinearGradient(0, base - amp, 0, horizon);
    const c0 = mixRgb([42, 52, 92], [16, 14, 26], t);
    const c1 = mixRgb([24, 24, 44], [8, 8, 16], t);
    shade.addColorStop(0, rgb(c0));
    shade.addColorStop(1, rgb(c1));
    ctx.fillStyle = shade;
    ctx.fill();
  }

  // Water mirror
  const water = ctx.createLinearGradient(0, horizon, 0, h);
  water.addColorStop(0, "#2a2438");
  water.addColorStop(0.35, "#1a1826");
  water.addColorStop(1, "#0b0a12");
  ctx.fillStyle = water;
  ctx.fillRect(0, horizon, w, h - horizon);

  // Reflection shimmer
  ctx.save();
  ctx.globalAlpha = 0.32;
  for (let i = 0; i < 90; i++) {
    const ry = horizon + rng() * (h - horizon) * 0.96;
    const rx = sunX + (rng() - 0.5) * w * 0.34;
    const rw = 3 + rng() * 90 * (0.2 + (ry - horizon) / (h - horizon));
    ctx.fillStyle = rng() > 0.5 ? "#e8a878" : "#c07858";
    ctx.fillRect(rx - rw / 2, ry, rw, 1 + rng() * 2.2);
  }
  ctx.restore();

  // Foreground silhouette grass line
  ctx.save();
  ctx.fillStyle = "#050509";
  ctx.beginPath();
  ctx.moveTo(0, h);
  for (let x = 0; x <= w; x += 4) {
    const y = ridgeLine(x, h - h * 0.028, h * 0.016, 0.02, 9.4, 6, rng);
    ctx.lineTo(x, y);
  }
  ctx.lineTo(w, h);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function mixRgb(
  a: [number, number, number],
  b: [number, number, number],
  t: number,
): [number, number, number] {
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  ];
}

function rgb(c: [number, number, number]): string {
  return `rgb(${Math.round(c[0])}, ${Math.round(c[1])}, ${Math.round(c[2])})`;
}
