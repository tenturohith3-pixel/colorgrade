"use client";

/**
 *_site-wide scroll system:
 * - Lenis momentum smooth-scroll everywhere except the Studio/Admin apps
 *   (they have their own fixed tooling and must not be hijacked).
 * - GSAP ticker drives Lenis; ScrollTrigger re-syncs on every frame.
 */

import { useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const SKIP = ["/studio", "/admin"];

export function SmoothScroll({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const skip = SKIP.some((p) => pathname.startsWith(p));

  useEffect(() => {
    if (skip) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let lenis: Lenis | null = null;
    let raf: ((time: number) => void) | null = null;

    if (!reduced) {
      lenis = new Lenis({
        // buttery but responsive
        lerp: 0.09,
        wheelMultiplier: 1,
        smoothWheel: true,
      });
      raf = (time: number) => {
        lenis?.raf(time * 1000);
      };
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);
    }

    // Keep pin distances honest once fonts/images settle.
    const refresh = () => ScrollTrigger.refresh();
    const t1 = window.setTimeout(refresh, 300);
    const t2 = window.setTimeout(refresh, 900);
    document.fonts?.ready.then(() => ScrollTrigger.refresh()).catch(() => {});

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      if (raf) gsap.ticker.remove(raf);
      lenis?.destroy();
      ScrollTrigger.getAll().forEach((t) => t.kill());
      ScrollTrigger.refresh();
    };
  }, [skip, pathname]);

  return <>{children}</>;
}
