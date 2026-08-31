"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Play } from "lucide-react";

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const els = section.querySelectorAll("[data-parallax]");
      els.forEach((el) => {
        const speed = parseFloat((el as HTMLElement).dataset.parallax || "0.5");
        (el as HTMLElement).style.transform = `translateY(${scrollY * speed}px)`;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section ref={sectionRef} className="relative min-h-screen flex items-center overflow-hidden">
      {/* Deep atmospheric background */}
      <div className="absolute inset-0 bg-[var(--bg-deep)]" />

      {/* Cinematic gradient orbs */}
      <div
        className="absolute top-[10%] right-[5%] w-[400px] h-[400px] md:w-[600px] md:h-[600px] rounded-full blur-[120px] md:blur-[180px]"
        style={{ background: "radial-gradient(circle, rgba(6,148,148,0.08) 0%, transparent 70%)" }}
      />
      <div
        className="absolute bottom-[5%] left-[0%] w-[350px] h-[350px] md:w-[500px] md:h-[500px] rounded-full blur-[100px] md:blur-[160px]"
        style={{ background: "radial-gradient(circle, rgba(10,181,181,0.06) 0%, transparent 70%)" }}
      />
      <div
        className="absolute top-[50%] left-[40%] w-[300px] h-[300px] md:w-[400px] md:h-[400px] rounded-full blur-[140px] md:blur-[200px]"
        style={{ background: "radial-gradient(circle, rgba(4,122,122,0.05) 0%, transparent 70%)" }}
      />

      {/* Subtle vertical accent line — desktop only */}
      <div className="absolute left-8 md:left-16 top-28 bottom-28 w-px bg-[var(--border-subtle)] hidden lg:block" />

      {/* Main content */}
      <div className="relative z-10 mx-auto max-w-[1400px] w-full px-6 md:px-12 pt-28 pb-16 md:pt-36 md:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left column — Headline */}
          <div className="lg:col-span-7">
            {/* Editorial tag */}
            <div className="flex items-center gap-4 mb-8 md:mb-12" data-parallax="0.1">
              <div className="editorial-dot" />
              <span className="editorial-caption">Vol. 01 — Cinematic Color</span>
              <div className="h-px flex-1 bg-[var(--border-subtle)] max-w-[100px]" />
            </div>

            {/* Main headline — responsive scale */}
            <h1 className="mb-8 md:mb-10" data-parallax="0.05">
              <span className="block text-[clamp(2.5rem,8vw,7.5rem)] editorial-display text-[var(--text-primary)] leading-[0.88] mb-2 md:mb-3">
                Make Every
              </span>
              <span className="block text-[clamp(2.5rem,8vw,7.5rem)] editorial-display leading-[0.88]">
                <span className="text-[var(--text-primary)]">Frame</span>{" "}
                <span className="text-[var(--accent-teal)] italic">Cinematic</span>
              </span>
            </h1>

            {/* Subheadline */}
            <div className="max-w-lg mb-10 md:mb-14" data-parallax="0.08">
              <p className="editorial-body text-[var(--text-secondary)] text-base md:text-lg">
                Professional color grading for the modern creator.
                LUT presets, 3-way color wheels, and AI-powered corrections —
                all in your browser.
              </p>
            </div>

            {/* CTA row */}
            <div className="flex flex-wrap items-center gap-4 md:gap-5" data-parallax="0.1">
              <Link
                href="/tool"
                className="editorial-btn editorial-btn-primary !px-8 md:!px-10 !py-4 !text-xs group"
              >
                Start Free Trial
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
              <a
                href="#gallery"
                className="editorial-btn editorial-btn-secondary !py-4 group"
              >
                <Play className="w-3.5 h-3.5 opacity-60" />
                View Gallery
              </a>
            </div>

            {/* Trust signals */}
            <div className="flex flex-wrap items-center gap-4 md:gap-6 mt-8 md:mt-10" data-parallax="0.12">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-1.5">
                  {["bg-[var(--accent-teal)]", "bg-[var(--accent-sage)]", "bg-[var(--accent-teal-dark)]"].map(
                    (bg, i) => (
                      <div
                        key={i}
                        className={`w-5 h-5 rounded-full ${bg} border border-[var(--bg-deep)] opacity-70`}
                      />
                    )
                  )}
                </div>
                <span className="text-[10px] text-[var(--text-muted)] tracking-wide">
                  2,400+ creators
                </span>
              </div>
              <div className="w-px h-3 bg-[var(--border-medium)]" />
              <span className="text-[10px] text-[var(--text-muted)] tracking-wide">
                No credit card required
              </span>
            </div>
          </div>

          {/* Right column — Cinematic visual */}
          <div className="lg:col-span-5 relative" data-parallax="0.15">
            {/* Main cinematic frame */}
            <div
              className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-md)]"
              style={{ boxShadow: "var(--shadow-elevated)" }}
            >
              {/* Gradient background */}
              <div
                className="absolute inset-0"
                style={{
                  background: `
                    radial-gradient(ellipse at 30% 20%, rgba(6,148,148,0.12) 0%, transparent 50%),
                    radial-gradient(ellipse at 70% 80%, rgba(10,181,181,0.08) 0%, transparent 50%),
                    linear-gradient(160deg, #222222 0%, #181818 40%, #1E1E1E 100%)
                  `,
                }}
              />

              {/* Inner content */}
              <div className="absolute inset-0 flex flex-col justify-between p-6 md:p-10">
                <div className="flex items-center justify-between">
                  <span className="editorial-caption">Featured Work</span>
                  <span className="section-number">01</span>
                </div>

                <div>
                  <p
                    className="text-[clamp(1rem,2.5vw,1.8rem)] text-[var(--text-primary)] leading-snug mb-4 md:mb-5"
                    style={{ fontFamily: "var(--font-space), Georgia, serif" }}
                  >
                    &ldquo;Color is the keyboard, the eyes are the harmonies, the soul is the piano with many strings.&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="h-px w-8 bg-[var(--accent-teal)] opacity-40" />
                    <span className="text-[10px] text-[var(--text-muted)] tracking-[0.15em] uppercase">
                      Wassily Kandinsky
                    </span>
                  </div>
                </div>
              </div>

              {/* Frame border */}
              <div
                className="absolute inset-0 rounded-[var(--radius-md)] pointer-events-none"
                style={{ border: "1px solid var(--glass-border)" }}
              />
            </div>

            {/* Stats bar */}
            <div
              className="grid grid-cols-3 gap-px mt-px rounded-b-[var(--radius-md)] overflow-hidden"
              style={{ background: "var(--glass-border)" }}
            >
              {[
                { value: "30+", label: "LUT Presets" },
                { value: "4K", label: "Export Quality" },
                { value: "<2s", label: "Processing" },
              ].map((stat) => (
                <div key={stat.label} className="p-4 md:p-5 text-center" style={{ background: "var(--bg-card)" }}>
                  <div
                    className="text-lg md:text-2xl text-[var(--text-primary)] mb-1"
                    style={{ fontFamily: "var(--font-space), Georgia, serif" }}
                  >
                    {stat.value}
                  </div>
                  <div className="text-[8px] md:text-[9px] text-[var(--text-muted)] tracking-[0.12em] uppercase">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom editorial rule */}
      <div className="absolute bottom-0 left-6 md:left-16 right-6 md:right-16 h-px bg-[var(--border-subtle)]" />
    </section>
  );
}
