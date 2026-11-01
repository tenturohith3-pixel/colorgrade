"use client";

import Link from "next/link";
import { Lock, Palette } from "lucide-react";
import { Panel } from "./ui";
import { cn } from "@/lib/cn";
import { LOOKS } from "@/lib/grade/looks";
import { Slider } from "./ui";
import type { Tier } from "@/lib/license";

const LOCK_RANK: Record<"free" | "pro" | "studio", number> = {
  free: 0,
  pro: 1,
  studio: 2,
};

export function LooksRail({
  activeLook,
  lookIntensity,
  onSelect,
  onIntensity,
  tier,
}: {
  activeLook: string;
  lookIntensity: number;
  onSelect: (id: string) => void;
  onIntensity: (v: number) => void;
  tier: Tier;
}) {
  const rank = tier === "lifetime" ? 3 : tier === "studio" ? 2 : tier === "pro" ? 1 : 0;

  return (
    <Panel title="Film Looks">
      <ul className="mt-1 space-y-1">
        {LOOKS.map((look) => {
          const locked = LOCK_RANK[look.locked] > rank;
          return (
            <li key={look.id}>
              <button
                onClick={() => !locked && onSelect(look.id)}
                className={cn(
                  "w-full text-left px-3.5 py-2.5 rounded-lg border transition-all duration-150 flex items-center justify-between gap-2 group",
                  activeLook === look.id
                    ? "border-bronze/50 bg-bronze/10"
                    : "border-transparent hover:bg-white/[0.03] hover:border-line",
                  locked && "opacity-45",
                )}
              >
                <span className="flex items-center gap-2.5 min-w-0">
                  <Palette
                    className={cn(
                      "size-3.5 shrink-0",
                      activeLook === look.id ? "text-bronze-bright" : "text-ink-faint",
                    )}
                    strokeWidth={1.5}
                  />
                  <span className="text-[13px] truncate">{look.name}</span>
                </span>
                {locked ? (
                  <Lock className="size-3 text-bronze-bright/80 shrink-0" />
                ) : (
                  <span className={cn(
                    "text-[10px] shrink-0",
                    activeLook === look.id ? "text-bronze-bright" : "text-ink-faint group-hover:text-ink-muted",
                  )}>
                    {look.tag}
                  </span>
                )}
              </button>
              {locked ? (
                <p className="px-3.5 pb-0.5 -mt-1 text-[10px] text-ink-faint">
                  {look.locked === "pro" ? "Pro key" : "Studio key"} —{" "}
                  <Link href="/pricing" className="text-bronze-bright/80 hover:text-bronze-bright underline-offset-2 hover:underline">
                    unlock
                  </Link>
                </p>
              ) : null}
            </li>
          );
        })}
      </ul>

      <div className="mt-4 pt-4 border-t border-line">
        <Slider
          label="Look intensity"
          min={0}
          max={100}
          value={lookIntensity}
          onChange={onIntensity}
          accent
        />
      </div>
    </Panel>
  );
}
