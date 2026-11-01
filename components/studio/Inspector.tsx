"use client";

import { useCallback, useRef } from "react";
import { Ruler } from "lucide-react";
import { Panel, Slider, TierLock } from "./ui";
import { cn } from "@/lib/cn";
import {
  HSL_BANDS,
  HSL_BAND_COLORS,
  type GradeParams,
  type HslBandKey,
} from "@/lib/grade/params";
import type { Tier } from "@/lib/license";

export interface InspectorProps {
  params: GradeParams;
  patch: (p: Partial<GradeParams>) => void;
  tier: Tier;
  hasKey: boolean;
  cubeName: string | null;
  onCubeFile: (file: File) => void;
  clearCube: () => void;
}

/* ── Primary ───────────────────────────────────── */

export function PrimaryPanel({ params, patch }: { params: GradeParams; patch: InspectorProps["patch"] }) {
  return (
    <Panel title="Primary">
      <div className="space-y-4">
        <Slider label="Exposure" value={params.exposure} min={-100} max={100} onChange={(v) => patch({ exposure: v })} />
        <Slider label="Contrast" value={params.contrast} min={-100} max={100} onChange={(v) => patch({ contrast: v })} />
        <Slider label="Saturation" value={params.saturation} min={-100} max={100} onChange={(v) => patch({ saturation: v })} />
        <Slider label="Brightness" value={params.brightness} min={-100} max={100} onChange={(v) => patch({ brightness: v })} />
        <Slider label="Temperature" value={params.temperature} min={-100} max={100} onChange={(v) => patch({ temperature: v })} />
        <Slider label="Tint" value={params.tint} min={-100} max={100} onChange={(v) => patch({ tint: v })} />
      </div>
    </Panel>
  );
}

/* ── 3-Way wheels ──────────────────────────────── */

type WheelKey = "lift" | "gamma" | "gain";

const WHEELS: { key: WheelKey; label: string }[] = [
  { key: "lift", label: "Shadows" },
  { key: "gamma", label: "Midtones" },
  { key: "gain", label: "Highlights" },
];

export function WheelsPanel({
  params,
  patch,
  hasKey,
}: {
  params: GradeParams;
  patch: InspectorProps["patch"];
  hasKey: boolean;
}) {
  const proOk = hasKey; // wheels are Pro+
  return (
    <Panel
      title="Color Wheels"
      side={
        <span className="mono-label !text-[9px] !text-bronze-bright/80">
          {proOk ? "PRO" : "PRO LOCK"}
        </span>
      }
    >
      <div className={cn("grid grid-cols-3 gap-3", !proOk && "opacity-40")}>
        {WHEELS.map((w) => (
          <Wheel
            key={w.key}
            label={w.label}
            hue={
              w.key === "lift"
                ? params.liftHue
                : w.key === "gamma"
                  ? params.gammaHue
                  : params.gainHue
            }
            sat={
              w.key === "lift"
                ? params.liftSat
                : w.key === "gamma"
                  ? params.gammaSat
                  : params.gainSat
            }
            onChange={(hue, sat) =>
              patch(
                w.key === "lift"
                  ? { liftHue: hue, liftSat: sat }
                  : w.key === "gamma"
                    ? { gammaHue: hue, gammaSat: sat }
                    : { gainHue: hue, gainSat: sat },
              )
            }
            disabled={!proOk}
          />
        ))}
      </div>
      {!proOk ? (
        <TierLock hint="3-Way wheels + HSL isolation unlock with a Pro key." />
      ) : null}
    </Panel>
  );
}

function Wheel({
  label,
  hue,
  sat,
  onChange,
  disabled,
}: {
  label: string;
  hue: number;
  sat: number;
  onChange: (hue: number, sat: number) => void;
  disabled?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);

  const update = useCallback(
    (clientX: number, clientY: number) => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const x = clamp(((clientX - r.left) / r.width) * 2 - 1, -1, 1);
      const y = clamp(((clientY - r.top) / r.height) * 2 - 1, -1, 1);
      onChange(clamp(x * 100, -100, 100), clamp(-y * 100, -100, 100));
    },
    [onChange],
  );

  const dotX = hue / 2; // −50..50 px within 100px wheel (percent)
  const dotY = -sat / 2;

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        ref={ref}
        role="slider"
        aria-label={`${label} wheel`}
        aria-valuenow={hue}
        className={cn(
          "relative w-full aspect-square rounded-full border border-line overflow-hidden touch-none",
          disabled ? "cursor-not-allowed" : "cursor-crosshair",
        )}
        style={{
          background:
            "conic-gradient(from 0deg, #f05545, #f07f3e, #eecb4a, #68c96a, #4ecfd6, #4d8ef0, #8a6cf0, #e866c4, #f05545)",
          filter: "saturate(.66) brightness(.8)",
        }}
        onPointerDown={(e) => {
          if (disabled) return;
          dragging.current = true;
          (e.target as Element).setPointerCapture?.(e.pointerId);
          update(e.clientX, e.clientY);
        }}
        onPointerMove={(e) => {
          if (!dragging.current || disabled) return;
          update(e.clientX, e.clientY);
        }}
        onPointerUp={() => (dragging.current = false)}
        onPointerCancel={() => (dragging.current = false)}
        onDoubleClick={() => onChange(0, 0)}
      >
        <div className="absolute inset-[30%] rounded-full bg-bg-raised/95 border border-line" />
        <div
          className="absolute size-3 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)] border border-black/60"
          style={{
            left: `calc(${50 + dotX}% - 6px)`,
            top: `calc(${50 + dotY}% - 6px)`,
          }}
        />
      </div>
      <span className="text-[11px] text-ink-muted">{label}</span>
    </div>
  );
}

