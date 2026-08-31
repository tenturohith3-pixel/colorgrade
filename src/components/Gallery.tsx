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
      style={{ borderRadius: "var(--radius-sm)" }}
      onMouseDown={(e) => handleStart(e.clientX)}
      onMouseMove={(e) => isDragging.current && updatePosition(e.clientX)}
      onMouseUp={() => (isDragging.current = false)}
      onMouseLeave={() => (isDragging.current = false)}
      onTouchStart={(e) => handleStart(e.touches[0].clientX)}
      onTouchMove={(e) => updatePosition(e.touches[0].clientX)}
      onTouchEnd={() => (isDragging.current = false)}
      role="slider"
      aria-label={`Comparison slider for ${title}`}
      aria-valuenow={Math.round(position)}
      aria-valuemin={0}
      aria-valuemax={100}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") setPosition(Math.max(0, position - 5));
        if (e.key === "ArrowRight") setPosition(Math.min(100, position + 5));
      }}
    >
      {/* Before */}
      <div className="absolute inset-0">
        <img
          src={beforeImage}
          alt={`${title} - Before`}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[9px] text-white/30 tracking-[0.2em] uppercase bg-black/30 px-3 py-1.5 backdrop-blur-sm rounded-sm">
            Original
          </span>
        </div>
      </div>

      {/* After (clipped) */}
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        <img
          src={afterImage}
          alt={`${title} - ${preset}`}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[9px] text-white/40 tracking-[0.2em] uppercase bg-black/30 px-3 py-1.5 backdrop-blur-sm rounded-sm">
            {preset}
          </span>
        </div>
      </div>

      {/* Divider line — teal glow */}
      <div
        className="absolute top-0 bottom-0 w-[2px] z-10"
        style={{
          left: `${position}%`,
          transform: "translateX(-50%)",
          background: "var(--accent-teal)",
          boxShadow: "0 0 12px rgba(6,148,148,0.5), 0 0 24px rgba(6,148,148,0.2)",
        }}
      >
        {/* Touch-friendly handle — 44px minimum */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-11 h-11 rounded-full backdrop-blur-sm flex items-center justify-center"
          style={{
            background: "rgba(6, 148, 148, 0.9)",
            border: "2px solid rgba(255,255,255,0.25)",
            boxShadow: "0 0 16px rgba(6,148,148,0.4)",
          }}
        >
          <div className="flex gap-1">
            <div className="w-0.5 h-3 rounded-full bg-white/80" />
            <div className="w-0.5 h-3 rounded-full bg-white/80" />
          </div>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute bottom-3 md:bottom-4 left-3 md:left-4 z-10">
        <span className="text-[8px] md:text-[9px] text-white/50 tracking-[0.15em] uppercase bg-black/40 px-2 md:px-2.5 py-1 md:py-1.5 backdrop-blur-sm rounded-sm">
          Before
        </span>
      </div>
      <div className="absolute bottom-3 md:bottom-4 right-3 md:right-4 z-10">
        <span className="text-[8px] md:text-[9px] text-white/50 tracking-[0.15em] uppercase bg-black/40 px-2 md:px-2.5 py-1 md:py-1.5 backdrop-blur-sm rounded-sm">
          {preset}
        </span>
      </div>

      {/* Frame border */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          border: "1px solid var(--glass-border)",
          borderRadius: "var(--radius-sm)",
        }}
      />
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

const presetOverlays: Record<string, string> = {
  "Moody Cinematic": "linear-gradient(135deg, rgba(6,148,148,0.4) 0%, rgba(10,181,181,0.3) 50%, rgba(4,122,122,0.4) 100%)",
  "Warm Tone": "linear-gradient(135deg, rgba(6,148,148,0.35) 0%, rgba(61,170,170,0.25) 50%, rgba(4,122,122,0.35) 100%)",
  "Clean Minimal": "linear-gradient(135deg, rgba(74,138,138,0.3) 0%, rgba(61,170,170,0.2) 50%, rgba(4,122,122,0.3) 100%)",
  "Film Emulation": "linear-gradient(135deg, rgba(6,148,148,0.35) 0%, rgba(10,181,181,0.25) 50%, rgba(4,122,122,0.35) 100%)",
  "Soft Pastel": "linear-gradient(135deg, rgba(61,170,170,0.3) 0%, rgba(10,181,181,0.25) 50%, rgba(6,148,148,0.3) 100%)",
  "Noir Grade": "linear-gradient(135deg, rgba(4,122,122,0.4) 0%, rgba(74,138,138,0.3) 50%, rgba(3,92,92,0.4) 100%)",
};

