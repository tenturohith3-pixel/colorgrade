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
 * GSAP ScrollTrigger Animations — Editorial Style
 *
 * Refined, subtle animations. No flashy effects —
 * just smooth, cinematic reveals.
 */
export default function GSAPAnimations({ children }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // ── Hero entrance — refined fade up ──
      const heroElements = document.querySelectorAll("[data-gsap='hero']");
      if (heroElements.length) {
        gsap.fromTo(
          heroElements,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 1.4,
            stagger: 0.2,
            ease: "power2.out",
            delay: 0.3,
          }
        );
      }

      // ── Section reveals — smooth slide up ──
      const sections = document.querySelectorAll("[data-gsap='section']");
      sections.forEach((section) => {
        gsap.fromTo(
          section,
          { opacity: 0, y: 60 },
          {
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: "power2.out",
            scrollTrigger: {
              trigger: section,
              start: "top 88%",
              end: "top 20%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });

      // ── Card group reveals — staggered fade ──
      const cardGroups = document.querySelectorAll("[data-gsap='cards']");
      cardGroups.forEach((group) => {
        const cards = group.querySelectorAll("[data-gsap='card']");
        gsap.fromTo(
          cards,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.08,
            ease: "power2.out",
            scrollTrigger: {
              trigger: group,
              start: "top 82%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });

      // ── Parallax elements — subtle depth ──
      const orbs = document.querySelectorAll("[data-gsap='orb']");
      orbs.forEach((orb, i) => {
        gsap.to(orb, {
          y: -60 - i * 20,
          ease: "none",
          scrollTrigger: {
            trigger: orb,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.5,
          },
        });
      });

      // ── Pricing card hover — subtle lift ──
      const priceCards = document.querySelectorAll("[data-gsap='price-card']");
      priceCards.forEach((card) => {
        const el = card as HTMLElement;
        el.addEventListener("mouseenter", () => {
          gsap.to(el, {
            y: -4,
            duration: 0.4,
            ease: "power2.out",
          });
        });
        el.addEventListener("mouseleave", () => {
          gsap.to(el, {
            y: 0,
            duration: 0.4,
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
          val: num,
          duration: 2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            toggleActions: "play none none reverse",
          },
          onUpdate: () => {
            el.textContent = Math.round(proxy.val) + suffix;
          },
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return <div ref={containerRef}>{children}</div>;
}
