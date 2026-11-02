"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { TIER_LABEL, type Tier } from "@/lib/license";
import { LOOKS } from "@/lib/grade/looks";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** Swatch gradients per look id (brand palette, no external images). */
const SWATCH: Record<string, string> = {
  natural: "linear-gradient(135deg, #6b6d74, #2a2b30)",
  "kodak-250d": "linear-gradient(120deg, #c9a06a 0%, #7d5a3a 55%, #35271c 100%)",
  "teal-orange": "linear-gradient(110deg, #17414c 0%, #0e2b33 45%, #d98343 100%)",
  "golden-hour": "linear-gradient(120deg, #e8c67e, #b97f3f 60%, #523718)",
  noir: "linear-gradient(135deg, #dfe3e8 0%, #6a6f78 55%, #1a1c20)",
  "bleach-bypass": "linear-gradient(135deg, #efe9da, #9aa08e 55%, #3c3f34)",
  "faded-70s": "linear-gradient(130deg, #d9b48a, #b07354 55%, #5d4433)",
  arctic: "linear-gradient(120deg, #cfe4f2, #7ba9c4 55%, #274050)",
  "neon-tokyo": "linear-gradient(115deg, #ff3d8b, #16b1ff 60%, #1c1436)",
  vernacular: "linear-gradient(130deg, #9fc6a5, #3d6b4f 60%, #14261c)",
};

/**
 * Pinned horizontal gallery — scroll down, the palette travels sideways.
 * Classic pin-to-pin: trigger pins at `top top`, the track translates by
 * exactly the distance needed to show every card, then releases.
 */
export function HorizontalLooks() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const hairRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const track = trackRef.current;
      const section = sectionRef.current;
      if (!track || !section || reduced) return;

      const dist = () => Math.max(0, track.scrollWidth - window.innerWidth);
      const common = {
        trigger: section,
        start: "top top" as const,
        end: () => `+=${dist()}`,
        invalidateOnRefresh: true,
        anticipatePin: 1,
      };

      gsap.to(track, {
        x: () => -dist(),
        ease: "none",
        scrollTrigger: { ...common, scrub: 0.55, pin: true },
      });
      if (hairRef.current) {
        gsap.fromTo(
          hairRef.current,
          { scaleX: 0 },
          { scaleX: 1, ease: "none", scrollTrigger: { ...common, scrub: 0.55 } },
        );
      }
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} className="relative hl-pin h-[100svh] overflow-hidden py-10">
      <div className="hl-viewport h-full flex flex-col justify-center">
        {/* header pinned together with the track */}
        <div className="px-6 md:px-12 flex items-end justify-between max-w-7xl mx-auto w-full">
          <div>
            <p className="mono-label !text-[10px]">PALETTE — THE FILM EMULATIONS</p>
            <h2 className="display text-4xl md:text-6xl mt-3 gradient-text">
              Ten looks, engineered one by one.
            </h2>
          </div>
          <p className="hidden md:block mono-num text-[11px] text-ink-faint pb-2">
            SCROLL ↓ — HORIZONTAL PIN
          </p>
        </div>

        {/* the traveling track */}
        <div className="mt-10 md:mt-14 pl-6 md:pl-12">
          <div ref={trackRef} className="hl-track flex items-stretch gap-5 md:gap-7 w-max pr-[10vw]">
            {LOOKS.map((look, i) => (
              <article
                key={look.id}
                className="hl-card w-[74vw] sm:w-[420px] md:w-[460px] shrink-0 rounded-2xl border border-line bg-bg-raised/60 overflow-hidden"
              >
                <div
                  className="aspect-[16/9]"
                  style={{ background: SWATCH[look.id] ?? SWATCH.natural }}
                />
                <div className="p-5 md:p-6">
                  <div className="flex items-center justify-between gap-3">
                    <p className="mono-num text-[11px] text-bronze-bright">
                      LOOK {String(i + 1).padStart(2, "0")}
                    </p>
                    {look.locked !== "free" ? (
                      <span className="mono-label !text-[8px] px-2 py-1 rounded-full border border-bronze/30 text-bronze-bright">
                        {TIER_LABEL[look.locked as Tier]} KEY
                      </span>
                    ) : (
                      <span className="mono-label !text-[8px] px-2 py-1 rounded-full border border-line text-ink-faint">
                        FREE
                      </span>
                    )}
                  </div>
                  <h3 className="display text-2xl mt-3">{look.name}</h3>
                  <p className="mono-label !text-[9px] mt-2">{look.tag}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* scrub progress */}
        <div className="px-6 md:px-12 mt-9 max-w-7xl mx-auto w-full">
          <div className="h-px bg-line/50 relative overflow-hidden rounded-full">
            <div
              ref={hairRef}
              className="absolute inset-0 origin-left scale-x-0 bg-bronze-bright"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
