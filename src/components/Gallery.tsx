"use client";

import { useState, useRef, useCallback } from "react";

interface BeforeAfterCardProps {
  title: string;
  preset: string;
  beforeImage: string;
  afterImage: string;
  size?: "large" | "normal";
}

function BeforeAfterCard({ title, preset, beforeImage, afterImage, size = "normal" }: BeforeAfterCardProps) {
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
      <div className="absolute inset-0">
        <img
          src={beforeImage}
          alt={`${title} - Before`}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[9px] text-white/30 tracking-[0.2em] uppercase bg-black/30 px-3 py-1.5 backdrop-blur-sm">
            Original
          </span>
        </div>
      </div>

      {/* After (clipped) */}
      <div
        className="absolute inset-0"
        style={{
          clipPath: `inset(0 ${100 - position}% 0 0)`,
        }}
      >
        <img
          src={afterImage}
          alt={`${title} - ${preset}`}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[9px] text-white/40 tracking-[0.2em] uppercase bg-black/30 px-3 py-1.5 backdrop-blur-sm">
            {preset}
          </span>
        </div>
      </div>

      {/* Thicker divider line */}
      <div
        className="absolute top-0 bottom-0 w-[3px] bg-[var(--accent-bronze)] z-10 shadow-[0_0_12px_rgba(196,149,106,0.4)]"
        style={{ left: `${position}%`, transform: "translateX(-50%)" }}
      >
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[var(--accent-bronze)]/90 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center shadow-lg">
          <div className="flex gap-1">
            <div className="w-0.5 h-3 rounded-full bg-white/80" />
            <div className="w-0.5 h-3 rounded-full bg-white/80" />
          </div>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute bottom-4 left-4 z-10">
        <span className="text-[9px] text-white/50 tracking-[0.15em] uppercase bg-black/40 px-2 py-1 backdrop-blur-sm">
          Before
        </span>
      </div>
      <div className="absolute bottom-4 right-4 z-10">
        <span className="text-[9px] text-white/50 tracking-[0.15em] uppercase bg-black/40 px-2 py-1 backdrop-blur-sm">
          {preset}
        </span>
      </div>

      {/* Thick frame border */}
      <div className="absolute inset-0 border-[3px] border-[var(--bg-deep)] pointer-events-none" />
    </div>
  );
}

const galleryItems = [
  {
    title: "Moody Teal & Orange",
    preset: "Moody Cinematic",
    beforeImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    afterImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    size: "large" as const,
    // CSS filter applied via overlay for "after" effect
  },
  {
    title: "Warm Golden Hour",
    preset: "Warm Tone",
    beforeImage: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&q=80",
    afterImage: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&q=80",
    size: "normal" as const,
  },
  {
    title: "Clean Desaturated",
    preset: "Clean Minimal",
    beforeImage: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600&q=80",
    afterImage: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600&q=80",
    size: "normal" as const,
  },
  {
    title: "Vintage Film",
    preset: "Film Emulation",
    beforeImage: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&q=80",
    afterImage: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&q=80",
    size: "large" as const,
  },
  {
    title: "Muted Pastel",
    preset: "Soft Pastel",
    beforeImage: "https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=600&q=80",
    afterImage: "https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=600&q=80",
    size: "normal" as const,
  },
  {
    title: "Slate Noir",
    preset: "Noir Grade",
    beforeImage: "https://images.unsplash.com/photo-1518173946687-a16d22856aa4?w=600&q=80",
    afterImage: "https://images.unsplash.com/photo-1518173946687-a16d22856aa4?w=600&q=80",
    size: "normal" as const,
  },
];

// Color overlays for each preset to simulate grading
const presetOverlays: Record<string, string> = {
  "Moody Cinematic": "linear-gradient(135deg, rgba(26,74,90,0.4) 0%, rgba(212,132,90,0.3) 50%, rgba(13,48,64,0.4) 100%)",
  "Warm Tone": "linear-gradient(135deg, rgba(212,165,74,0.35) 0%, rgba(232,192,112,0.25) 50%, rgba(192,128,48,0.35) 100%)",
  "Clean Minimal": "linear-gradient(135deg, rgba(220,220,220,0.3) 0%, rgba(200,200,200,0.2) 50%, rgba(190,190,190,0.3) 100%)",
  "Film Emulation": "linear-gradient(135deg, rgba(200,168,112,0.35) 0%, rgba(224,200,152,0.25) 50%, rgba(160,128,80,0.35) 100%)",
  "Soft Pastel": "linear-gradient(135deg, rgba(200,160,184,0.3) 0%, rgba(160,200,208,0.25) 50%, rgba(184,200,160,0.3) 100%)",
  "Noir Grade": "linear-gradient(135deg, rgba(74,90,106,0.4) 0%, rgba(106,122,138,0.3) 50%, rgba(58,74,90,0.4) 100%)",
};

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {galleryItems.map((item, i) => (
            <div
              key={item.title}
              className={`reveal reveal-delay-${(i % 4) + 1}`}
            >
              {/* Card with thick border frame */}
              <div className="bg-[var(--bg-card)] border border-[var(--border-medium)] p-1.5">
                <BeforeAfterCard
                  {...item}
                  afterImage={item.afterImage}
                />
                {/* Color overlay for the "after" side to simulate grading */}
                <div
                  className="absolute inset-0 pointer-events-none z-[5] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: presetOverlays[item.preset] || "none" }}
                />
              </div>
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
