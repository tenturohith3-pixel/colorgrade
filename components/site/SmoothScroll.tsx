"use client";

/**
 *_site-wide scroll system:
 * - Lenis momentum smooth-scroll everywhere except the Studio/Admin apps
 *   (they have their own fixed tooling and must not be hijacked).
 * - GSAP ticker drives Lenis; ScrollTrigger re-syncs on every frame.
 */

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { loadSettings, SETTINGS_EVENT } from "@/lib/settings";

gsap.registerPlugin(ScrollTrigger);

const SKIP = ["/studio", "/admin"];

export function SmoothScroll({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const skip = SKIP.some((p) => pathname.startsWith(p));
  const [motionEpoch, setMotionEpoch] = useState(0);

  /* settings changes re-initialize (or dismantle) the scroller live */
  useEffect(() => {
    const bump = () => setMotionEpoch((k) => k + 1);
    window.addEventListener(SETTINGS_EVENT, bump);
    return () => window.removeEventListener(SETTINGS_EVENT, bump);
  }, []);

  useEffect(() => {
    if (skip) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const motionsOff = loadSettings().motion === "off";
    if (reduced || motionsOff) return;

    let lenis: Lenis | null = null;
    let raf: ((time: number) => void) | null = null;

    if (!reduced) {
      lenis = new Lenis({
        // buttery but responsive
        lerp: 0.09,
        wheelMultiplier: 1,
        smoothWheel: true,
      });
      // exposed for programmatic scene navigation
      (window as unknown as { __ecLenis?: Lenis }).__ecLenis = lenis;
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
  }, [skip, pathname, motionEpoch]);

  return <>{children}</>;
}
