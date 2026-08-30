"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { createCheckoutSession, type PlanType } from "@/lib/stripe";

const plans = [
  {
    id: "single" as PlanType,
    name: "Single Clip",
    price: "₹29",
    period: "per clip",
    description: "Perfect for one-off projects",
    features: ["1 video export", "Basic LUT presets", "Auto white balance", "Contrast & saturation", "1080p export"],
    popular: false,
    cta: "Buy a Clip",
    accent: "var(--text-muted)",
  },
  {
    id: "monthly" as PlanType,
    name: "Monthly",
    price: "₹249",
    period: "/month",
    description: "Up to 200 clips per month",
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
    accent: "var(--accent-bronze)",
  },
  {
    id: "yearly" as PlanType,
    name: "Yearly",
    price: "₹849",
    period: "/year",
    description: "Up to 1,800 clips per year",
    features: [
      "1,800 clips / year",
      "All Pro features",
      "Save 71% vs monthly",
      "Priority processing",
      "4K export",
    ],
    popular: false,
    cta: "Start Yearly",
    accent: "var(--accent-umber)",
  },
  {
    id: "lifetime" as PlanType,
    name: "Lifetime",
    price: "₹2,000",
    period: "one-time",
    description: "Unlimited access forever",
    features: ["Unlimited clips", "All Pro features", "Lifetime updates", "Priority support", "4K export"],
    popular: false,
    cta: "Get Lifetime",
    accent: "var(--accent-sage)",
  },
];

export default function Pricing() {
  const [loadingPlan, setLoadingPlan] = useState<PlanType | null>(null);

  const handleCheckout = async (planId: PlanType) => {
    setLoadingPlan(planId);
    const result = await createCheckoutSession(planId);
    if (!result.success && result.error) {
      alert(result.error);
    }
    setLoadingPlan(null);
  };

  return (
    <section id="pricing" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-[1400px] px-8 md:px-12">
        {/* Section header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-20">
          <div className="lg:col-span-1">
            <span className="section-number">04</span>
          </div>
          <div className="lg:col-span-5">
            <h2 className="text-[clamp(2rem,4vw,3.5rem)] editorial-heading text-[var(--text-primary)] leading-[1.05]">
              Start Free.{" "}
              <span className="text-[var(--accent-bronze)] italic">Upgrade Anytime.</span>
            </h2>
          </div>
          <div className="lg:col-span-4 lg:col-start-8 flex items-end">
            <p className="editorial-body text-[var(--text-secondary)]">
              3-day free trial with 3 exports. No credit card required.
            </p>
          </div>
        </div>

        <div className="h-px bg-[var(--border-subtle)] mb-16" />

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-[var(--border-subtle)]">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-[var(--bg-card)] p-8 md:p-10 flex flex-col relative group hover:bg-[var(--bg-card-hover)] transition-colors duration-500 ${
                plan.popular ? "bg-[var(--bg-elevated)]" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 h-px bg-[var(--accent-bronze)] opacity-60" />
              )}

              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-2 h-2 rounded-full" style={{ background: plan.accent }} />
                  <span className="editorial-caption">{plan.name}</span>
                </div>
                <div className="flex items-baseline gap-1.5 mb-2">
                  <span
                    className="text-3xl md:text-4xl text-[var(--text-primary)]"
                    style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                  >
                    {plan.price}
                  </span>
                  <span className="text-xs text-[var(--text-muted)]">{plan.period}</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)]">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-10 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-[var(--text-secondary)]">
                    <Check className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: plan.accent }} />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleCheckout(plan.id)}
                disabled={loadingPlan === plan.id}
                className={`w-full py-3.5 text-[11px] font-semibold tracking-[0.15em] uppercase transition-all duration-500 flex items-center justify-center gap-2 ${
                  plan.popular
                    ? "bg-[var(--accent-bronze)] text-[var(--bg-deep)] hover:bg-[var(--accent-umber)]"
                    : "border border-[var(--border-medium)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-accent)]"
                }`}
              >
                {loadingPlan === plan.id ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  plan.cta
                )}
              </button>
            </div>
          ))}
        </div>

        <p className="text-center text-[10px] text-[var(--text-ghost)] mt-12 tracking-wide">
          All plans include watermark-free preview. Payments powered by Stripe.
        </p>
      </div>
    </section>
  );
}
