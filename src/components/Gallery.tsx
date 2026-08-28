"use client";

import { useState, useRef, useCallback } from "react";
import { ImageIcon } from "lucide-react";

interface BeforeAfterCardProps {
  title: string;
  preset: string;
  beforeColor: string;
  afterColor: string;
}

function BeforeAfterCard({ title, preset, beforeColor, afterColor }: BeforeAfterCardProps) {
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
      className="relative rounded-2xl overflow-hidden cursor-col-resize group aspect-[4/3]"
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
          <div className="text-center opacity-40">
            <ImageIcon className="w-12 h-12 mx-auto mb-2 text-white/30" />
            <span className="text-xs text-white/40 uppercase tracking-wider">Original</span>
          </div>
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
          <div className="text-center opacity-60">
            <ImageIcon className="w-12 h-12 mx-auto mb-2 text-white/50" />
            <span className="text-xs text-white/60 uppercase tracking-wider">Graded</span>
          </div>
        </div>
      </div>

      {/* Divider line */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white/80 z-10 shadow-lg"
        style={{ left: `${position}%`, transform: "translateX(-50%)" }}
      >
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white/20 backdrop-blur-lg border border-white/40 flex items-center justify-center">
          <div className="flex gap-0.5">
            <div className="w-0.5 h-3 rounded-full bg-white/80" />
            <div className="w-0.5 h-3 rounded-full bg-white/80" />
          </div>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute bottom-3 left-3 z-10 glass rounded-full px-3 py-1 text-[10px] text-white/70 uppercase tracking-wider">
        Before
      </div>
      <div className="absolute bottom-3 right-3 z-10 glass rounded-full px-3 py-1 text-[10px] text-white/70 uppercase tracking-wider">
        {preset}
      </div>
    </div>
  );
}

const galleryItems = [
  {
    title: "Moody Teal & Orange",
    preset: "Moody Cinematic",
    beforeColor: "linear-gradient(135deg, #4a4a4a 0%, #6b6b6b 50%, #3a3a3a 100%)",
    afterColor: "linear-gradient(135deg, #1a4a5a 0%, #d4845a 50%, #0d3040 100%)",
  },
  {
    title: "Warm Golden Hour",
    preset: "Warm Tone",
    beforeColor: "linear-gradient(135deg, #555 0%, #777 50%, #444 100%)",
    afterColor: "linear-gradient(135deg, #d4a54a 0%, #e8c070 50%, #c08030 100%)",
  },
  {
    title: "Clean Desaturated",
    preset: "Clean Minimal",
    beforeColor: "linear-gradient(135deg, #484848 0%, #707070 50%, #383838 100%)",
    afterColor: "linear-gradient(135deg, #e8e8e8 0%, #d0d0d0 50%, #c8c8c8 100%)",
  },
  {
    title: "Vintage Film",
    preset: "Film Emulation",
    beforeColor: "linear-gradient(135deg, #404040 0%, #606060 50%, #303030 100%)",
    afterColor: "linear-gradient(135deg, #c8a870 0%, #e0c898 50%, #a08050 100%)",
  },
  {
    title: "Neon Night",
    preset: "Neon Pop",
    beforeColor: "linear-gradient(135deg, #303038 0%, #484850 50%, #282830 100%)",
    afterColor: "linear-gradient(135deg, #ff00ff 0%, #00ffff 50%, #ff4080 100%)",
  },
  {
    title: "Muted Pastel",
    preset: "Soft Pastel",
    beforeColor: "linear-gradient(135deg, #585858 0%, #787878 50%, #484848 100%)",
    afterColor: "linear-gradient(135deg, #c8a0b8 0%, #a0c8d0 50%, #b8c8a0 100%)",
  },
];

export default function Gallery() {
  return (
    <section id="gallery" className="relative py-32 px-6">
      {/* Background accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-purple-500/5 blur-[200px] pointer-events-none" />

      <div className="mx-auto max-w-7xl relative">
        {/* Header */}
        <div className="text-center mb-20">
          <h2
            className="text-4xl md:text-5xl font-bold tracking-tight mb-4"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            See the <span className="gradient-text">Transformation</span>
          </h2>
          <p className="text-zinc-500 max-w-lg mx-auto">
            Drag the slider to compare original footage with our cinematic color grades.
          </p>
        </div>

        {/* Gallery grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryItems.map((item) => (
            <div key={item.title} className="glass-card p-3 reveal">
              <BeforeAfterCard {...item} />
              <div className="px-3 pt-3 pb-1">
                <h4 className="text-sm font-medium text-white">{item.title}</h4>
                <p className="text-xs text-zinc-500">{item.preset}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
