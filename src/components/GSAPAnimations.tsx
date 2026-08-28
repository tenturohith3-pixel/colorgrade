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
 * GSAP ScrollTrigger Animations
 *
 * Provides scroll-triggered reveal animations for all sections.
 * Uses GSAP ScrollTrigger for precision timing and easing.
 */
export default function GSAPAnimations({ children }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // ── Hero entrance ──
      const heroElements = document.querySelectorAll("[data-gsap='hero']");
      if (heroElements.length) {
        gsap.fromTo(
          heroElements,
          { opacity: 0, y: 60, filter: "blur(10px)" },
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 1.2,
            stagger: 0.15,
            ease: "power3.out",
            delay: 0.2,
          }
        );
      }

      // ── Section reveals ──
      const sections = document.querySelectorAll("[data-gsap='section']");
      sections.forEach((section) => {
        gsap.fromTo(
          section,
          { opacity: 0, y: 80 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
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

      // ── Card stagger reveals ──
      const cardGroups = document.querySelectorAll("[data-gsap='cards']");
      cardGroups.forEach((group) => {
        const cards = group.querySelectorAll("[data-gsap='card']");
        gsap.fromTo(
          cards,
          { opacity: 0, y: 50, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.7,
            stagger: 0.1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: group,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });

      // ── Parallax gradient orbs ──
      const orbs = document.querySelectorAll("[data-gsap='orb']");
      orbs.forEach((orb, i) => {
        gsap.to(orb, {
          y: -100 - i * 30,
          ease: "none",
          scrollTrigger: {
            trigger: orb,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        });
      });

      // ── Text gradient animation on scroll ──
      const gradientTexts = document.querySelectorAll("[data-gsap='gradient-text']");
      gradientTexts.forEach((text) => {
        gsap.fromTo(
          text,
          { backgroundPosition: "200% center" },
          {
            backgroundPosition: "0% center",
            duration: 1.5,
            ease: "power2.out",
            scrollTrigger: {
              trigger: text,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });

      // ── Pricing card hover tilt ──
      const priceCards = document.querySelectorAll("[data-gsap='price-card']");
      priceCards.forEach((card) => {
        const el = card as HTMLElement;
        el.addEventListener("mouseenter", () => {
          gsap.to(el, {
            y: -8,
            scale: 1.02,
            duration: 0.3,
            ease: "power2.out",
          });
        });
        el.addEventListener("mouseleave", () => {
          gsap.to(el, {
            y: 0,
            scale: 1,
            duration: 0.3,
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
            start: "top 85%",
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
