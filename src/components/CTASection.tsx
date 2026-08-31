"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";

export default function CTASection() {
  return (
    <section className="relative py-24 md:py-44 overflow-hidden" data-gsap="section">
      {/* Atmospheric background */}
      <div className="absolute inset-0" style={{ background: "var(--bg-deep)" }} />

      {/* Gradient orbs */}
      <div
        className="absolute top-0 left-1/4 w-[350px] h-[350px] md:w-[500px] md:h-[500px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(212,165,116,0.06) 0%, transparent 70%)",
          filter: "blur(80px) md:blur(100px)",
        }}
      />
      <div
        className="absolute bottom-0 right-1/4 w-[300px] h-[300px] md:w-[400px] md:h-[400px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(122,155,126,0.04) 0%, transparent 70%)",
          filter: "blur(60px) md:blur(80px)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-[1400px] px-6 md:px-12">
        <div
          className="relative overflow-hidden text-center"
          style={{
            background: "var(--glass-bg)",
            border: "1px solid var(--glass-border)",
            borderRadius: "var(--radius-lg)",
            boxShadow: "var(--shadow-elevated)",
            backdropFilter: "blur(var(--glass-blur))",
            WebkitBackdropFilter: "blur(var(--glass-blur))",
          }}
        >
          {/* Inner glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse at 50% 0%, rgba(212,165,116,0.06) 0%, transparent 60%)",
            }}
          />

          <div className="relative px-6 py-16 md:px-16 md:py-24">
            {/* Tagline */}
            <div className="flex items-center justify-center gap-4 mb-8 md:mb-10">
              <div className="editorial-dot" />
              <span className="editorial-caption">Ready to Begin?</span>
              <div className="editorial-dot" />
            </div>

            {/* Headline */}
            <h2 className="text-[clamp(1.8rem,5vw,4rem)] editorial-heading text-[var(--text-primary)] leading-[1.0] mb-5 md:mb-6 max-w-2xl mx-auto">
              Your Vision Deserves{" "}
              <span className="text-[var(--accent-bronze)] italic">Cinematic Color</span>
            </h2>

            {/* Subtext */}
            <p className="editorial-body text-[var(--text-secondary)] max-w-lg mx-auto mb-10 md:mb-12 text-base md:text-lg">
              Start grading in seconds. No downloads, no installs — just open your browser and transform your footage.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-5">
              <Link
                href="/tool"
                className="editorial-btn editorial-btn-primary !px-10 md:!px-12 !py-4 md:!py-5 !text-xs md:!text-sm group"
              >
                Start Free Trial
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
              <a
                href="#features"
                className="editorial-btn editorial-btn-secondary !py-4 md:!py-5 !text-xs md:!text-sm group"
              >
                See All Features
                <ArrowUpRight className="w-4 h-4 opacity-60 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
              </a>
            </div>

            {/* Trust line */}
            <p className="text-[10px] md:text-[11px] text-[var(--text-ghost)] mt-8 md:mt-10 tracking-wide">
              3-day free trial · No credit card required · Cancel anytime
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
