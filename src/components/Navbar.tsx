"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "Gallery", href: "#gallery" },
    { label: "Pricing", href: "#pricing" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
        scrolled
          ? "bg-[var(--bg-deep)]/90 backdrop-blur-xl border-b border-[var(--border-subtle)]"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-[1400px] px-8 md:px-12">
        {/* Top rule line */}
        <div className={`h-px bg-[var(--border-subtle)] transition-opacity duration-500 ${scrolled ? "opacity-0" : "opacity-100"}`} />

        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex flex-col items-center leading-none">
              <span
                className="text-xl md:text-2xl tracking-tight text-[var(--text-primary)]"
                style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
              >
                Color<span className="text-[var(--accent-bronze)]">Grade</span>
              </span>
            </div>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-[11px] font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors duration-500 tracking-[0.15em] uppercase"
              >
                {link.label}
              </a>
            ))}
            <div className="w-px h-4 bg-[var(--border-medium)]" />
            <Link
              href="/tool"
              className="text-[11px] font-medium text-[var(--accent-bronze)] hover:text-[var(--text-primary)] transition-colors duration-500 tracking-[0.15em] uppercase"
            >
              Open Tool
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[var(--bg-deep)]/95 backdrop-blur-xl border-t border-[var(--border-subtle)]">
          <div className="px-8 py-6 flex flex-col gap-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-[11px] font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors tracking-[0.15em] uppercase py-2"
              >
                {link.label}
              </a>
            ))}
            <div className="h-px bg-[var(--border-subtle)] my-2" />
            <Link
              href="/tool"
              onClick={() => setMobileOpen(false)}
              className="text-[11px] font-medium text-[var(--accent-bronze)] hover:text-[var(--text-primary)] transition-colors tracking-[0.15em] uppercase py-2"
            >
              Open Tool
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
