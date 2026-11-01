import type { Metadata } from "next";
import Link from "next/link";
import { Check, ShieldCheck } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import { PricingTools } from "@/components/pricing/PricingTools";

export const metadata: Metadata = {
  title: "Pricing & Keys",
  description:
    "Start free forever. One key unlocks Pro, Studio or Lifetime — no accounts, no uploads.",
};

const TIERS: {
  name: string;
  price: string;
  note: string;
  perks: string[];
  cta: { label: string; href?: string; tier?: "pro" | "studio" | "lifetime" };
  featured: boolean;
}[] = [
  {
    name: "Basic",
    price: "Free",
    note: "forever · no key needed",
    perks: [
      "Synthetic sample + upload grading",
      "All 6 free film looks",
      "Exposure, contrast, saturation, WB",
      "Vignette & texture suite",
      "1080p export (PNG / JPEG)",
    ],
    cta: { label: "Open Studio", href: "/studio" },
    featured: false,
  },
  {
    name: "Pro",
    price: "₹499",
    note: "30-day key",
    perks: [
      "Everything in Basic",
      "8 more film looks (10 total)",
      "3-way color wheels",
      "8-channel HSL isolation",
      ".cube 3D LUT import",
      "4K export (3840px)",
    ],
    cta: { label: "Demo-generate Pro", tier: "pro" as const },
    featured: true,
  },
  {
    name: "Studio",
    price: "₹1,499",
    note: "365-day key",
    perks: [
      "Everything in Pro",
      "Film grain · halation · bloom",
      "HDR curve & highlight recovery",
      "Everglade Studio look",
      "4K export, priority pipeline",
    ],
    cta: { label: "Demo-generate Studio", tier: "studio" as const },
    featured: false,
  },
  {
    name: "Lifetime",
    price: "₹4,999",
    note: "one key · never expires",
    perks: [
      "Everything in Studio, forever",
      "All future looks & plugins",
      "Commercial usage license",
      "Everglade + roadmap modules",
    ],
    cta: { label: "Demo-generate Lifetime", tier: "lifetime" as const },
    featured: false,
  },
];

const STEPS = [
  { n: "01", title: "Pick the tier", body: "Free needs nothing. Pro, Studio and Lifetime are single-purchase keys — no subscriptions hiding in the fine print." },
  { n: "02", title: "Enter in Studio", body: "Paste the key once — verification is instant and local. The tier badge lights up in the top bar and every locked control comes online." },
  { n: "03", title: "Grade to the limit", body: "Until expiry (or forever, on Lifetime), export up to your tier's ceiling — 4K included." },
];

