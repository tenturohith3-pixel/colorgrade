"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Clapperboard, Menu, X } from "lucide-react";
import { useLicense } from "@/hooks/useLicense";
import { TIER_LABEL } from "@/lib/license";
import { cn } from "@/lib/cn";

const LINKS = [
  { href: "/studio", label: "Studio" },
  { href: "/plugins", label: "Plugins" },
  { href: "/pricing", label: "Pricing" },
  { href: "/support", label: "Support" },
];

export function Nav() {
  const pathname = usePathname();
  const { license, hydrated } = useLicense();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  // The Studio and Admin have their own full-screen chrome — the global
  // nav would collide with their fixed toolbars. Option out there.
  if (pathname === "/studio" || pathname.startsWith("/admin")) return null;

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        scrolled || open
          ? "bg-bg/80 backdrop-blur-xl border-b border-line"
          : "bg-transparent border-b border-transparent",
      )}
    >
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="grid place-items-center size-8 rounded-lg border border-line bg-white/[0.04] group-hover:border-bronze/40 transition-colors">
            <Clapperboard className="size-4 text-bronze-bright" strokeWidth={1.75} />
          </span>
          <span className="display text-[15px] tracking-[0.14em] uppercase">
            EffectCraft
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "px-3.5 py-2 text-[13px] rounded-md transition-colors",
                pathname === l.href || pathname.startsWith(`${l.href}/`)
                  ? "text-ink"
                  : "text-ink-muted hover:text-ink",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {hydrated && license ? (
            <span className="pill-badge !py-1.5 !px-3 border-bronze/40 text-bronze-bright">
              <span className="size-1.5 rounded-full bg-bronze-bright inline-block" />
              {TIER_LABEL[license.tier]}
            </span>
          ) : null}
          <Link href="/studio" className="btn-primary !py-2 !px-4 text-[13px]">
            Launch Studio
          </Link>
        </div>

        <button
          className="md:hidden p-2 text-ink-muted hover:text-ink"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open ? (
        <div className="md:hidden border-t border-line bg-bg/95 backdrop-blur-xl">
          <div className="px-6 py-4 flex flex-col gap-1">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="py-2.5 text-sm text-ink-muted hover:text-ink border-b border-line/50"
              >
                {l.label}
              </Link>
            ))}
            <Link href="/studio" className="btn-primary mt-3 justify-center">
              Launch Studio
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
