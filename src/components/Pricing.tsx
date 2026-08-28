"use client";

import { Check, Crown, Zap, Infinity } from "lucide-react";

const plans = [
  {
    name: "Single Clip",
    price: "₹29",
    period: "per clip",
    description: "Perfect for one-off projects",
    icon: Zap,
    features: ["1 video export", "Basic LUT presets", "Auto white balance", "Contrast & saturation", "1080p export"],
    popular: false,
    cta: "Buy a Clip",
    accent: "from-zinc-700 to-zinc-600",
  },
  {
    name: "Monthly",
    price: "₹249",
    period: "/month",
    description: "Up to 200 clips per month",
    icon: Crown,
    features: [
      "200 clips / month",
      "All 8 Pro tools",
      "3-Way color wheels",
      "HSL target isolation",
      "HDR emulation",
      "Film grain & halation",
      "Custom 3D LUT import",
      "4K export",
      "Priority processing",
    ],
    popular: true,
    cta: "Start Monthly",
    accent: "from-[var(--accent)] to-pink-500",
  },
  {
    name: "Yearly",
    price: "₹849",
    period: "/year",
    description: "Up to 1,800 clips per year",
    icon: Crown,
    features: [
      "1,800 clips / year",
      "All Pro features",
      "Save 71% vs monthly",
      "Priority processing",
      "4K export",
    ],
    popular: false,
    cta: "Start Yearly",
    accent: "from-amber-500 to-orange-500",
  },
  {
    name: "Lifetime",
    price: "₹2,000",
    period: "one-time",
    description: "Unlimited access forever",
    icon: Infinity,
    features: ["Unlimited clips", "All Pro features", "Lifetime updates", "Priority support", "4K export"],
    popular: false,
    cta: "Get Lifetime",
    accent: "from-emerald-500 to-teal-500",
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="relative py-32 px-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-6">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-medium text-zinc-400 tracking-wide uppercase">
              Simple Pricing
            </span>
          </div>
          <h2
            className="text-4xl md:text-5xl font-bold tracking-tight mb-4"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            Start Free. <span className="gradient-text">Upgrade Anytime.</span>
          </h2>
          <p className="text-zinc-500 max-w-lg mx-auto">
            3-day free trial with 3 exports. No credit card required.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative glass-card p-6 flex flex-col ${
                plan.popular ? "gradient-border glow-purple" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-[var(--accent)] to-pink-500 text-[10px] font-bold uppercase tracking-wider text-white">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${plan.accent} flex items-center justify-center mb-4`}>
                  <plan.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-white">{plan.price}</span>
                  <span className="text-sm text-zinc-500">{plan.period}</span>
                </div>
                <p className="text-xs text-zinc-500 mt-1">{plan.description}</p>
              </div>

              <ul className="space-y-2.5 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-zinc-400">
                    <Check className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-3 rounded-xl text-sm font-medium transition-all ${
                  plan.popular
                    ? "bg-gradient-to-r from-[var(--accent)] to-pink-500 text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30"
                    : "glass text-zinc-300 hover:text-white hover:bg-white/5"
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-zinc-600 mt-12">
          All plans include watermark-free preview. 50/50 weekly mystery card gives you a chance to win free exports.
        </p>
      </div>
    </section>
  );
}
