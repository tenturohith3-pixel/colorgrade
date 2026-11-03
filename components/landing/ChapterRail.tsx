"use client";

/**
 * Chapter rail — the story, always one click away.
 * Fixed scene menu on the right: dots for each scene, active state driven
 * by ScrollTrigger, clicking a dot smooth-scrolls through Lenis.
 */

import { useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/cn";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const SCENES = [
  { id: "scene-open", num: "01", label: "COLD OPEN" },
  { id: "scene-assembly", num: "02", label: "THE ASSEMBLY" },
  { id: "scene-grade", num: "03", label: "THE GRADE" },
  { id: "scene-palette", num: "04", label: "THE PALETTE" },
  { id: "scene-texture", num: "05", label: "TEXTURE & TONE" },
  { id: "scene-outro", num: "06", label: "YOUR FRAME" },
];

interface Lenisish {
  scrollTo: (target: string, opts?: { duration?: number; offset?: number }) => void;
}

export function ChapterRail() {
  const railRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const pathname = usePathname();

  useGSAP(
    () => {
      if (
        pathname.startsWith("/studio") ||
        pathname.startsWith("/admin") ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      )
        return;
      for (const [i, s] of SCENES.entries()) {
        const el = document.getElementById(s.id);
        if (!el) continue;
        ScrollTrigger.create({
          trigger: el,
          start: "top 55%",
          end: "bottom 45%",
          onToggle: (self) => self.isActive && setActive(i),
        });
      }
    },
    { dependencies: [pathname] },
  );

  const jump = (id: string) => {
    const lenis = (window as unknown as { __ecLenis?: Lenisish }).__ecLenis;
    if (lenis) lenis.scrollTo(`#${id}`, { duration: 1.4 });
    else document.getElementById(id)?.scrollIntoView({ block: "start" });
  };

  return (
    <aside
      ref={railRef}
      aria-label="Scenes"
      className="fixed right-5 top-1/2 -translate-y-1/2 z-40 hidden xl:flex flex-col gap-4"
    >
      {SCENES.map((s, i) => (
        <button
          key={s.id}
          onClick={() => jump(s.id)}
          className="group flex items-center justify-end gap-3"
        >
          <span
            className={cn(
              "mono-num text-[9px] tracking-[0.2em] transition-all duration-300",
              active === i
                ? "text-bronze-bright opacity-100"
                : "text-ink-faint opacity-0 group-hover:opacity-80",
            )}
          >
            {s.label}
          </span>
          <span
            className={cn(
              "block rounded-full transition-all duration-300",
              active === i
                ? "size-2.5 bg-bronze-bright shadow-[0_0_12px_rgba(201,160,106,0.6)]"
                : "size-1.5 bg-line group-hover:bg-bronze-bright/60",
            )}
          />
        </button>
      ))}
    </aside>
  );
}
