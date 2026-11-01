import Link from "next/link";
import { Reveal } from "@/components/site/Reveal";

export function NumberedEditorial() {
  return (
    <section className="relative py-32 px-6 md:px-12">
      <div className="max-w-7xl mx-auto space-y-32">
        {/* 01 — THE STAGE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-14 md:gap-16 items-center">
          <Reveal className="space-y-6">
            <div className="pill-badge">01 — THE STAGE</div>
            <h2 className="display text-4xl md:text-5xl tracking-tight text-balance">
              Every pixel is a decision.
            </h2>
            <p className="text-lg text-ink-muted font-light leading-relaxed">
              The Studio grades per-pixel in HSL space with luma classification —
              the same math desktop suites use, minus the desktop. Shadows,
              midtones and highlights answer independently, in real time.
            </p>
            <Link href="/studio" className="text-bronze-bright text-sm inline-flex items-center gap-2 hover:gap-3 transition-all">
              See the engine <span aria-hidden>→</span>
            </Link>
          </Reveal>
          <Reveal delay={120}>
            <div className="glass relative overflow-hidden p-8 aspect-[4/3]">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,160,106,0.07),transparent_70%)]" />
              {/* Live hue wheel */}
              <div className="relative w-full h-full grid place-items-center">
                <div
                  className="size-40 rounded-full border border-bronze/40 relative animate-[spin_28s_linear_infinite]"
                  style={{
                    background:
                      "conic-gradient(#f05545, #f07f3e, #eecb4a, #68c96a, #4ecfd6, #4d8ef0, #8a6cf0, #e866c4, #f05545)",
                    filter: "saturate(0.75) brightness(0.92)",
                    animationDuration: "24s",
                  }}
                >
                  <div className="absolute inset-[38%] rounded-full bg-bg-raised border border-line" />
                </div>
                <div className="absolute bottom-2 left-2 mono-label !text-[9px]">
                  3-WAY · 8 CHANNEL HSL
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        {/* 02 — THE EFFECTS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-14 md:gap-16 items-center">
          <Reveal delay={0} className="order-2 md:order-1">
            <div className="glass relative overflow-hidden p-8 aspect-[4/3]">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(79,140,240,0.07),transparent_70%)]" />
              <div className="grid grid-cols-3 gap-3 w-full h-full opacity-70">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-line bg-white/[0.02]"
                    style={{
                      animation: `pulse-soft ${2 + (i % 5)}s ease-in-out infinite`,
                      animationDelay: `${(i % 4) * 0.4}s`,
                    }}
                  />
                ))}
              </div>
              <div className="absolute bottom-2 left-2 mono-label !text-[9px]">
                PRISM MODULES — WASM
              </div>
            </div>
          </Reveal>
          <Reveal delay={120} className="order-1 md:order-2 space-y-6">
            <div className="pill-badge">02 — THE EFFECTS</div>
            <h2 className="display text-4xl md:text-5xl tracking-tight text-balance">
              Strip the grade. Ship the look.
            </h2>
            <p className="text-lg text-ink-muted font-light leading-relaxed">
              Sixty-five Prism modules — S_Glow, S_Light Rays, S_Twixtor Pro,
              S_Deep Glow — built as WASM and delivered as binaries you keep.
              The catalog is the shelf; your vision loads them.
            </p>
            <Link href="/plugins" className="text-bronze-bright text-sm inline-flex items-center gap-2 hover:gap-3 transition-all">
              Browse the catalog <span aria-hidden>→</span>
            </Link>
          </Reveal>
        </div>

        {/* 03 — THE DELIVERY */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-14 md:gap-16 items-center">
          <Reveal className="space-y-6">
            <div className="pill-badge">03 — THE DELIVERY</div>
            <h2 className="display text-4xl md:text-5xl tracking-tight text-balance">
              Render where the pixels are.
            </h2>
            <p className="text-lg text-ink-muted font-light leading-relaxed">
              PNG and JPEG exports from the same deterministic pipeline you see
              live — up to 4K, seeded grain included. No round-trip to a farm,
              nothing transcoded twice, nothing left the machine.
            </p>
            <Link href="/studio#export" className="text-bronze-bright text-sm inline-flex items-center gap-2 hover:gap-3 transition-all">
              Export pipeline <span aria-hidden>→</span>
            </Link>
          </Reveal>
          <Reveal delay={120}>
            <div className="glass p-8 aspect-[4/3] font-mono text-[12px] leading-relaxed overflow-hidden">
              <p className="text-ink-faint">// export spec</p>
              <p className="mt-3">
                <span className="text-bronze-bright">pipeline</span>: single-pass deterministic
              </p>
              <p className="text-ink-muted">formats&nbsp;&nbsp;: png / jpeg</p>
              <p className="text-ink-muted">max size&nbsp;&nbsp;: 3840px <span className="text-ink-faint">(pro)</span></p>
              <p className="text-ink-muted">grain seed : locked</p>
              <p className="text-ink-muted">uploads&nbsp;&nbsp;: none — on-device</p>
              <div className="mt-5 hairline" />
              <p className="mt-5 text-ink-faint">
                status: <span className="text-[#68c96a]">PIPELINE.OK</span>
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