export default function PricingPage() {
  return (
    <main className="relative overflow-hidden pt-36">
      <div className="fixed inset-0 pointer-events-none" aria-hidden>
        <div
          className="ambient-a absolute -top-40 left-1/3 size-[40rem] rounded-full blur-[150px] opacity-[0.12]"
          style={{
            background:
              "radial-gradient(circle, rgba(201,160,106,0.5), transparent 65%)",
          }}
        />
      </div>

      <section className="px-6 md:px-12">
        <div className="max-w-4xl mx-auto text-center">
          <Reveal>
            <span className="pill-badge">PRICING</span>
            <h1 className="display text-5xl md:text-7xl gradient-text mt-8 text-balance">
              Free until you need more.
            </h1>
            <p className="mt-6 text-lg text-ink-muted font-light leading-relaxed">
              One key. No accounts, no uploads, no device locks. Verified
              client-side in seconds.
            </p>
          </Reveal>
          <Reveal delay={130}>
            <div className="mt-10 flex justify-center">
              <PricingTools />
            </div>
            <p className="mono-label !text-[9px] mt-4">
              THIS BUILD ISSUES SELF-VERIFIED KEYS FOR DEMO/DEV
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Tiers ── */}
      <section className="relative py-24 px-6 md:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {TIERS.map((t, i) => (
            <Reveal key={t.name} delay={i * 90}>
              <div
                className={
                  t.featured
                    ? "glass card-hover h-full p-8 border-bronze/40 relative"
                    : "glass card-hover h-full p-8 relative"
                }
              >
                {t.featured ? (
                  <span className="absolute top-5 right-5 mono-label !text-[9px] text-bronze-bright">
                    POPULAR
                  </span>
                ) : null}
                <p className="display text-xl">{t.name}</p>
                <p className="mt-5">
                  <span className="display text-4xl">{t.price}</span>
                </p>
                <p className="mono-label !text-[9px] mt-2">{t.note}</p>
                <ul className="mt-7 space-y-2.5">
                  {t.perks.map((perk) => (
                    <li key={perk} className="flex items-start gap-2 text-[13px] text-ink-muted">
                      <Check className="size-3.5 mt-0.5 text-bronze-bright shrink-0" strokeWidth={2} />
                      {perk}
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  {t.cta.href ? (
                    <Link href={t.cta.href} className={t.featured ? "btn-primary w-full justify-center text-[13px]" : "btn-ghost w-full justify-center text-[13px]"}>
                      {t.cta.label}
                    </Link>
                  ) : (
                    <span
                      className={
                        t.featured
                          ? "btn-primary w-full justify-center text-[13px] pointer-events-none opacity-90"
                          : "btn-ghost w-full justify-center text-[13px] pointer-events-none opacity-60"
                      }
                      title="Generate above using the demo keys"
                    >
                      {t.cta.label}
                    </span>
                  )}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── How keys work ── */}
      <section id="how-keys-work" className="relative py-24 px-6 md:px-12 border-t border-line/60">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <p className="mono-label mb-4">How access works</p>
            <h2 className="display text-4xl md:text-5xl gradient-text max-w-2xl">
              Keys are honor systems, enforced.
            </h2>
          </Reveal>
          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-4">
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 100}>
                <div className="glass p-8 h-full">
                  <p className="mono-num text-bronze-bright text-sm">{s.n}</p>
                  <h3 className="display text-xl mt-4">{s.title}</h3>
                  <p className="mt-3 text-sm text-ink-muted leading-relaxed">{s.body}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={120}>
            <div className="glass mt-8 p-7 flex items-start gap-4">
              <ShieldCheck className="size-5 text-bronze-bright shrink-0 mt-0.5" strokeWidth={1.5} />
              <div>
                <p className="text-sm text-ink leading-relaxed">
                  Keys are checksum-verified strings tied to a tier and duration.
                  In this build the whole verification loop runs client-side so
                  the platform stays fully functional without any paid backend.
                  Production wiring (Stripe checkout + email delivery) plugs into
                  the same <span className="mono-num text-[12px]">buildLicense()</span>{" "}
                  interface.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="pricing-faq" className="relative py-24 px-6 md:px-12 border-t border-line/60">
        <div className="max-w-3xl mx-auto">
          <Reveal>
            <p className="mono-label mb-4">FAQ</p>
            <h2 className="display text-4xl md:text-5xl gradient-text">
              Straight answers.
            </h2>
          </Reveal>
          <div className="mt-12 space-y-3">
            {[
              {
                q: "Do I need an account?",
                a: "No. The Studio runs entirely in your browser — nothing to sign up for, nothing to log into. Keys are the only state.",
              },
              {
                q: "What happens when my key expires?",
                a: "The Studio quietly drops back to free tier — your parameters stay, locked tools grey out, exports ceiling to 1080p. Reactivate any time with a fresh key.",
              },
              {
                q: "Can I use exports commercially?",
                a: "Graded outputs you create are yours. The Lifetime tier explicitly includes a commercial license; free-tier exports are for personal and evaluation use.",
              },
              {
                q: "Is the demo key flow safe to test?",
                a: "It's designed for it — checksum-verified, local-only, and revocable from the key panel any time.",
              },
            ].map((f, i) => (
              <Reveal key={f.q} delay={i * 60}>
                <details className="glass group px-6 py-5 [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex items-center justify-between cursor-pointer list-none">
                    <span className="text-[15px]">{f.q}</span>
                    <span className="mono-num text-bronze-bright text-sm group-open:rotate-45 transition-transform">
                      +
                    </span>
                  </summary>
                  <p className="mt-4 text-sm text-ink-muted leading-relaxed">{f.a}</p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
