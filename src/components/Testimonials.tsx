"use client";

import { Star } from "lucide-react";

const testimonials = [
  {
    quote:
      "ColorGrade completely transformed my workflow. The 3-way color wheels give me DaVinci-level control right in the browser — I haven't opened my desktop editor in months.",
    name: "Priya Menon",
    role: "Freelance Cinematographer",
    accent: "var(--accent-teal)",
    glowColor: "rgba(6,148,148,0.06)",
    borderGlow: "rgba(6,148,148,0.12)",
    fillBg: "rgba(6,148,148,0.08)",
  },
  {
    quote:
      "The LUT presets are genuinely cinematic, not Instagram filters. I graded an entire short film on my iPad during a flight. That's the future.",
    name: "Arjun Kapoor",
    role: "Independent Filmmaker",
    accent: "var(--accent-sage)",
    glowColor: "rgba(61,170,170,0.06)",
    borderGlow: "rgba(61,170,170,0.12)",
    fillBg: "rgba(61,170,170,0.08)",
  },
  {
    quote:
      "As a wedding videographer, turnaround time is everything. ColorGrade cut my post-production in half without sacrificing quality. My clients love the results.",
    name: "Meera Iyer",
    role: "Wedding Videography Studio",
    accent: "var(--accent-teal-dark)",
    glowColor: "rgba(4,122,122,0.06)",
    borderGlow: "rgba(4,122,122,0.12)",
    fillBg: "rgba(4,122,122,0.08)",
  },
  {
    quote:
      "The film grain and halation effects are what sold me. They add that organic, analog texture that makes digital footage feel alive. Absolutely stunning tool.",
    name: "Dev Sharma",
    role: "Music Video Director",
    accent: "var(--accent-clay)",
    glowColor: "rgba(7,175,175,0.06)",
    borderGlow: "rgba(7,175,175,0.12)",
    fillBg: "rgba(7,175,175,0.08)",
  },
];

export default function Testimonials() {
  return (
    <section className="relative py-32 md:py-44 overflow-hidden" data-gsap="section">
      {/* Ambient glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(6,148,148,0.05) 0%, transparent 70%)",
          filter: "blur(100px)",
        }}
      />

      <div className="mx-auto max-w-[1400px] px-6 md:px-12 relative">
        {/* Section header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 mb-16 md:mb-20">
          <div className="lg:col-span-1">
            <span className="section-number">05</span>
          </div>
          <div className="lg:col-span-5">
            <h2 className="text-[clamp(1.8rem,4vw,3.5rem)] editorial-heading text-[var(--text-primary)] leading-[1.05]">
              Trusted by{" "}
              <span className="text-[var(--accent-teal)] italic">Creators</span>
            </h2>
          </div>
          <div className="lg:col-span-4 lg:col-start-8 flex items-end">
            <p className="editorial-body text-[var(--text-secondary)]">
              Hear from the filmmakers, videographers, and colorists who grade with ColorGrade daily.
            </p>
          </div>
        </div>

        <div className="h-px bg-[var(--border-subtle)] mb-12 md:mb-16" />

        {/* Testimonials grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5" data-gsap="cards">
          {testimonials.map((t, i) => (
            <div
              key={t.name}
              className={`reveal reveal-delay-${(i % 4) + 1} group relative`}
              data-gsap="card"
            >
              <div
                className="relative h-full p-8 md:p-10 transition-all duration-500 hover:translate-y-[-2px]"
                style={{
                  background: "var(--glass-bg)",
                  border: "1px solid var(--glass-border)",
                  borderRadius: "var(--radius-md)",
                  boxShadow: "var(--shadow-card)",
                  backdropFilter: "blur(var(--glass-blur))",
                  WebkitBackdropFilter: "blur(var(--glass-blur))",
                }}
              >
                {/* Hover glow */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-[var(--radius-md)]"
                  style={{
                    background: `radial-gradient(ellipse at 30% 20%, ${t.glowColor} 0%, transparent 60%)`,
                  }}
                />

                {/* Stars */}
                <div className="flex gap-1 mb-6">
                  {Array.from({ length: 5 }).map((_, si) => (
                    <Star
                      key={si}
                      className="w-3 h-3"
                      style={{ color: t.accent, fill: t.accent, opacity: 0.7 }}
                    />
                  ))}
                </div>

                {/* Quote */}
                <blockquote
                  className="relative mb-8"
                  style={{ paddingLeft: "var(--space-6)" }}
                >
                  <div
                    className="absolute left-0 top-0 bottom-0 w-[2px] rounded-full"
                    style={{ background: t.accent, opacity: 0.3 }}
                  />
                  <p
                    className="text-[15px] md:text-base text-[var(--text-secondary)] leading-[1.7]"
                    style={{ fontFamily: "var(--font-serif), Georgia, serif", fontStyle: "italic" }}
                  >
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </blockquote>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center"
                    style={{
                      background: t.fillBg,
                      border: `1px solid ${t.borderGlow}`,
                    }}
                  >
                    <span className="text-xs font-medium" style={{ color: t.accent }}>
                      {t.name.split(" ").map((w) => w[0]).join("")}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm text-[var(--text-primary)] font-medium">
                      {t.name}
                    </div>
                    <div className="text-[11px] text-[var(--text-muted)]">
                      {t.role}
                    </div>
                  </div>
                </div>

                {/* Corner decoration */}
                <div
                  className="absolute bottom-0 right-0 w-10 h-10 md:w-12 md:h-12 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: `linear-gradient(135deg, transparent 50%, ${t.fillBg} 50%)`,
                    borderRadius: "0 0 var(--radius-md) 0",
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Bottom trust bar */}
        <div className="mt-16 md:mt-20 flex flex-col items-center">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px w-12 bg-[var(--border-subtle)]" />
            <span className="editorial-caption">Used by</span>
            <div className="h-px w-12 bg-[var(--border-subtle)]" />
          </div>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14">
            {[
              { value: "2,400+", label: "Creators" },
              { value: "140+", label: "Films Graded" },
              { value: "4.9★", label: "Average Rating" },
              { value: "12", label: "Countries" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div
                  className="text-lg md:text-xl text-[var(--text-primary)] mb-1"
                  style={{ fontFamily: "var(--font-space), Georgia, serif" }}
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
    </section>
  );
}