export default function Gallery() {
  return (
    <section id="gallery" className="relative py-32 md:py-44" data-gsap="section">
      {/* Ambient glow */}
      <div
        className="absolute top-1/3 right-0 w-[350px] h-[350px] md:w-[500px] md:h-[500px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(6,148,148,0.04) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />

      <div className="mx-auto max-w-[1400px] px-6 md:px-12 relative">
        {/* Section header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 mb-16 md:mb-20">
          <div className="lg:col-span-1">
            <span className="section-number">03</span>
          </div>
          <div className="lg:col-span-5">
            <h2 className="text-[clamp(1.8rem,4vw,3.5rem)] editorial-heading text-[var(--text-primary)] leading-[1.05]">
              See the{" "}
              <span className="text-[var(--accent-teal)] italic">Transformation</span>
            </h2>
          </div>
          <div className="lg:col-span-4 lg:col-start-8 flex items-end">
            <p className="editorial-body text-[var(--text-secondary)]">
              Drag the slider to compare original footage with our cinematic color grades.
            </p>
          </div>
        </div>

        <div className="h-px bg-[var(--border-subtle)] mb-12 md:mb-16" />

        {/* Gallery — asymmetric masonry */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5" data-gsap="cards">
          <div className="md:col-span-7 reveal reveal-delay-1" data-gsap="card">
            <GalleryCard item={galleryItems[0]} index={0} />
          </div>
          <div className="md:col-span-5 flex flex-col gap-5">
            <div className="reveal reveal-delay-2" data-gsap="card">
              <GalleryCard item={galleryItems[1]} index={1} />
            </div>
            <div className="reveal reveal-delay-3" data-gsap="card">
              <GalleryCard item={galleryItems[2]} index={2} />
            </div>
          </div>

          <div className="md:col-span-5 flex flex-col gap-5">
            <div className="reveal reveal-delay-1" data-gsap="card">
              <GalleryCard item={galleryItems[4]} index={4} />
            </div>
            <div className="reveal reveal-delay-2" data-gsap="card">
              <GalleryCard item={galleryItems[5]} index={5} />
            </div>
          </div>
          <div className="md:col-span-7 reveal reveal-delay-3" data-gsap="card">
            <GalleryCard item={galleryItems[3]} index={3} />
          </div>
        </div>
      </div>
    </section>
  );
}

function GalleryCard({ item, index }: { item: typeof galleryItems[0]; index: number }) {
  return (
    <div className="group relative">
      <div
        className="p-1 md:p-1.5 transition-all duration-500 hover:translate-y-[-2px]"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-md)",
          boxShadow: "var(--shadow-card)",
        }}
      >
        <div className="relative overflow-hidden" style={{ borderRadius: "calc(var(--radius-md) - 4px)" }}>
          <BeforeAfterCard {...item} afterImage={item.afterImage} />
          <div
            className="absolute inset-0 pointer-events-none z-[5] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background: presetOverlays[item.preset] || "none",
              borderRadius: "inherit",
            }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 md:mt-5 px-1">
        <div>
          <h4
            className="text-sm text-[var(--text-primary)] mb-0.5"
            style={{ fontFamily: "var(--font-space), Georgia, serif" }}
          >
            {item.title}
          </h4>
          <p className="text-[10px] text-[var(--text-muted)] tracking-[0.1em] uppercase">
            {item.preset}
          </p>
        </div>
        <span className="section-number">{`0${index + 1}`}</span>
      </div>
    </div>
  );
}
