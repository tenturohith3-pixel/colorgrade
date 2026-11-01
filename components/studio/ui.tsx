"use client";

import { Lock } from "lucide-react";
import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  accent = false,
  disabled = false,
  locked = false,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  accent?: boolean;
  disabled?: boolean;
  locked?: boolean;
}) {
  return (
    <div className={cn("group", disabled && "opacity-40 pointer-events-none")}>
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-[12px] flex items-center gap-1.5 text-ink-muted">
          {locked ? <Lock className="size-3 text-bronze-bright/80" /> : null}
          {label}
        </span>
        <button
          type="button"
          onClick={() => onChange(0)}
          onDoubleClick={() => onChange(0)}
          className="mono-num text-[11px] text-ink-faint tabular-nums hover:text-bronze-bright transition-colors"
          title="Click to zero"
        >
          {value > 0 && min < 0 ? "+" : ""}
          {Math.round(value * 10) / 10}
        </button>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={cn("w-full", accent && "accent-bronze")}
        aria-label={label}
      />
    </div>
  );
}

export function Panel({
  title,
  side,
  children,
  className,
}: {
  title: string;
  side?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("px-5 py-5 border-b border-line last:border-b-0", className)}>
      <header className="flex items-center justify-between mb-4">
        <h3 className="mono-label">{title}</h3>
        {side}
      </header>
      {children}
    </section>
  );
}

export function TierLock({ hint }: { hint: string }) {
  return (
    <p className="mt-4 rounded-lg bg-bronze/[0.06] border border-bronze/20 px-3 py-2 text-[11px] text-bronze-bright/90 leading-snug">
      {hint}
    </p>
  );
}
