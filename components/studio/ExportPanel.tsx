"use client";

import { useMemo, useState } from "react";
import { Download, LoaderCircle, AlertTriangle, CheckCircle2 } from "lucide-react";
import { TIER_LABEL, TIER_MAX_EXPORT, type Tier } from "@/lib/license";

export interface ExportTarget {
  w: number;
  h: number;
  longEdge: number;
}

export function ExportPanel({
  sourceDims,
  tier,
  onClose,
  onExport,
}: {
  sourceDims: { w: number; h: number } | null;
  tier: Tier;
  onClose: () => void;
  onExport: (t: { format: "png" | "jpeg"; quality: number; maxLongEdge: number }) => Promise<void>;
}) {
  const [format, setFormat] = useState<"png" | "jpeg">("jpeg");
  const [quality, setQuality] = useState(92);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<
    { kind: "ok" | "err"; msg: string } | null
  >(null);

  const maxLong = TIER_MAX_EXPORT[tier] ?? 1920;
  const srcLong = useMemo(() => {
    if (!sourceDims) return 0;
    return Math.max(sourceDims.w, sourceDims.h);
  }, [sourceDims]);

  const options = useMemo(() => {
    const out: { label: string; long: number; disabled: boolean; note: string }[] = [];
    const push = (label: string, long: number) => {
      out.push({
        label,
        long,
        disabled: long > maxLong || (srcLong > 0 && long > srcLong),
        note:
          long > maxLong
            ? `${tier === "basic" ? "Pro" : tier === "pro" ? "Studio/Lifetime" : "Lifetime"} unlocks`
            : srcLong > 0 && long > srcLong
              ? "larger than source"
              : "",
      });
    };
    push("1920 × HD", 1920);
    push("2560 × 2K", 2560);
    push("3840 × 4K", 3840);
    push("Source max", 7680);
    return out;
  }, [maxLong, srcLong, tier]);

  const selected = options.find(
    (o) => o.long === Math.min(maxLong, srcLong || maxLong) && !o.disabled,
  ) ?? options.find((o) => !o.disabled) ?? options[0];

  const [choiceLong, setChoiceLong] = useState<number | null>(null);
  const active = choiceLong ?? selected?.long ?? 1920;

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-line bg-bg-raised shadow-2xl overflow-hidden" id="export">
        <header className="px-6 py-5 border-b border-line flex items-center justify-between">
          <div>
            <h2 className="display text-lg">Export still</h2>
            <p className="mono-label !text-[9px] mt-1">
              {TIER_LABEL[tier]} PLAN — MAX {maxLong >= 7680 ? "SOURCE ×4K+" : maxLong}
            </p>
          </div>
          <button onClick={onClose} className="text-ink-muted hover:text-ink text-xl" aria-label="Close">
            ×
          </button>
        </header>

        <div className="px-6 py-5 space-y-5">
          {sourceDims ? (
            <p className="mono-num text-[11px] text-ink-faint">
              SOURCE — {sourceDims.w} × {sourceDims.h}
            </p>
          ) : null}

          <div>
            <p className="text-[12px] text-ink-muted mb-2">Resolution</p>
            <div className="grid grid-cols-2 gap-2">
              {options.map((o) => (
                <button
                  key={o.label}
                  disabled={o.disabled}
                  onClick={() => setChoiceLong(o.long)}
                  className={
                    o.disabled
                      ? "rounded-lg border border-line px-3 py-2.5 text-left opacity-35 cursor-not-allowed"
                      : active === o.long
                        ? "rounded-lg border border-bronze/60 bg-bronze/10 px-3 py-2.5 text-left"
                        : "rounded-lg border border-line px-3 py-2.5 text-left hover:border-line-strong"
                  }
                >
                  <span className="text-[13px] block">{o.label}</span>
                  <span className="text-[10px] text-ink-faint block mt-0.5">
                    {o.disabled ? o.note : "available"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[12px] text-ink-muted mb-2">Format</p>
            <div className="flex gap-2">
              {(["jpeg", "png"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={
                    format === f
                      ? "flex-1 rounded-lg border border-bronze/60 bg-bronze/10 py-2 text-[13px] uppercase"
                      : "flex-1 rounded-lg border border-line py-2 text-[13px] uppercase text-ink-muted hover:border-line-strong"
                  }
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {format === "jpeg" ? (
            <SliderBlock quality={quality} setQuality={setQuality} />
          ) : null}

          {status ? (
            <p
              className={
                status.kind === "ok"
                  ? "flex items-center gap-2 text-[12px] text-[#68c96a]"
                  : "flex items-center gap-2 text-[12px] text-[#f05545]"
              }
            >
              {status.kind === "ok" ? <CheckCircle2 className="size-3.5" /> : <AlertTriangle className="size-3.5" />}
              {status.msg}
            </p>
          ) : null}
        </div>

        <footer className="px-6 py-4 border-t border-line">
          <button
            disabled={busy || !sourceDims}
            onClick={async () => {
              setBusy(true);
              setStatus(null);
              try {
                await onExport({
                  format,
                  quality: quality / 100,
                  maxLongEdge: active,
                });
                setStatus({ kind: "ok", msg: "Exported — check your downloads." });
              } catch (err) {
                setStatus({
                  kind: "err",
                  msg: err instanceof Error ? err.message : "Export failed.",
                });
              } finally {
                setBusy(false);
              }
            }}
            className={busy ? "btn-primary w-full justify-center opacity-70" : "btn-primary w-full justify-center gap-2"}
          >
            {busy ? (
              <>
                <LoaderCircle className="size-4 animate-spin" /> Compositing…
              </>
            ) : (
              <>
                <Download className="size-4" /> Render & download
              </>
            )}
          </button>
          <p className="mono-label !text-[8px] mt-3 text-center !text-ink-faint">
            DETERMINISTIC RENDER — SEED LOCKED — UPLOADS 0
          </p>
          <button onClick={onClose} className="sr-only">close</button>
        </footer>
      </div>
    </div>
  );
}

function SliderBlock({
  quality,
  setQuality,
}: {
  quality: number;
  setQuality: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-[12px] text-ink-muted">Quality</span>
        <span className="mono-num text-[11px] text-ink-faint">{quality}%</span>
      </div>
      <input
        type="range"
        min={40}
        max={100}
        value={quality}
        onChange={(e) => setQuality(Number(e.target.value))}
        aria-label="JPEG quality"
      />
    </div>
  );
}
