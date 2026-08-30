"use client";

import { useState, useRef, useCallback } from "react";

interface BeforeAfterCardProps {
  title: string;
  preset: string;
  beforeColor: string;
  afterColor: string;
  size?: "large" | "normal";
}

function BeforeAfterCard({ title, preset, beforeColor, afterColor, size = "normal" }: BeforeAfterCardProps) {
  const [position, setPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setPosition(pct);
  }, []);

  const handleStart = (clientX: number) => {
    isDragging.current = true;
    updatePosition(clientX);
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden cursor-col-resize group ${
        size === "large" ? "aspect-[16/10]" : "aspect-[3/4]"
      }`}
      onMouseDown={(e) => handleStart(e.clientX)}
      onMouseMove={(e) => isDragging.current && updatePosition(e.clientX)}
      onMouseUp={() => (isDragging.current = false)}
      onMouseLeave={() => (isDragging.current = false)}
      onTouchStart={(e) => handleStart(e.touches[0].clientX)}
      onTouchMove={(e) => updatePosition(e.touches[0].clientX)}
      onTouchEnd={() => (isDragging.current = false)}
    >
      {/* Before (full width) */}
      <div className="absolute inset-0" style={{ background: beforeColor }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[9px] text-white/20 tracking-[0.2em] uppercase">Original</span>
        </div>
      </div>

      {/* After (clipped) */}
      <div
        className="absolute inset-0"
        style={{
          background: afterColor,
          clipPath: `inset(0 ${100 - position}% 0 0)`,
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[9px] text-white/30 tracking-[0.2em] uppercase">{preset}</span>
        </div>
      </div>

      {/* Divider line */}
      <div
        className="absolute top-0 bottom-0 w-px bg-[var(--text-primary)]/30 z-10"
        style={{ left: `${position}%`, transform: "translateX(-50%)" }}
      >
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full border border-[var(--text-primary)]/30 flex items-center justify-center backdrop-blur-sm">
          <div className="flex gap-px">
            <div className="w-px h-2.5 bg-[var(--text-primary)]/50" />
            <div className="w-px h-2.5 bg-[var(--text-primary)]/50" />
          </div>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute bottom-4 left-4 z-10">
        <span className="text-[9px] text-[var(--text-muted)] tracking-[0.15em] uppercase">Before</span>
      </div>
      <div className="absolute bottom-4 right-4 z-10">
        <span className="text-[9px] text-[var(--text-muted)] tracking-[0.15em] uppercase">{preset}</span>
      </div>

      {/* Frame border */}
      <div className="absolute inset-0 border border-[var(--border-subtle)] pointer-events-none" />
    </div>
  );
}

const galleryItems = [
  {
    title: "Moody Teal & Orange",
    preset: "Moody Cinematic",
    beforeColor: "linear-gradient(135deg, #3a3a3a 0%, #555 50%, #2a2a2a 100%)",
    afterColor: "linear-gradient(135deg, #1a4a5a 0%, #d4845a 50%, #0d3040 100%)",
    size: "large" as const,
  },
  {
    title: "Warm Golden Hour",
    preset: "Warm Tone",
    beforeColor: "linear-gradient(135deg, #444 0%, #666 50%, #333 100%)",
    afterColor: "linear-gradient(135deg, #d4a54a 0%, #e8c070 50%, #c08030 100%)",
    size: "normal" as const,
  },
  {
    title: "Clean Desaturated",
    preset: "Clean Minimal",
    beforeColor: "linear-gradient(135deg, #3e3e3e 0%, #606060 50%, #2e2e2e 100%)",
    afterColor: "linear-gradient(135deg, #e8e8e8 0%, #d0d0d0 50%, #c8c8c8 100%)",
    size: "normal" as const,
  },
  {
    title: "Vintage Film",
    preset: "Film Emulation",
    beforeColor: "linear-gradient(135deg, #353535 0%, #505050 50%, #252525 100%)",
    afterColor: "linear-gradient(135deg, #c8a870 0%, #e0c898 50%, #a08050 100%)",
    size: "large" as const,
  },
  {
    title: "Muted Pastel",
    preset: "Soft Pastel",
    beforeColor: "linear-gradient(135deg, #484848 0%, #686868 50%, #383838 100%)",
    afterColor: "linear-gradient(135deg, #c8a0b8 0%, #a0c8d0 50%, #b8c8a0 100%)",
    size: "normal" as const,
  },
  {
    title: "Slate Noir",
    preset: "Noir Grade",
    beforeColor: "linear-gradient(135deg, #3a3a3a 0%, #5a5a5a 50%, #2a2a2a 100%)",
    afterColor: "linear-gradient(135deg, #4a5a6a 0%, #6a7a8a 50%, #3a4a5a 100%)",
    size: "normal" as const,
  },
];

export default function Gallery() {
  return (
    <section id="gallery" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-[1400px] px-8 md:px-12 relative">
        {/* Section header — editorial */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-20">
          <div className="lg:col-span-1">
            <span className="section-number">03</span>
          </div>
          <div className="lg:col-span-5">
            <h2
              className="text-[clamp(2rem,4vw,3.5rem)] editorial-heading text-[var(--text-primary)] leading-[1.05]"
            >
              See the{" "}
              <span className="text-[var(--accent-bronze)] italic">Transformation</span>
            </h2>
          </div>
          <div className="lg:col-span-4 lg:col-start-8 flex items-end">
            <p className="editorial-body text-[var(--text-secondary)]">
              Drag the slider to compare original footage with our cinematic color grades.
            </p>
          </div>
        </div>

        {/* Decorative rule */}
        <div className="h-px bg-[var(--border-subtle)] mb-16" />

        {/* Gallery — asymmetric editorial grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[var(--border-subtle)]">
          {galleryItems.map((item, i) => (
            <div
              key={item.title}
              className={`bg-[var(--bg-card)] p-4 md:p-5 reveal reveal-delay-${(i % 4) + 1}`}
            >
              <BeforeAfterCard {...item} />
              <div className="flex items-center justify-between mt-4 px-1">
                <div>
                  <h4
                    className="text-sm text-[var(--text-primary)] mb-0.5"
                    style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                  >
                    {item.title}
                  </h4>
                  <p className="text-[10px] text-[var(--text-muted)] tracking-[0.1em] uppercase">
                    {item.preset}
                  </p>
                </div>
                <span className="section-number">{`0${i + 1}`}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
