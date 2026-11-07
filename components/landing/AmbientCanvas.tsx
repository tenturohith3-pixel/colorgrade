"use client";

import { useEffect, useRef } from "react";

/**
 * AmbientCanvas — the fixed, scroll-reactive dust layer behind the story.
 *
 * Bronze & steel particles (screen-blended, ~70 desktop / ~30 mobile)
 * rising at a few pixels per frame, twinkling on individual phases. Scroll
 * velocity (Lenis when available, scrollY delta otherwise) pushes the field
 * opposite the scroll so the background FEELS the story move — at rest it
 * idles back to its slow drift.
 *
 * Budget discipline: DPR capped at 1.5, ~30 fps, no work while the tab is
 * hidden, and a no-op entirely under prefers-reduced-motion.
 */

interface Mote {
  x: number;
  y: number;
  z: number; // 0..1 — depth: smaller = slower + dimmer
  steel: boolean;
  tw: number; // twinkle phase
  sp: number; // individual speed multiplier
}

export function AmbientCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let W = 0;
    let H = 0;
    let motes: Mote[] = [];
    let vel = 0;
    let lastScroll = window.scrollY;
    let lastPaint = -1;

    const spawn = (): Mote => ({
      x: Math.random() * W,
      y: Math.random() * H,
      z: 0.2 + Math.pow(Math.random(), 1.5) * 0.8,
      steel: Math.random() > 0.62,
      tw: Math.random() * Math.PI * 2,
      sp: 0.5 + Math.random() * 1.1,
    });

    const resize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      motes = Array.from(
        { length: W < 768 ? 30 : 70 },
        spawn,
      );
      lastScroll = window.scrollY;
    };

    const getVelocity = () => {
      const lenis = (window as unknown as { __ecLenis?: { velocity: number } }).__ecLenis;
      if (lenis && typeof lenis.velocity === "number") return lenis.velocity;
      const y = window.scrollY;
      const v = y - lastScroll;
      lastScroll = y;
      return v;
    };

    const tick = (t: number) => {
      raf = requestAnimationFrame(tick);
      if (document.hidden) return;
      if (t - lastPaint < 32) return; // ~30fps cap
      lastPaint = t;

      vel += (getVelocity() - vel) * 0.14;

      ctx.clearRect(0, 0, W, H);
      for (let i = 0; i < motes.length; i++) {
        const m = motes[i]!;
        m.tw += 0.012 + 0.01 * m.sp;
        m.x += Math.sin(t * 0.00022 + m.tw * 2.9) * 0.14 * m.sp;
        m.y -= 0.05 * m.sp * (0.35 + m.z);
        // the field is pushed by scroll velocity (parallax by depth)
        m.y -= vel * m.z * 0.06;
        m.x -= vel * m.z * 0.012;
        if (m.y < -10) m.y = H + 10;
        else if (m.y > H + 10) m.y = -10;
        if (m.x < -10) m.x = W + 10;
        else if (m.x > W + 10) m.x = -10;

        const a = (0.1 + 0.28 * m.z) * (0.6 + 0.4 * Math.sin(m.tw));
        ctx.fillStyle = m.steel
          ? `rgba(168,186,228,${(a * 0.72).toFixed(3)})`
          : `rgba(214,176,124,${a.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(m.x, m.y, 0.55 + m.z * 1.7, 0, 6.2832);
        ctx.fill();
      }
    };

    resize();
    window.addEventListener("resize", resize, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="absolute inset-0 h-full w-full opacity-90"
      style={{ mixBlendMode: "screen", transition: "opacity 0.6s ease" }}
    />
  );
}
