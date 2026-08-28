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
  Lock,
  Crown,
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
    <section id="features" className="relative py-32 px-6">
      <div className="mx-auto max-w-7xl">
        {/* Section header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-6">
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-medium text-zinc-400 tracking-wide uppercase">
              Features & Capabilities
            </span>
          </div>
          <h2
            className="text-4xl md:text-5xl font-bold tracking-tight mb-4"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            Everything You Need to
            <br />
            <span className="gradient-text">Grade Like a Pro</span>
          </h2>
          <p className="text-zinc-500 max-w-lg mx-auto">
            Start with 3 powerful tools for free, or unlock the full suite of 8 professional-grade corrections.
          </p>
        </div>

        {/* Basic tier */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center">
              <Lock className="w-4 h-4 text-zinc-400" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-300">Basic Tier — Free</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {basicFeatures.map((f, i) => (
              <div
                key={f.title}
                className={`glass-card p-6 reveal reveal-delay-${i + 1}`}
              >
                <div className="w-11 h-11 rounded-xl bg-zinc-800/60 flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-zinc-300" />
                </div>
                <h4 className="text-base font-semibold text-white mb-2">{f.title}</h4>
                <p className="text-sm text-zinc-500 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Pro tier */}
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center border border-purple-500/20">
              <Crown className="w-4 h-4 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold gradient-text">Pro Tier — Full Suite</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {proFeatures.map((f, i) => (
              <div
                key={f.title}
                className={`glass-card p-6 gradient-border reveal reveal-delay-${(i % 4) + 1}`}
              >
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-purple-300" />
                </div>
                <h4 className="text-sm font-semibold text-white mb-2">{f.title}</h4>
                <p className="text-xs text-zinc-500 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
