"use client";

import { useState, useEffect } from "react";

export default function LoadingScreen() {
  const [visible, setVisible] = useState(true);
  const [phase, setPhase] = useState<"enter" | "hold" | "exit">("enter");

  useEffect(() => {
    const holdTimer = setTimeout(() => setPhase("hold"), 80);
    const exitTimer = setTimeout(() => setPhase("exit"), 1000);
    const removeTimer = setTimeout(() => setVisible(false), 1400);

    return () => {
      clearTimeout(holdTimer);
      clearTimeout(exitTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      style={{
        background: "var(--bg-deep)",
        opacity: phase === "exit" ? 0 : 1,
        transition: "opacity 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        pointerEvents: phase === "exit" ? "none" : "auto",
      }}
    >
      {/* Ambient gradient orb */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(6,148,148,0.08) 0%, transparent 70%)",
          filter: "blur(80px)",
          opacity: phase === "exit" ? 0 : 1,
          transition: "opacity 0.4s ease",
        }}
      />

      <div className="relative flex flex-col items-center">
        {/* Logo mark */}
        <div
          className="mb-6"
          style={{
            opacity: phase !== "enter" ? 1 : 0,
            transform: phase !== "enter" ? "translateY(0) scale(1)" : "translateY(10px) scale(0.96)",
            transition: "all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          }}
        >
          <div className="relative">
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: "radial-gradient(circle, rgba(6,148,148,0.18) 0%, transparent 70%)",
                filter: "blur(20px)",
                transform: "scale(3)",
              }}
            />
            <span
              className="relative text-4xl md:text-5xl tracking-tight text-[var(--text-primary)]"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
            >
              Color<span className="text-[var(--accent-teal)]">Grade</span>
            </span>
          </div>
        </div>

        {/* Tagline */}
        <div
          style={{
            opacity: phase === "exit" ? 0 : 1,
            transform: phase === "exit" ? "translateY(-6px)" : "translateY(0)",
            transition: "all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.05s",
          }}
        >
          <span
            className="text-[10px] tracking-[0.2em] uppercase"
            style={{ color: "var(--text-muted)" }}
          >
            Editorial Color Grading
          </span>
        </div>

        {/* Animated line reveal */}
        <div className="mt-6 h-px overflow-hidden" style={{ width: "120px" }}>
          <div
            style={{
              width: "100%",
              height: "100%",
              background: "linear-gradient(90deg, transparent, var(--accent-teal), transparent)",
              opacity: 0.5,
              transform: phase !== "enter" ? "scaleX(1)" : "scaleX(0)",
              transformOrigin: "center",
              transition: "transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.15s",
            }}
          />
        </div>
      </div>
    </div>
  );
}
