"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative border-t border-[var(--border-subtle)]">
      <div className="mx-auto max-w-[1400px] px-8 md:px-12">
        {/* Top section */}
        <div className="py-16 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
            {/* Brand */}
            <div className="md:col-span-4">
              <Link href="/" className="inline-block mb-6">
                <span
                  className="text-2xl text-[var(--text-primary)] tracking-tight"
                  style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                >
                  Color<span className="text-[var(--accent-bronze)]">Grade</span>
                </span>
              </Link>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-xs mb-6">
                Professional cinematic color grading for mobile creators. Studio quality, browser-powered.
              </p>
              <div className="flex items-center gap-3">
                {["Twitter", "Instagram", "GitHub"].map((social) => (
                  <a
                    key={social}
                    href="#"
                    className="text-[10px] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors duration-500 tracking-[0.12em] uppercase"
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
                links: ["Features", "Pricing", "Gallery", "API Docs", "Changelog"],
              },
              {
                title: "Company",
                links: ["About", "Blog", "Careers", "Press Kit", "Contact"],
              },
              {
                title: "Legal",
                links: ["Privacy Policy", "Terms of Service", "Cookie Policy", "GDPR"],
              },
            ].map((col) => (
              <div key={col.title} className="md:col-span-2">
                <h4 className="editorial-caption mb-6">{col.title}</h4>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors duration-500"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[var(--border-subtle)] py-8 flex flex-col md:flex-row items-center justify-between gap-4">
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
