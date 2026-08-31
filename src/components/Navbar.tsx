"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Menu, X, ArrowUpRight } from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    if (mobileOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [mobileOpen]);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "Gallery", href: "#gallery" },
    { label: "Pricing", href: "#pricing" },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "py-3" : "py-5"
        }`}
        style={{
          background: scrolled ? "var(--glass-bg-heavy)" : "transparent",
          backdropFilter: scrolled ? "blur(24px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(24px)" : "none",
          borderBottom: scrolled ? "1px solid var(--glass-border)" : "1px solid transparent",
        }}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="mx-auto max-w-[1400px] px-6 md:px-12">
          <div className="flex items-center justify-between h-12 md:h-14">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group" aria-label="ColorGrade home">
              <span
                className="text-xl md:text-2xl tracking-tight text-[var(--text-primary)] transition-all duration-300 group-hover:tracking-normal"
                style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
              >
                Color<span className="text-[var(--accent-teal)]">Grade</span>
              </span>
            </Link>

            {/* Desktop links */}
            <div className="hidden md:flex items-center gap-10">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="relative text-[11px] font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors duration-300 tracking-[0.15em] uppercase group py-2"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-[var(--accent-teal)] transition-all duration-300 group-hover:w-full opacity-40" />
                </a>
              ))}
              <div className="w-px h-4 bg-[var(--border-medium)]" />
              <Link
                href="/tool"
                className="editorial-btn editorial-btn-primary !py-2.5 !px-5 !text-[10px] !gap-2"
              >
                Open Tool
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden flex items-center justify-center w-11 h-11 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors duration-200 rounded-xl hover:bg-[rgba(255,255,255,0.04)]"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
            >
              <div className="relative w-5 h-5">
                <span
                  className={`absolute inset-0 transition-all duration-200 ${
                    mobileOpen ? "rotate-45 opacity-0" : "rotate-0 opacity-100"
                  }`}
                >
                  <Menu className="w-5 h-5" />
                </span>
                <span
                  className={`absolute inset-0 transition-all duration-200 ${
                    mobileOpen ? "rotate-0 opacity-100" : "-rotate-45 opacity-0"
                  }`}
                >
                  <X className="w-5 h-5" />
                </span>
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
        className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${
          mounted && mobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 transition-all duration-300"
          style={{
            background: "var(--glass-bg-heavy)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
          }}
          onClick={closeMobile}
          aria-hidden="true"
        />

        {/* Menu content — slide up */}
        <div
          className={`relative z-10 flex flex-col justify-center items-center h-full px-8 transition-all duration-300 ease-[var(--ease-smooth)] ${
            mounted && mobileOpen
              ? "translate-y-0 opacity-100"
              : "translate-y-6 opacity-0"
          }`}
        >
          <div className="absolute top-24 left-8 right-8 h-px bg-[var(--border-subtle)]" />

          <nav className="flex flex-col items-center gap-8">
            {navLinks.map((link, i) => (
              <a
                key={link.href}
                href={link.href}
                onClick={closeMobile}
                className={`text-2xl text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all duration-300 tracking-[0.08em] uppercase ${
                  mounted && mobileOpen
                    ? "translate-y-0 opacity-100"
                    : "translate-y-4 opacity-0"
                }`}
                style={{
                  fontFamily: "var(--font-playfair), Georgia, serif",
                  transitionDelay: mounted && mobileOpen ? `${i * 60 + 80}ms` : "0ms",
                }}
              >
                {link.label}
              </a>
            ))}

            <div
              className={`w-12 h-px bg-[var(--accent-teal)] transition-all duration-300 ${
                mounted && mobileOpen ? "opacity-30 scale-x-100" : "opacity-0 scale-x-0"
              }`}
              style={{ transitionDelay: mounted && mobileOpen ? "200ms" : "0ms" }}
            />

            <Link
              href="/tool"
              onClick={closeMobile}
              className={`editorial-btn editorial-btn-primary !px-10 !py-4 !text-xs transition-all duration-300 ${
                mounted && mobileOpen
                  ? "translate-y-0 opacity-100"
                  : "translate-y-4 opacity-0"
              }`}
              style={{ transitionDelay: mounted && mobileOpen ? "280ms" : "0ms" }}
            >
              Open Tool
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </nav>

          <div className="absolute bottom-24 left-8 right-8 h-px bg-[var(--border-subtle)]" />

          <p className="absolute bottom-12 text-[10px] text-[var(--text-ghost)] tracking-[0.15em] uppercase">
            Editorial Color Grading
          </p>
        </div>
      </div>
    </>
  );
}
