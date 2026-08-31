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
    span: "col-span-1 md:col-span-2",
    featured: true,
  },
  {
    icon: SunMedium,
    title: "Auto White Balance",
    description: "Automated dynamic range and temperature correction in one click.",
    span: "col-span-1",
    featured: false,
  },
  {
    icon: Contrast,
    title: "Contrast & Saturation",
    description: "Core global tonal and vibrancy adjustment controls with live preview.",
    span: "col-span-1",
    featured: false,
  },
];

const proFeatures = [
  {
    icon: CircleDot,
    title: "3-Way Color Wheels",
    description: "Independent color casting in shadows, midtones, and highlights.",
    span: "col-span-1 md:col-span-2 md:row-span-2",
    featured: true,
  },
  {
    icon: Droplets,
    title: "HSL Target Isolation",
    description: "Adjust hue, saturation, and luminance for specific individual colors.",
    span: "col-span-1",
    featured: false,
  },
  {
    icon: Waves,
    title: "HDR Emulation",
    description: "Recovers clipped highlights and expands dynamic range beautifully.",
    span: "col-span-1",
    featured: false,
  },
  {
    icon: Sparkles,
    title: "Film Grain & Halation",
    description: "Procedural film-stock texture and aesthetic optical glow effects.",
    span: "col-span-1",
    featured: false,
  },
  {
    icon: Upload,
    title: "Custom 3D LUT Import",
    description: "Upload and apply proprietary .cube LUT files for pro workflows.",
    span: "col-span-1 md:col-span-2",
    featured: false,
  },
];

