"use client";

import { Check, Key, ArrowRight } from "lucide-react";

const tiers = [
  {
    name: "Basic",
    tagline: "Start Here",
    description: "Try the basics — no key needed",
    duration: "Free forever",
    features: [
      "8 LUT presets",
      "White balance",
      "Exposure & contrast",
      "Saturation & brightness",
      "1080p export",
    ],
    popular: false,
    accent: "var(--text-muted)",
    cta: "Try Free",
    keyRequired: false,
  },
  {
    name: "Pro",
    tagline: "Most Popular",
    description: "Full color grading control",
    duration: "30-day key",
    features: [
      "Everything in Basic",
      "3-Way color wheels",
      "HSL target isolation",
      "Custom 3D LUT import",
      "4K export",
      "Priority processing",
    ],
    popular: true,
    accent: "var(--accent-teal)",
    cta: "Get Pro Key",
    keyRequired: true,
  },
  {
    name: "Studio",
    tagline: "For Professionals",
    description: "Complete cinematic toolkit",
    duration: "1-year key",
    features: [
      "Everything in Pro",
      "HDR emulation",
      "Film grain & halation",
      "Bloom effects",
      "Unlimited exports",
      "Priority support",
    ],
    popular: false,
    accent: "var(--accent-teal-dark)",
    cta: "Get Studio Key",
    keyRequired: true,
  },
  {
    name: "Lifetime",
    tagline: "Best Value",
    description: "Pay once, grade forever",
    duration: "Never expires",
    features: [
      "Everything in Studio",
      "Lifetime updates",
      "All future features",
      "Priority support",
      "Commercial license",
    ],
    popular: false,
    accent: "var(--accent-sage)",
    cta: "Get Lifetime Key",
    keyRequired: true,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="relative py-32 md:py-44" data-gsap="section">
      <div className="mx-auto max-w-[1400px] px-6 md:px-12">
        {/* Section header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 mb-16 md:mb-20">
          <div className="lg:col-span-1">
            <span className="section-number">04</span>
          </div>
          <div className="lg:col-span-5">
            <h2 className="text-[clamp(1.8rem,4vw,3.5rem)] editorial-heading text-[var(--text-primary)] leading-[1.05]">
              Start Free.{" "}
              <span className="text-[var(--accent-teal)] italic">Unlock with a Key.</span>
            </h2>
          </div>
          <div className="lg:col-span-4 lg:col-start-8 flex items-end">
            <p className="editorial-body text-[var(--text-secondary)]">
              Use the editor for free, or enter an access key to unlock professional tools. No account required.
            </p>
          </div>
        </div>

        <div className="h-px bg-[var(--border-subtle)] mb-12 md:mb-16" />

        {/* Cards */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-px md:overflow-hidden"
          style={{
            background: "var(--glass-border)",
            borderRadius: "var(--radius-md)",
          }}
        >
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`p-6 md:p-8 lg:p-10 flex flex-col relative group transition-all duration-500 ${
                tier.popular ? "" : "hover:bg-[var(--bg-card-hover)]"
              }`}
              style={{
                background: tier.popular ? "var(--bg-elevated)" : "var(--bg-card)",
                borderRadius: "var(--radius-md)",
              }}
              data-gsap="card"
            >
              {tier.popular && (
                <>
                  <div className="absolute top-0 left-0 right-0 h-px bg-[var(--accent-teal)] opacity-60" />
                  <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-1 rounded-b-full opacity-40"
                    style={{ background: "var(--accent-teal)" }}
                  />
                </>
              )}

              <div className="mb-6 md:mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-2 h-2 rounded-full" style={{ background: tier.accent }} />
                  <span className="editorial-caption">{tier.tagline}</span>
                </div>
                <h3
                  className="text-xl md:text-2xl text-[var(--text-primary)] mb-1"
                  style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                >
                  {tier.name}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mb-2">{tier.description}</p>
                <div className="flex items-center gap-1.5">
                  <Key className="w-3 h-3" style={{ color: tier.accent, opacity: 0.6 }} />
                  <span className="text-[10px] font-medium" style={{ color: tier.accent }}>
                    {tier.duration}
                  </span>
                </div>
              </div>

              <ul className="space-y-2.5 md:space-y-3 mb-8 md:mb-10 flex-1">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 md:gap-3 text-sm text-[var(--text-secondary)]">
                    <Check className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: tier.accent }} />
                    {f}
                  </li>
                ))}
              </ul>

              <a
                href={tier.keyRequired ? "#pricing" : "/tool"}
                className={`w-full flex items-center justify-center gap-2 transition-all duration-500 min-h-[44px] ${
                  tier.popular
                    ? "editorial-btn editorial-btn-primary !w-full"
                    : "editorial-btn editorial-btn-secondary !w-full"
                }`}
              >
                {tier.cta}
                <ArrowRight className="w-3.5 h-3.5 opacity-60" />
              </a>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div className="mt-16 md:mt-20 max-w-2xl mx-auto text-center">
          <h3
            className="text-lg md:text-xl text-[var(--text-primary)] mb-4"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            How Key Access Works
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[
              { step: "01", title: "Get a Key", desc: "Purchase a key for your desired tier" },
              { step: "02", title: "Enter in Tool", desc: "Paste your key in the editor — instant unlock" },
              { step: "03", title: "Start Grading", desc: "Use all features until the key expires" },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div
                  className="text-2xl text-[var(--accent-teal)] mb-2"
                  style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                >
                  {item.step}
                </div>
                <div className="text-sm font-medium text-[var(--text-primary)] mb-1">
                  {item.title}
                </div>
                <div className="text-xs text-[var(--text-muted)]">
                  {item.desc}
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-[10px] text-[var(--text-ghost)] mt-10 md:mt-12 tracking-wide">
          Keys are single-use and non-transferable. Basic tier requires no key.
        </p>
      </div>
    </section>
  );
}
