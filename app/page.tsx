import { Hero } from "@/components/landing/Hero";
import { Ticker } from "@/components/landing/Ticker";
import { CompareShowcase } from "@/components/landing/CompareShowcase";
import { Capabilities } from "@/components/landing/Capabilities";
import { HorizontalLooks } from "@/components/landing/HorizontalLooks";
import { PinnedManifesto } from "@/components/landing/PinnedManifesto";
import { PinnedGradeReveal } from "@/components/landing/PinnedGradeReveal";
import { NumberedEditorial } from "@/components/landing/NumberedEditorial";
import { PluginsTeaser } from "@/components/landing/PluginsTeaser";
import { PricingPreview } from "@/components/landing/PricingPreview";
import { Reveal } from "@/components/site/Reveal";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <main className="relative overflow-hidden">
      {/* ── Ambient backdrop ── */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden>
        <div
          className="ambient-a absolute -top-40 -left-40 size-[42rem] rounded-full blur-[140px] opacity-[0.16]"
          style={{
            background:
              "radial-gradient(circle, rgba(201,160,106,0.5), transparent 65%)",
          }}
        />
        <div
          className="ambient-b absolute top-1/3 -right-52 size-[46rem] rounded-full blur-[160px] opacity-[0.12]"
          style={{
            background:
              "radial-gradient(circle, rgba(90,110,200,0.45), transparent 65%)",
          }}
        />
        <div className="vlines">
          <span /><span /><span /><span />
        </div>
      </div>

      {/* ── Hero: masked reveals + dual-speed parallax exit ── */}
      <Hero />

      {/* ── Oversized display ticker ── */}
      <Ticker />

      {/* ── Marquee ── */}
      <section className="relative py-14 overflow-hidden border-y border-line/50">
        <p className="text-center mono-label mb-8">
          Trusted in pipelines by creators of
        </p>
        <div className="relative w-full overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_15%,black_85%,transparent)]">
          <div className="marquee-track flex items-center gap-16 w-max px-6">
            {[0, 1].map((half) => (
              <div key={half} className="flex items-center gap-16">
                {[
                  "LOOMIS FILMS",
                  "ASTRA DYNAMICS",
                  "HALCYON WEST",
                  "MAHORA STUDIO",
                  "NORTHWIND POST",
                  "KAIROS MOTION",
                  "VERITE HOUSE",
                  "AURELUS",
                ].map((name) => (
                  <span
                    key={`${half}-${name}`}
                    className="font-mono text-[13px] tracking-[0.3em] text-ink-faint whitespace-nowrap"
                  >
                    {name}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Capabilities ── */}
      <Capabilities />

      {/* ── Pinned horizontal palette ── */}
      <HorizontalLooks />

      {/* ── Pinned manifesto: line-wipe scrub ── */}
      <PinnedManifesto />

      {/* ── Numbered craft sections ── */}
      <NumberedEditorial />

      {/* ── Pinned scroll-to-grade frame ── */}
      <PinnedGradeReveal />

      {/* ── Interactive showcase: drag compare ── */}
      <section className="relative py-32 px-6 md:px-12">
        <Reveal className="text-center max-w-2xl mx-auto mb-14">
          <p className="mono-label mb-4">Proof of engine</p>
          <h2 className="display text-4xl md:text-5xl gradient-text">
            See the transformation.
          </h2>
          <p className="mt-4 text-ink-muted font-light">
            These aren&rsquo;t static before/after images — you are dragging the
            grading engine itself.
          </p>
        </Reveal>
        <Reveal delay={100}>
          <CompareShowcase />
        </Reveal>
      </section>

      {/* ── Plugin teaser ── */}
      <PluginsTeaser />

      {/* ── Pricing preview ── */}
      <PricingPreview />

      {/* ── Final CTA ── */}
      <section className="relative py-36 px-6 md:px-12 text-center">
        <Reveal className="max-w-3xl mx-auto">
          <div className="vlines hidden md:grid">
            <span /><span /><span /><span />
          </div>
          <p className="mono-label mb-5">VOL. 01 — FINAL CUT</p>
          <h2 className="display text-4xl md:text-6xl lg:text-7xl gradient-text">
            Make every frame cinematic.
          </h2>
          <p className="mt-6 text-lg text-ink-muted font-light max-w-xl mx-auto">
            The whole pipeline is live in your browser right now. Walk in,
            drop a frame, and grade it properly.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-10">
            <Link href="/studio" className="btn-primary gap-2">
              Start grading — free <ArrowRight className="size-4" />
            </Link>
            <Link href="/pricing" className="btn-ghost">
              View pricing
            </Link>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
