"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative" style={{ borderTop: "1px solid var(--border-subtle)" }}>
      {/* Subtle gradient glow at top */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: "linear-gradient(90deg, transparent 0%, var(--accent-teal) 50%, transparent 100%)",
          opacity: 0.15,
        }}
      />

      <div className="mx-auto max-w-[1400px] px-6 md:px-12">
        {/* Top section */}
        <div className="py-16 md:py-24">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-10 md:gap-14">
            {/* Brand */}
            <div className="sm:col-span-2 md:col-span-4">
              <Link href="/" className="inline-block mb-6 md:mb-8">
                <span
                  className="text-2xl text-[var(--text-primary)] tracking-tight"
                  style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                >
                  Color<span className="text-[var(--accent-teal)]">Grade</span>
                </span>
              </Link>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-xs mb-6 md:mb-8">
                Professional cinematic color grading for mobile creators. Studio quality, browser-powered.
              </p>
              <div className="flex items-center gap-4">
                {["Twitter", "Instagram", "GitHub"].map((social) => (
                  <a
                    key={social}
                    href="#"
                    className="text-[10px] text-[var(--text-muted)] hover:text-[var(--accent-teal)] transition-colors duration-500 tracking-[0.12em] uppercase py-2"
                  >
                    {social}
                  </a>
                ))}
              </div>
            </div>

            {/* Links */}
            {[
              {
                title: "Product",
                links: [
                  { label: "Features", href: "#features" },
                  { label: "Pricing", href: "#pricing" },
                  { label: "Gallery", href: "#gallery" },
                  { label: "API Docs", href: "#" },
                  { label: "Changelog", href: "#" },
                ],
              },
              {
                title: "Company",
                links: [
                  { label: "About", href: "#" },
                  { label: "Blog", href: "#" },
                  { label: "Careers", href: "#" },
                  { label: "Press Kit", href: "#" },
                  { label: "Contact", href: "#" },
                ],
              },
              {
                title: "Legal",
                links: [
                  { label: "Privacy Policy", href: "/privacy" },
                  { label: "Terms of Service", href: "/terms" },
                  { label: "Cookie Policy", href: "/privacy#cookies" },
                  { label: "GDPR", href: "/privacy#rights" },
                ],
              },
            ].map((col) => (
              <div key={col.title} className="md:col-span-2">
                <h4 className="editorial-caption mb-5 md:mb-7">{col.title}</h4>
                <ul className="space-y-2.5 md:space-y-3.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors duration-500 py-1 inline-block"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="py-6 md:py-8 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4"
          style={{ borderTop: "1px solid var(--border-subtle)" }}
        >
          <p className="text-[10px] text-[var(--text-ghost)] tracking-wide">
            © 2026 ColorGrade. All rights reserved.
          </p>
          <p className="text-[10px] text-[var(--text-ghost)] tracking-wide">
            Crafted for creators who demand the best.
          </p>
        </div>
      </div>
    </footer>
  );
}
