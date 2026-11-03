"use client";

/**
 * OUTRO — FINAL SCENE. "CUT TO: YOUR FRAME."
 * The story hands the controller to the reader: masked type rises, the
 * platform numbers count themselves up, and the graded exhibit returns
 * full-bleed behind the CTA. */
import { useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { FrameCanvas } from "@/components/landing/FrameCanvas";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function ActFinal() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const root = sectionRef.current;
      if (reduced || !root) return;

      /* masked reveal on enter (not pinned — let it flow) */
      gsap.set(".fin-line", { yPercent: 115, rotate: 2 });
      gsap.set(".fin-fx", { y: 26, opacity: 0 });
      const tl = gsap.timeline({
        scrollTrigger: { trigger: root, start: "top 72%", end: "top 8%", scrub: 0.6 },
      });
      tl.to(".fin-line", { yPercent: 0, rotate: 0, stagger: 0.1, ease: "power2.out" }, 0)
        .to(".fin-fx", { y: 0, opacity: 1, stagger: 0.08, ease: "power2.out" }, 0.3);

      /* counters run once in view */
      for (const el of root.querySelectorAll<HTMLElement>(".fin-count")) {
        const target = Number(el.dataset.count ?? "0");
        const obj = { v: 0 };
        gsap.to(obj, {
          v: target,
          ease: "power2.out",
          duration: 2,
          scrollTrigger: { trigger: el, start: "top 92%" },
          onUpdate: () => {
            el.textContent = String(Math.round(obj.v));
          },
        });
      }

      /* graded exhibit slowly zooms while the scene is on screen */
      gsap.fromTo(".fin-backdrop", { scale: 1.12, yPercent: -6 }, {
        scale: 1.02,
        yPercent: 2,
        ease: "none",
        scrollTrigger: { trigger: root, start: "top bottom", end: "bottom top", scrub: 0.6 },
      });
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} id="scene-outro" className="relative min-h-[100svh] flex items-center overflow-hidden px-6 md:px-12 py-32">
      {/* graded exhibit full-bleed behind everything */}
      <div className="fin-backdrop absolute inset-0 opacity-[0.13] pointer-events-none" aria-hidden>
        <FrameCanvas w={1280} h={720} look="teal-orange" className="block w-full h-full object-cover" />
      </div>

      <div className="relative max-w-4xl mx-auto text-center">
        <div className="fin-fx">
          <p className="mono-label !text-[10px]">FINAL SCENE — SMASH CUT TO YOU</p>
        </div>

        <h2 className="display text-5xl md:text-7xl lg:text-[6rem] leading-[1.04] mt-8 text-balance">
          <span className="hero-mask"><span className="fin-line">Your frame</span></span>{" "}
          <span className="hero-mask"><span className="fin-line prism-text">is next.</span></span>
        </h2>

        <p className="fin-fx mt-7 text-lg text-ink-muted font-light max-w-xl mx-auto leading-relaxed">
          The studio is live, free and empty, waiting for the shot you took
          this week. Bring it in — the story above repeats for every frame.
        </p>

        <div className="fin-fx flex flex-wrap justify-center gap-3 mt-10">
          <Link href="/studio" className="btn-primary gap-2">
            Launch the Studio <ArrowRight className="size-4" />
          </Link>
          <Link href="/pricing" className="btn-ghost">
            Unlock everything from $9
          </Link>
        </div>

        <dl className="fin-fx mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { count: 10, suffix: "", label: "FILM LOOKS" },
            { count: 65, suffix: "", label: "PRISM MODULES" },
            { count: 4, suffix: "K", label: "MAX EXPORT", static: true },
            { count: 0, suffix: "", label: "UPLOADS NEEDED", static: true },
          ].map((s) => (
            <div key={s.label}>
              <dt className="mono-num text-2xl md:text-4xl text-bronze-bright">
                <span className={s.static ? "" : "fin-count"} data-count={s.count}>
                  {s.count}
                </span>
                {s.suffix}
              </dt>
              <dd className="mono-label !text-[9px] mt-2">{s.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
