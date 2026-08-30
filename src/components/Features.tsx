"use client";

import {
  SunMedium,
  Contrast,
  Droplets,
  CircleDot,
  Waves,
  Sparkles,
  Film,
  Upload,
} from "lucide-react";

const basicFeatures = [
  {
    icon: Film,
    title: "Standard LUT Presets",
    description: "5–10 cinematic 1-click filter presets. Moody, warm, clean — instant vibe.",
  },
  {
    icon: SunMedium,
    title: "Auto White Balance",
    description: "Automated dynamic range and temperature correction in one click.",
  },
  {
    icon: Contrast,
    title: "Contrast & Saturation",
    description: "Core global tonal and vibrancy adjustment controls with live preview.",
  },
];

const proFeatures = [
  {
    icon: CircleDot,
    title: "3-Way Color Wheels",
    description: "Independent color casting in shadows, midtones, and highlights.",
  },
  {
    icon: Droplets,
    title: "HSL Target Isolation",
    description: "Adjust hue, saturation, and luminance for specific individual colors.",
  },
  {
    icon: Waves,
    title: "HDR Emulation",
    description: "Recovers clipped highlights and expands dynamic range beautifully.",
  },
  {
    icon: Sparkles,
    title: "Film Grain & Halation",
    description: "Procedural film-stock texture and aesthetic optical glow effects.",
  },
  {
    icon: Upload,
    title: "Custom 3D LUT Import",
    description: "Upload and apply proprietary .cube LUT files for pro workflows.",
  },
];

export default function Features() {
  return (
    <section id="features" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-[1400px] px-8 md:px-12">
        {/* Section header — editorial */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-20">
          <div className="lg:col-span-1">
            <span className="section-number">02</span>
          </div>
          <div className="lg:col-span-5">
            <h2
              className="text-[clamp(2rem,4vw,3.5rem)] editorial-heading text-[var(--text-primary)] leading-[1.05]"
            >
              Everything You Need to
              <br />
              <span className="text-[var(--accent-bronze)] italic">Grade Like a Pro</span>
            </h2>
          </div>
          <div className="lg:col-span-4 lg:col-start-8 flex items-end">
            <p className="editorial-body text-[var(--text-secondary)]">
              Start with 3 powerful tools for free, or unlock the full suite of 8 professional-grade corrections.
            </p>
          </div>
        </div>

        {/* Decorative rule */}
        <div className="h-px bg-[var(--border-subtle)] mb-16" />

        {/* Basic Tier */}
        <div className="mb-20">
          <div className="flex items-center gap-4 mb-10">
            <div className="h-px w-8 bg-[var(--accent-sage)] opacity-40" />
            <span className="editorial-caption text-[var(--accent-sage)]">Basic Tier — Free</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[var(--border-subtle)]">
            {basicFeatures.map((f, i) => (
              <div
                key={f.title}
                className={`bg-[var(--bg-card)] p-8 md:p-10 reveal reveal-delay-${i + 1} group hover:bg-[var(--bg-card-hover)] transition-colors duration-500`}
              >
                <div className="flex items-center gap-3 mb-6">
                  <f.icon className="w-4 h-4 text-[var(--accent-sage)] opacity-60" />
                  <span className="section-number">{`0${i + 1}`}</span>
                </div>
                <h4
                  className="text-lg text-[var(--text-primary)] mb-3"
                  style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                >
                  {f.title}
                </h4>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Pro Tier */}
        <div>
          <div className="flex items-center gap-4 mb-10">
            <div className="h-px w-8 bg-[var(--accent-bronze)] opacity-40" />
            <span className="editorial-caption text-[var(--accent-bronze)]">Pro Tier — Full Suite</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-px bg-[var(--border-subtle)]">
            {proFeatures.map((f, i) => (
              <div
                key={f.title}
                className={`bg-[var(--bg-card)] p-8 md:p-10 reveal reveal-delay-${(i % 4) + 1} group hover:bg-[var(--bg-card-hover)] transition-colors duration-500`}
              >
                <div className="flex items-center gap-3 mb-6">
                  <f.icon className="w-4 h-4 text-[var(--accent-bronze)] opacity-60" />
                  <span className="section-number">{`0${i + 4}`}</span>
                </div>
                <h4
                  className="text-base text-[var(--text-primary)] mb-3"
                  style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                >
                  {f.title}
                </h4>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
