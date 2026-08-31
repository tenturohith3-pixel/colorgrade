"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface Props {
  children: React.ReactNode;
}

/**
 * GSAP ScrollTrigger Animations — Premium Editorial Style
 *
 * Refined, cinematic animations with stagger timing,
 * parallax depth, and smooth reveal choreography.
 */
export default function GSAPAnimations({ children }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // ── Hero entrance — staggered cinematic reveal ──
      const heroElements = document.querySelectorAll("[data-gsap='hero']");
      if (heroElements.length) {
        gsap.fromTo(
          heroElements,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.08,
            ease: "power3.out",
            delay: 0.2,
          }
        );
      }

      // ── Section reveals — smooth slide up with scale ──
      const sections = document.querySelectorAll("[data-gsap='section']");
      sections.forEach((section) => {
        gsap.fromTo(
          section,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out",
            scrollTrigger: {
              trigger: section,
              start: "top 85%",
              end: "top 20%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });

      // ── Card group reveals — staggered fade + scale ──
      const cardGroups = document.querySelectorAll("[data-gsap='cards']");
      cardGroups.forEach((group) => {
        const cards = group.querySelectorAll("[data-gsap='card']");
        gsap.fromTo(
          cards,
          { opacity: 0, y: 20, scale: 0.98 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.5,
            stagger: 0.06,
            ease: "power2.out",
            scrollTrigger: {
              trigger: group,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });

      // ── Parallax orbs — subtle depth movement ──
      const orbs = document.querySelectorAll("[data-gsap='orb']");
      orbs.forEach((orb, i) => {
        gsap.to(orb, {
          y: -80 - i * 25,
          ease: "none",
          scrollTrigger: {
            trigger: orb,
            start: "top bottom",
            end: "bottom top",
            scrub: 2,
          },
        });
      });

      // ── Card hover lift — subtle 3D effect ──
      const hoverCards = document.querySelectorAll("[data-gsap='hover-card']");
      hoverCards.forEach((card) => {
        const el = card as HTMLElement;
        el.addEventListener("mouseenter", () => {
          gsap.to(el, {
            y: -4,
            duration: 0.25,
            ease: "power2.out",
          });
        });
        el.addEventListener("mouseleave", () => {
          gsap.to(el, {
            y: 0,
            duration: 0.25,
            ease: "power2.out",
          });
        });
      });

      // ── Smooth counter animations ──
      const counters = document.querySelectorAll("[data-gsap='counter']");
      counters.forEach((counter) => {
        const el = counter as HTMLElement;
        const target = el.textContent || "";
        const numMatch = target.match(/\d+/);
        if (!numMatch) return;
        const num = parseInt(numMatch[0]);
        const suffix = target.replace(numMatch[0], "");
        const proxy = { val: 0 };

        gsap.to(proxy, {
          val: num,            duration: 1.2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
          onUpdate: () => {
            el.textContent = Math.round(proxy.val) + suffix;
          },
        });
      });

      // ── Line reveal animations ──
      const lines = document.querySelectorAll("[data-gsap='line']");
      lines.forEach((line) => {
        gsap.fromTo(
          line,
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: 1.2,
            ease: "power2.inOut",
            transformOrigin: "left center",
            scrollTrigger: {
              trigger: line,
              start: "top 90%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });

      // ── Text stagger — word by word reveal ──
      const textStaggers = document.querySelectorAll("[data-gsap='text-stagger']");
      textStaggers.forEach((container) => {
        const words = container.querySelectorAll("span");
        gsap.fromTo(
          words,
          { opacity: 0.15, y: 10 },
          {
            opacity: 1,
            y: 0,
            duration: 0.35,
            stagger: 0.02,
            ease: "power2.out",
            scrollTrigger: {
              trigger: container,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return <div ref={containerRef}>{children}</div>;
}
