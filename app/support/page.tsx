import type { Metadata } from "next";
import { Mail, Timer, ShieldCheck } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import { ContactForm } from "@/components/support/ContactForm";

export const metadata: Metadata = {
  title: "Support",
  description:
    "FAQs, direct contact and platform status for the EffectCraft ecosystem.",
};

const CHANNELS = [
  {
    icon: Mail,
    label: "MAIL",
    value: "support@effectcraft.studio",
    note: "answered first-come, same working week",
    href: "mailto:support@effectcraft.studio",
  },
  {
    icon: Timer,
    label: "SLA",
    value: "24h pivots",
    note: "grading emergencies jump the queue on Studio keys",
    href: "mailto:support@effectcraft.studio?subject=Priority%20grade",
  },
  {
    icon: ShieldCheck,
    label: "REFUNDS",
    value: "No-questions",
    note: "annual keys refundable inside 14 days, untouched",
    href: "mailto:support@effectcraft.studio?subject=Refund",
  },
];

const FAQ = [
  {
    q: "Where do my files get processed?",
    a: "In your browser. The grading engine writes pixels via Canvas 2D on-device; your frame is never uploaded anywhere. Closing the tab clears everything except your saved key.",
  },
  {
    q: "What can I feed the Studio?",
    a: "PNG, JPEG and WEBP stills — a frame from your timeline is the ideal subject. Reference frames drop in directly or via the file button; the synthetic dusk sample also works from a cold start.",
  },
  {
    q: "How do Plugin binaries fit into my pipeline?",
    a: "Prism modules are standard WASM, sold together in the Prism Bundle ($29 one-time, included with Studio and Lifetime). Unlock once, download every binary, and mount it in your host of choice or reference its deterministic module id (prism://<id>) from EffectCraft-compatible tooling.",
  },
  {
    q: "Why is the export lighter than my source?",
    a: "Resolution tiers: Basic stops at 1920px, Pro/Studio at 3840px, and the cap never upscales — the render stays at or below your source for honesty's sake.",
  },
  {
    q: "Can I run this platform from source?",
    a: "Yes — it is a plain Next.js app: bun install, bun run dev. Studio and catalog work with zero environment variables by design.",
  },
];

const STATUS = [
  ["STUDIO ENGINE", "OPERATIONAL", true],
  ["PLUGIN REGISTRY", "OPERATIONAL", true],
  ["KEY VERIFICATION", "LOCAL-ONLY", true],
] as const;

export default function SupportPage() {
  return (
    <main className="relative overflow-hidden pt-36">
      <div className="fixed inset-0 pointer-events-none" aria-hidden>
        <div
          className="ambient-b absolute top-0 -left-40 size-[38rem] rounded-full blur-[140px] opacity-[0.1]"
          style={{
            background:
              "radial-gradient(circle, rgba(201,160,106,0.45), transparent 65%)",
          }}
        />
      </div>

      <section className="px-6 md:px-12">
        <div className="max-w-4xl mx-auto text-center">
          <Reveal>
            <span className="pill-badge">SUPPORT</span>
            <h1 className="display text-5xl md:text-7xl gradient-text mt-8 text-balance">
              Quiet dispatch, real answers.
            </h1>
          </Reveal>
        </div>
      </section>

      {/* Channels */}
      <section className="relative py-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
          {CHANNELS.map((c, i) => (
            <Reveal key={c.label} delay={i * 90}>
              <a
                href={c.href}
                className="glass card-hover block p-7 h-full"
              >
                <div className="flex items-center justify-between">
                  <c.icon className="size-5 text-bronze-bright" strokeWidth={1.5} />
                  <span className="mono-label !text-[8px] text-[#68c96a]">ONLINE</span>
                </div>
                <p className="mono-label mt-5">{c.label}</p>
                <p className="display text-lg mt-2.5">{c.value}</p>
                <p className="text-[12px] text-ink-muted mt-2 leading-relaxed">{c.note}</p>
              </a>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FAQ + Status + Contact */}
      <section id="faq" className="relative py-16 px-6 md:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <Reveal>
            <p className="mono-label mb-4">FAQ</p>
            <h2 className="display text-3xl md:text-4xl mb-8">
              Before you write — it&rsquo;s probably here.
            </h2>
            <div className="space-y-3">
              {FAQ.map((f) => (
                <details
                  key={f.q}
                  className="glass group px-6 py-5 [&_summary::-webkit-details-marker]:hidden"
                >
                  <summary className="flex items-center justify-between cursor-pointer list-none gap-4">
                    <span className="text-[14.5px]">{f.q}</span>
                    <span className="mono-num text-bronze-bright text-sm group-open:rotate-45 transition-transform shrink-0">
                      +
                    </span>
                  </summary>
                  <p className="mt-4 text-sm text-ink-muted leading-relaxed">{f.a}</p>
                </details>
              ))}
            </div>

            <div id="status" className="glass mt-8 p-6">
              <p className="mono-label mb-4">PLATFORM STATUS</p>
              <ul className="space-y-2.5">
                {STATUS.map(([name, value, ok]) => (
                  <li key={name} className="flex items-center justify-between">
                    <span className="mono-num text-[11px]">{name}</span>
                    <span
                      className={
                        ok
                          ? "mono-num text-[11px] text-[#68c96a]"
                          : "mono-num text-[11px] text-bronze-bright"
                      }
                    >
                      {value}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <ContactForm />
          </Reveal>
        </div>
      </section>
    </main>
  );
}
