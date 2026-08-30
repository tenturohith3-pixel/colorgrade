"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // Simple parallax on scroll
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
      {/* Subtle background grain */}
      <div className="absolute inset-0 bg-[var(--bg-deep)]" />

      {/* Cinematic gradient orbs — very muted */}
      <div className="absolute top-[15%] right-[10%] w-[500px] h-[500px] rounded-full bg-[var(--accent-bronze)]/[0.03] blur-[150px]" />
      <div className="absolute bottom-[10%] left-[5%] w-[400px] h-[400px] rounded-full bg-[var(--accent-sage)]/[0.03] blur-[120px]" />

      {/* Editorial decorative line — vertical */}
      <div className="absolute left-8 md:left-16 top-32 bottom-32 w-px bg-[var(--border-subtle)] hidden lg:block" />

      <div className="relative z-10 mx-auto max-w-[1400px] w-full px-8 md:px-12 pt-32 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left column — Main headline */}
          <div className="lg:col-span-7">
            {/* Issue number / editorial tag */}
            <div className="flex items-center gap-4 mb-10" data-parallax="0.1">
              <div className="editorial-dot" />
              <span className="editorial-caption">Vol. 01 — Cinematic Color</span>
              <div className="h-px flex-1 bg-[var(--border-subtle)] max-w-[100px]" />
            </div>

            {/* Main headline */}
            <h1 className="mb-8" data-parallax="0.05">
              <span
                className="block text-[clamp(2.8rem,7vw,6.5rem)] editorial-display text-[var(--text-primary)] leading-[0.90] mb-2"
              >
                Make Every
              </span>
              <span
                className="block text-[clamp(2.8rem,7vw,6.5rem)] editorial-display leading-[0.90]"
              >
                <span className="text-[var(--text-primary)]">Frame</span>{" "}
                <span className="text-[var(--accent-bronze)] italic">Cinematic</span>
              </span>
            </h1>

            {/* Subheadline — editorial body */}
            <div className="max-w-lg mb-12" data-parallax="0.08">
              <p className="editorial-body text-[var(--text-secondary)]">
                Professional color grading for the modern creator.
                LUT presets, 3-way color wheels, and AI-powered corrections —
                all in your browser.
              </p>
            </div>

            {/* CTA row */}
            <div className="flex items-center gap-6" data-parallax="0.1">
              <Link
                href="/tool"
                className="group inline-flex items-center gap-3 px-8 py-4 bg-[var(--accent-bronze)] text-[var(--bg-deep)] text-[11px] font-semibold tracking-[0.15em] uppercase hover:bg-[var(--accent-umber)] transition-all duration-500"
              >
                Start Free Trial
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
              <a
                href="#gallery"
                className="text-[11px] font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors duration-500 tracking-[0.15em] uppercase"
              >
                View Gallery
              </a>
            </div>
          </div>

          {/* Right column — Editorial visual element */}
          <div className="lg:col-span-5 relative" data-parallax="0.15">
            {/* Cinematic frame */}
            <div className="relative aspect-[4/5] overflow-hidden">
              {/* Gradient background simulating cinematic footage */}
              <div
                className="absolute inset-0"
                style={{
                  background: `
                    radial-gradient(ellipse at 30% 20%, rgba(196,149,106,0.12) 0%, transparent 50%),
                    radial-gradient(ellipse at 70% 80%, rgba(122,155,126,0.08) 0%, transparent 50%),
                    linear-gradient(160deg, #1A1816 0%, #0B0A08 40%, #151312 100%)
                  `,
                }}
              />

              {/* Overlaid text — editorial style */}
              <div className="absolute inset-0 flex flex-col justify-between p-8 md:p-10">
                <div className="flex items-center justify-between">
                  <span className="editorial-caption">Featured Work</span>
                  <span className="section-number">01</span>
                </div>

                <div>
                  <p
                    className="text-[clamp(1.2rem,2.5vw,1.8rem)] text-[var(--text-primary)] leading-snug mb-4"
                    style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                  >
                    &ldquo;Color is the keyboard, the eyes are the harmonies, the soul is the piano with many strings.&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="h-px w-8 bg-[var(--accent-bronze)] opacity-40" />
                    <span className="text-[10px] text-[var(--text-muted)] tracking-[0.15em] uppercase">
                      Wassily Kandinsky
                    </span>
                  </div>
                </div>
              </div>

              {/* Frame border */}
              <div className="absolute inset-0 border border-[var(--border-subtle)]" />
            </div>

            {/* Stats — editorial style below the frame */}
            <div className="grid grid-cols-3 gap-px bg-[var(--border-subtle)] mt-px">
              {[
                { value: "30+", label: "LUT Presets" },
                { value: "4K", label: "Export Quality" },
                { value: "<2s", label: "Processing" },
              ].map((stat) => (
                <div key={stat.label} className="bg-[var(--bg-card)] p-5 text-center">
                  <div
                    className="text-xl md:text-2xl text-[var(--text-primary)] mb-1"
                    style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                  >
                    {stat.value}
                  </div>
                  <div className="text-[9px] text-[var(--text-muted)] tracking-[0.12em] uppercase">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom editorial rule */}
      <div className="absolute bottom-0 left-8 md:left-16 right-8 md:right-16 h-px bg-[var(--border-subtle)]" />
    </section>
  );
}
