import { ActOpen } from "@/components/landing/ActOpen";
import { Ticker } from "@/components/landing/Ticker";
import { ActAssembly } from "@/components/landing/ActAssembly";
import { PinnedGradeReveal } from "@/components/landing/PinnedGradeReveal";
import { PinnedManifesto } from "@/components/landing/PinnedManifesto";
import { HorizontalLooks } from "@/components/landing/HorizontalLooks";
import { ActTexture } from "@/components/landing/ActTexture";
import { ActFinal } from "@/components/landing/ActFinal";
import { CompareShowcase } from "@/components/landing/CompareShowcase";
import { PluginsTeaser } from "@/components/landing/PluginsTeaser";
import { PricingPreview } from "@/components/landing/PricingPreview";
import { Reveal } from "@/components/site/Reveal";
import { AmbientCanvas } from "@/components/landing/AmbientCanvas";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <main className="relative overflow-hidden noise min-h-screen">
      {/* ── Ambient backdrop ── */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden>
        <AmbientCanvas />
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

      {/* ── The story ── */}
      {/* Scene 01 — cold open: every shot starts flat */}
      <ActOpen />

      {/* Story spine */}
      <Ticker />

      {/* Scene 02 — the tools fly together around the frame */}
      <ActAssembly />

      {/* Scene 03 — the grade, scrubbed by scroll */}
      <PinnedGradeReveal />

      {/* Interlude — the doctrine */}
      <PinnedManifesto />

      {/* Scene 04 — the palette travels sideways */}
      <HorizontalLooks />

      {/* Scene 05 — texture & tone + the 65 */}
      <ActTexture />

      {/* Scene 06 — proof: your hands on the wheel */}
      <section id="scene-proof" className="relative py-32 px-6 md:px-12">
        <Reveal className="text-center max-w-2xl mx-auto mb-14">
          <p className="mono-label mb-4">SCENE 06 — PROOF, IN YOUR HANDS</p>
          <h2 className="display text-4xl md:text-5xl gradient-text">
            The engine is loaded. Pull the wheel.
          </h2>
          <p className="mt-4 text-ink-muted font-light">
            This is not a video loop — you are dragging the grading engine
            itself, the same one waiting inside the Studio.
          </p>
        </Reveal>
        <Reveal delay={100}>
          <CompareShowcase />
        </Reveal>
      </section>

      {/* Scene 07 — the vault */}
      <PluginsTeaser />

      {/* Scene 08 — ownership */}
      <PricingPreview />

      {/* Final scene — cut to your frame */}
      <ActFinal />
    </main>
  );
}
