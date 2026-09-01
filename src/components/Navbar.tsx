"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

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
    { label: "Showcase", href: "#gallery" },
    { label: "Pricing", href: "#pricing" },
  ];

  return (
    <>
      {/* Desktop Nav */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 hidden md:flex justify-between items-center px-6 md:px-12 lg:px-16 py-4 max-w-screen-2xl mx-auto ${
          scrolled
            ? "bg-surface-container-lowest/80 backdrop-blur-[40px] border-b border-primary/20 shadow-2xl"
            : "bg-transparent"
        }`}
        style={{
          // @ts-expect-error CSS custom properties
          "--tw-bg-opacity": scrolled ? 1 : 0,
        }}
      >
        <Link
          href="/"
          className="font-bold text-2xl text-[var(--accent-teal)] tracking-tighter hover:opacity-80 transition-opacity"
          style={{ fontFamily: "var(--font-space), Georgia, serif" }}
        >
          ColorGrade
        </Link>

        <div className="flex gap-6 lg:gap-8 items-center text-sm">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[var(--text-primary)] font-semibold hover:text-[var(--accent-teal)] transition-colors duration-300"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex gap-4 lg:gap-6 items-center text-sm">
          <a
            href="#"
            className="text-[var(--text-secondary)] font-medium hover:text-[var(--accent-teal)] transition-colors duration-300"
          >
            Sign In
          </a>
          <Link
            href="/tool"
            className="iridescent-btn px-6 py-2.5 rounded-full font-bold text-sm transition-all duration-300"
          >
            Launch Editor
          </Link>
        </div>
      </nav>

      {/* Mobile Nav */}
      <nav
        className={`fixed top-0 w-full z-50 md:hidden flex justify-between items-center px-5 py-4 ${
          scrolled
            ? "bg-surface-container-lowest/80 backdrop-blur-[40px] border-b border-primary/20 shadow-2xl"
            : "bg-transparent"
        }`}
      >
        <Link
          href="/"
          className="font-bold text-xl text-[var(--accent-teal)] tracking-tighter"
          style={{ fontFamily: "var(--font-space), Georgia, serif" }}
        >
          ColorGrade
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-[var(--accent-teal)] p-2"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${
          mounted && mobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className="absolute inset-0 transition-all duration-300"
          style={{
            background: "rgba(10, 14, 26, 0.95)",
            backdropFilter: "blur(40px)",
            WebkitBackdropFilter: "blur(40px)",
          }}
          onClick={closeMobile}
        />

        <div
          className={`relative z-10 flex flex-col justify-center items-center h-full px-8 transition-all duration-300 ${
            mounted && mobileOpen
              ? "translate-y-0 opacity-100"
              : "translate-y-6 opacity-0"
          }`}
        >
          <nav className="flex flex-col items-center gap-8">
            {navLinks.map((link, i) => (
              <a
                key={link.href}
                href={link.href}
                onClick={closeMobile}
                className="text-2xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-300 tracking-wide font-semibold"
                style={{
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
              className={`iridescent-btn px-10 py-4 rounded-full font-bold text-sm transition-all duration-300 ${
                mounted && mobileOpen
                  ? "translate-y-0 opacity-100"
                  : "translate-y-4 opacity-0"
              }`}
              style={{ transitionDelay: mounted && mobileOpen ? "280ms" : "0ms" }}
            >
              Launch Editor
            </Link>
          </nav>
        </div>
      </div>
    </>
  );
}