export default function Features() {
  return (
    <section id="features" className="relative py-32 md:py-44" data-gsap="section">
      {/* Ambient glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] md:w-[600px] md:h-[600px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(6,148,148,0.04) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />

      <div className="mx-auto max-w-[1400px] px-6 md:px-12 relative">
        {/* Section header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 mb-16 md:mb-20">
          <div className="lg:col-span-1">
            <span className="section-number">02</span>
          </div>
          <div className="lg:col-span-5">
            <h2 className="text-[clamp(1.8rem,4vw,3.5rem)] editorial-heading text-[var(--text-primary)] leading-[1.05]">
              Everything You Need to
              <br />
              <span className="text-[var(--accent-teal)] italic">Grade Like a Pro</span>
            </h2>
          </div>
          <div className="lg:col-span-4 lg:col-start-8 flex items-end">
            <p className="editorial-body text-[var(--text-secondary)]">
              Start with 3 powerful tools for free, or unlock the full suite of 8 professional-grade corrections.
            </p>
          </div>
        </div>

        {/* Decorative rule */}
        <div className="h-px bg-[var(--border-subtle)] mb-12 md:mb-16" />

        {/* Basic Tier — Bento Grid */}
        <div className="mb-16 md:mb-24">
          <div className="flex items-center gap-4 mb-8 md:mb-10">
            <div className="h-px w-8 bg-[var(--accent-sage)] opacity-40" />
            <span className="editorial-caption text-[var(--accent-sage)]">Basic Tier — Free</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4" data-gsap="cards">
            {basicFeatures.map((f, i) => (
              <div
                key={f.title}
                className={`reveal reveal-delay-${i + 1} group relative overflow-hidden transition-all duration-500 hover:translate-y-[-2px] ${f.span}`}
                data-gsap="card"
                style={{
                  background: "var(--glass-bg)",
                  border: "1px solid var(--glass-border)",
                  borderRadius: "var(--radius-md)",
                  boxShadow: "var(--shadow-card)",
                  backdropFilter: "blur(var(--glass-blur))",
                  WebkitBackdropFilter: "blur(var(--glass-blur))",
                }}
              >
                {/* Hover glow */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background: "radial-gradient(ellipse at 30% 20%, rgba(61,170,170,0.07) 0%, transparent 60%)",
                  }}
                />

                <div className={`relative p-8 md:p-10 ${f.featured ? "md:pb-14" : ""} h-full flex flex-col`}>
                  <div className="flex items-center gap-3 mb-6 md:mb-7">
                    <div
                      className="w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center transition-all duration-500 group-hover:scale-110"
                      style={{
                        background: "rgba(6, 148, 148, 0.08)",
                        border: "1px solid rgba(6, 148, 148, 0.12)",
                      }}
                    >
                      <f.icon className="w-4 h-4 md:w-[18px] md:h-[18px] text-[var(--accent-sage)] opacity-80" />
                    </div>
                    <span className="section-number">{`0${i + 1}`}</span>
                  </div>

                  <h4
                    className={`${f.featured ? "text-lg md:text-xl lg:text-2xl" : "text-base md:text-lg"} text-[var(--text-primary)] mb-3 md:mb-4`}
                    style={{ fontFamily: "var(--font-space), Georgia, serif" }}
                  >
                    {f.title}
                  </h4>

                  <p className={`${f.featured ? "text-sm md:text-base" : "text-xs md:text-sm"} text-[var(--text-secondary)] leading-relaxed flex-1`}>
                    {f.description}
                  </p>

                  {/* Corner decoration */}
                  <div
                    className="absolute bottom-0 right-0 w-10 h-10 md:w-12 md:h-12 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: "linear-gradient(135deg, transparent 50%, rgba(6,148,148,0.08) 50%)",
                      borderRadius: "0 0 var(--radius-md) 0",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pro Tier — Bento Grid */}
        <div>
          <div className="flex items-center gap-4 mb-8 md:mb-10">
            <div className="h-px w-8 bg-[var(--accent-teal)] opacity-40" />
            <span className="editorial-caption text-[var(--accent-teal)]">Pro Tier — Full Suite</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4" data-gsap="cards">
            {proFeatures.map((f, i) => (
              <div
                key={f.title}
                className={`reveal reveal-delay-${(i % 4) + 1} group relative overflow-hidden transition-all duration-500 hover:translate-y-[-2px] ${f.span}`}
                data-gsap="card"
                style={{
                  background: "var(--glass-bg)",
                  border: "1px solid var(--glass-border)",
                  borderRadius: "var(--radius-md)",
                  boxShadow: "var(--shadow-card)",
                  backdropFilter: "blur(var(--glass-blur))",
                  WebkitBackdropFilter: "blur(var(--glass-blur))",
                }}
              >
                {/* Hover glow */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background: "radial-gradient(ellipse at 30% 20%, rgba(6,148,148,0.07) 0%, transparent 60%)",
                  }}
                />

                <div className={`relative p-8 md:p-10 ${f.featured ? "md:p-14" : ""} h-full flex flex-col`}>
                  <div className="flex items-center gap-3 mb-6 md:mb-7">
                    <div
                      className="w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center transition-all duration-500 group-hover:scale-110"
                      style={{
                        background: "rgba(6, 148, 148, 0.10)",
                        border: "1px solid rgba(6, 148, 148, 0.15)",
                      }}
                    >
                      <f.icon className="w-4 h-4 md:w-[18px] md:h-[18px] text-[var(--accent-teal)] opacity-80" />
                    </div>
                    <span className="section-number">{`0${i + 4}`}</span>
                  </div>

                  <h4
                    className={`${f.featured ? "text-lg md:text-xl lg:text-2xl" : "text-sm md:text-base"} text-[var(--text-primary)] mb-3 md:mb-4`}
                    style={{ fontFamily: "var(--font-space), Georgia, serif" }}
                  >
                    {f.title}
                  </h4>

                  <p className={`${f.featured ? "text-sm md:text-base" : "text-xs md:text-sm"} text-[var(--text-secondary)] leading-relaxed flex-1`}>
                    {f.description}
                  </p>

                  {f.featured && (
                    <div className="mt-6 md:mt-8 flex items-center gap-3">
                      <div className="h-px flex-1 bg-[var(--border-subtle)]" />
                      <span className="editorial-caption !text-[8px] !tracking-[0.2em]">Core Feature</span>
                      <div className="h-px flex-1 bg-[var(--border-subtle)]" />
                    </div>
                  )}

                  {/* Corner decoration */}
                  <div
                    className="absolute bottom-0 right-0 w-10 h-10 md:w-12 md:h-12 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: "linear-gradient(135deg, transparent 50%, rgba(6,148,148,0.08) 50%)",
                      borderRadius: "0 0 var(--radius-md) 0",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