/* ── HSL bands ─────────────────────────────────── */

export function HslPanel({
  params,
  patch,
  hasKey,
}: {
  params: GradeParams;
  patch: InspectorProps["patch"];
  hasKey: boolean;
}) {
  return (
    <Panel
      title="HSL Isolation"
      side={
        <span className="mono-label !text-[9px] !text-bronze-bright/80">
          {hasKey ? "PRO" : "PRO LOCK"}
        </span>
      }
    >
      <div className={cn("space-y-5", !hasKey && "opacity-40 pointer-events-none")}>
        {HSL_BANDS.map((band) => {
          const val = params.hsl[band];
          const safe = val ?? { h: 0, s: 0, l: 0 };
          const set = (partial: Partial<GradeParams["hsl"][HslBandKey]>) =>
            patch({
              hsl: {
                ...params.hsl,
                [band]: { h: safe.h, s: safe.s, l: safe.l, ...partial },
              },
            });
          return (
            <div key={band} className="rounded-xl border border-line p-3.5">
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="size-2.5 rounded-full"
                  style={{ background: HSL_BAND_COLORS[band] }}
                />
                <span className="text-[12px] capitalize text-ink">{band}</span>
              </div>
              <div className="space-y-2.5">
                <Slider label="Hue" min={-100} max={100} value={safe.h} onChange={(v) => set({ h: v })} />
                <Slider label="Sat" min={-100} max={100} value={safe.s} onChange={(v) => set({ s: v })} />
                <Slider label="Lum" min={-100} max={100} value={safe.l} onChange={(v) => set({ l: v })} />
              </div>
            </div>
          );
        })}
      </div>
      {!hasKey ? (
        <TierLock hint="Per-band hue / saturation / luminance — a Pro feature." />
      ) : null}
    </Panel>
  );
}

/* ── FX ────────────────────────────────────────── */

export function FxPanel({
  params,
  patch,
  tier,
  hasKey,
  cubeName,
  onCubeFile,
  clearCube,
}: InspectorProps) {
  const studioOk = tier === "studio" || tier === "lifetime";
  const proLutsOk = hasKey;
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <Panel
      title="Effects & Delivery"
      side={
        <span className="mono-label !text-[9px] !text-bronze-bright/80">
          {studioOk ? "STUDIO" : "STUDIO LOCK"}
        </span>
      }
    >
      <div className="space-y-4">
        <div className={cn(!proLutsOk && "opacity-40 pointer-events-none")}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] text-ink-muted flex items-center gap-1.5">
              <Ruler className="size-3" /> .cube 3D LUT
            </span>
            {cubeName && proLutsOk ? (
              <button
                onClick={clearCube}
                className="text-[11px] text-ink-faint hover:text-ink"
              >
                clear
              </button>
            ) : null}
          </div>
          {cubeName ? (
            <p className="text-[11px] text-bronze-bright truncate">▲ {cubeName}</p>
          ) : (
            <button
              onClick={() => proLutsOk && inputRef.current?.click()}
              className="w-full rounded-lg border border-dashed border-line-strong px-3 py-2.5 text-[12px] text-ink-muted hover:text-ink hover:border-bronze/40 transition-colors"
            >
              {proLutsOk ? "Import .cube (Pro)" : "Import .cube — Pro lock"}
            </button>
          )}
          <input
            ref={inputRef}
            type="file"
            accept=".cube,.CUBE,.Cube"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onCubeFile(f);
              e.target.value = "";
            }}
          />
        </div>

        <div className={cn(!studioOk && "opacity-40 pointer-events-none")}>
          <div className="pt-2 space-y-4">
            <Slider label="Film grain" min={0} max={100} value={params.filmGrain} onChange={(v) => patch({ filmGrain: v })} locked={!studioOk} />
            <Slider label="Halation" min={0} max={100} value={params.halation} onChange={(v) => patch({ halation: v })} locked={!studioOk} />
            <Slider label="Bloom" min={0} max={100} value={params.bloom} onChange={(v) => patch({ bloom: v })} locked={!studioOk} />
            <Slider label="HDR curve" min={0} max={100} value={params.hdr} onChange={(v) => patch({ hdr: v })} locked={!studioOk} />
            <Slider label="Highlight recovery" min={0} max={100} value={params.highlightRecovery} onChange={(v) => patch({ highlightRecovery: v })} locked={!studioOk} />
            <Slider label="Vignette" min={0} max={100} value={params.vignette} onChange={(v) => patch({ vignette: v })} />
          </div>
          {!studioOk ? (
            <TierLock hint="Grain, halation, bloom and HDR ride with a Studio key." />
          ) : null}
        </div>
      </div>
    </Panel>
  );
}
