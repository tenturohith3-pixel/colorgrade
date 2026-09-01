"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

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
    <header
      ref={sectionRef}
      className="relative pt-32 pb-24 md:pt-48 md:pb-32 px-5 md:px-12 lg:px-16 max-w-screen-2xl mx-auto overflow-hidden min-h-screen flex items-center"
    >
      {/* Abstract Background Blurs */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-primary-container rounded-full mix-blend-screen blur-[120px] md:blur-[150px] opacity-40 animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] md:w-[600px] md:h-[600px] bg-secondary-container rounded-full mix-blend-screen blur-[140px] md:blur-[180px] opacity-30" />
      </div>

      <div className="relative z-10 grid md:grid-cols-2 gap-12 md:gap-16 items-center w-full">
        {/* Left — Headline */}
        <div className="flex flex-col gap-6" data-parallax="0.1">
          {/* Tag */}
          <div className="inline-flex items-center gap-2 text-[var(--accent-teal)] text-sm font-medium glass-panel px-4 py-2 rounded-full w-fit">
            <span className="w-2 h-2 rounded-full bg-[var(--accent-teal)] animate-pulse shadow-[0_0_8px_#7dd3fc]" />
            Vol. 01 — Cinematic Color
          </div>

          {/* Headline */}
          <h1 className="text-[clamp(2.5rem,6vw,4.5rem)] md:text-[clamp(3rem,6vw,4.5rem)] leading-[1.05] font-extrabold tracking-tight">
            <span className="text-gradient">Make Every</span>
            <br />
            <span className="text-gradient">Frame Cinematic</span>
          </h1>

          {/* Subheadline */}
          <p className="text-base md:text-lg text-[var(--text-secondary)] max-w-xl leading-relaxed">
            Professional color grading for the modern creator.
            LUT presets, 3-way color wheels, and AI-powered corrections —
            all in your browser.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-4 pt-4">
            <Link
              href="/tool"
              className="iridescent-btn px-8 py-3.5 rounded-full font-bold text-sm flex items-center gap-2"
            >
              Start Free Trial
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#gallery"
              className="glass-panel px-8 py-3.5 rounded-full text-sm text-[var(--accent-teal)] flex items-center gap-2 hover:bg-surface-container-high transition-colors font-medium border-[var(--border-accent)] hover:border-[var(--accent-teal)]"
            >
              View Gallery
            </a>
          </div>

          {/* Social Proof */}
          <div className="flex items-center gap-4 mt-8 pt-8 border-t border-[var(--border-subtle)]">
            <div className="flex -space-x-3">
              {["U1", "U2", "+"].map((label, i) => (
                <div
                  key={i}
                  className={`w-10 h-10 rounded-full border-2 border-[var(--bg-deep)] flex items-center justify-center text-xs font-medium shadow-lg ${
                    i === 2 ? "text-[var(--accent-teal)]" : "text-[var(--text-muted)]"
                  }`}
                  style={{ background: "var(--bg-surface-highest)" }}
                >
                  {label}
                </div>
              ))}
            </div>
            <div className="text-xs text-[var(--text-secondary)]">
              <span className="font-bold">2,400+ creators</span>
              <br />
              No credit card required
            </div>
          </div>
        </div>

        {/* Right — Preview Area */}
        <div
          className="relative h-[400px] md:h-[600px] w-full rounded-2xl overflow-hidden glass-panel group hidden md:block border border-[var(--border-subtle)] shadow-[0_0_50px_rgba(125,211,252,0.1)]"
          data-parallax="0.15"
        >
          {/* Gradient background */}
          <div
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(ellipse at 30% 20%, rgba(125,211,252,0.08) 0%, transparent 50%),
                radial-gradient(ellipse at 70% 80%, rgba(0,240,255,0.05) 0%, transparent 50%),
                linear-gradient(160deg, #141c2e 0%, #0a0e1a 40%, #0f1524 100%)
              `,
            }}
          />

          {/* Stats overlay */}
          <div className="absolute bottom-6 right-6 glass-panel p-4 rounded-xl flex gap-4 backdrop-blur-xl border border-[var(--border-accent)]">
            <div className="text-center">
              <div className="text-2xl text-[var(--accent-teal)] font-bold">30+</div>
              <div className="text-[10px] text-[var(--text-muted)]">LUT Presets</div>
            </div>
            <div className="w-px bg-[var(--border-accent)]" />
            <div className="text-center">
              <div className="text-2xl text-[var(--accent-sage)] font-bold">4K</div>
              <div className="text-[10px] text-[var(--text-muted)]">Export Quality</div>
            </div>
          </div>

          {/* Decorative grid lines */}
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            <div className="absolute top-1/3 left-0 right-0 h-px bg-[var(--accent-teal)]" />
            <div className="absolute top-2/3 left-0 right-0 h-px bg-[var(--accent-teal)]" />
            <div className="absolute left-1/3 top-0 bottom-0 w-px bg-[var(--accent-teal)]" />
            <div className="absolute left-2/3 top-0 bottom-0 w-px bg-[var(--accent-teal)]" />
          </div>
        </div>
      </div>
    </header>
  );
}
