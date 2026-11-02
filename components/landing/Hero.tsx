"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { HeroStage } from "@/components/landing/HeroStage";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Hero — masked line reveals on load, then a pinned-feel parallax exit:
 * as you scroll the copy lifts + fades while the live engine stage drifts
 * down at a different velocity (dual-speed parallax).
 */
export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) return;
      if (!sectionRef.current) return;

      /* ── Entrance: line masks + staggered rise ── */
      gsap.set(".hero-line", { yPercent: 120, rotate: 3 });
      gsap.set(".hero-fx", { y: 26, opacity: 0 });

      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
      tl.to(".hero-line", { yPercent: 0, rotate: 0, duration: 1.15, stagger: 0.1 }, 0.05)
        .to(".hero-fx", { y: 0, opacity: 1, duration: 0.85, stagger: 0.08 }, 0.3);

      /* ── Exit: dual-velocity parallax ── */
      gsap.to(".hero-copy", {
        yPercent: -14,
        opacity: 0.2,
        scale: 0.985,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 0.5,
        },
      });
      gsap.to(".hero-stage-wrap", {
        yPercent: 12,
        scale: 0.95,
        opacity: 0.55,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 0.5,
        },
      });
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} className="relative pt-36 md:pt-40 pb-24 px-6 md:px-12">
      <div className="hero-copy max-w-5xl mx-auto text-center space-y-8">
        <div className="hero-fx">
          <span className="pill-badge">
            <span className="size-1.5 rounded-full bg-bronze-bright pulse-soft" />
            EFFECTCRAFT — CINEMATIC POST-PRODUCTION
          </span>
        </div>

        <h1 className="display text-5xl md:text-7xl lg:text-[5.5rem] leading-[1.04] text-balance">
          <span className="hero-mask"><span className="hero-line">Grade. Effect.</span></span>{" "}
          <span className="hero-mask"><span className="hero-line prism-text">Deliver.</span></span>
        </h1>

        <p className="hero-fx text-lg md:text-xl text-ink-muted font-light max-w-2xl mx-auto leading-relaxed text-balance">
          A studio-grade color grading engine and a premium Prism plugin
          ecosystem — engineered to run entirely in your browser. No
          uploads, no queues, no render farm.
        </p>

        <div className="hero-fx flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link href="/studio" className="btn-primary gap-2">
            Launch the Studio <ArrowRight className="size-4" />
          </Link>
          <Link href="/plugins" className="btn-ghost">
            Explore 65 plugins
          </Link>
        </div>

        <dl className="hero-fx pt-10 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
          {[
            ["10", "Film looks"],
            ["64+", "Prism modules"],
            ["4K", "Max export"],
            ["0", "Uploads required"],
          ].map(([num, label]) => (
            <div key={label}>
              <dt className="mono-num text-2xl md:text-3xl text-bronze-bright">{num}</dt>
              <dd className="mono-label !text-[9px] mt-2">{label}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* ── Live engine preview ── */}
      <div className="hero-stage-wrap mt-16">
        <HeroStage />
      </div>
    </section>
  );
}
