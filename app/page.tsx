import { HeroStage } from "@/components/landing/HeroStage";
import { CompareShowcase } from "@/components/landing/CompareShowcase";
import { Capabilities } from "@/components/landing/Capabilities";
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

      {/* ── Hero ── */}
      <section className="relative pt-40 pb-24 px-6 md:px-12">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <Reveal>
            <span className="pill-badge">
              <span className="size-1.5 rounded-full bg-bronze-bright pulse-soft" />
              EFFECTCRAFT — CINEMATIC POST-PRODUCTION
            </span>
          </Reveal>
          <Reveal delay={90}>
            <h1 className="display text-5xl md:text-7xl lg:text-[5.5rem] leading-[1.04] text-balance">
              Grade. Effect. <span className="prism-text">Deliver.</span>
            </h1>
          </Reveal>
          <Reveal delay={170}>
            <p className="text-lg md:text-xl text-ink-muted font-light max-w-2xl mx-auto leading-relaxed text-balance">
              A studio-grade color grading engine and a premium Prism plugin
              ecosystem — engineered to run entirely in your browser. No
              uploads, no queues, no render farm.
            </p>
          </Reveal>
          <Reveal delay={250}>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link href="/studio" className="btn-primary gap-2">
                Launch the Studio <ArrowRight className="size-4" />
              </Link>
              <Link href="/plugins" className="btn-ghost">
                Explore 65 plugins
              </Link>
            </div>
          </Reveal>
          <Reveal delay={330}>
            <dl className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
              {[
                ["10", "Film looks"],
                ["64+", "Prism modules"],
                ["4K", "Max export"],
                ["0", "Uploads required"],
              ].map(([num, label]) => (
                <div key={label}>
                  <dt className="mono-num text-2xl md:text-3xl text-bronze-bright">
                    {num}
                  </dt>
                  <dd className="mono-label !text-[9px] mt-2">{label}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        {/* ── Live engine preview ── */}
        <Reveal delay={150}>
          <HeroStage />
        </Reveal>
      </section>

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

      {/* ── Numbered craft sections ── */}
      <NumberedEditorial />

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
