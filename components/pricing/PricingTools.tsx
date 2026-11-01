"use client";

import { useState } from "react";
import { Sparkles, KeyRound, CheckCircle2, AlertTriangle } from "lucide-react";
import { KeyEntryModal } from "@/components/studio/KeyEntryModal";
import { buildLicense, generateKey, saveLicense, validateKey, TIER_LABEL, type Tier } from "@/lib/license";

export function PricingTools() {
  const [open, setOpen] = useState(false);
  const [hist, setHist] = useState<{ key: string; tier: Tier } | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const gen = (tier: Exclude<Tier, "basic">) => {
    const key = generateKey(tier);
    try {
      const v = validateKey(key);
      if (!v.ok) throw new Error("self-check failed");
    } catch {
      setErr("Key self-check failed — try again.");
      return;
    }
    saveLicense(buildLicense(tier, key));
    setHist({ key, tier });
    setErr(null);
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button onClick={() => setOpen(true)} className="btn-primary gap-2">
        <KeyRound className="size-4" />
        I have a key — activate
      </button>
      <div className="flex flex-wrap gap-2">
        {(["pro", "studio", "lifetime"] as const).map((t) => (
          <button
            key={t}
            onClick={() => gen(t)}
            className="btn-ghost !py-2 !px-4 text-[13px] gap-1.5"
          >
            <Sparkles className="size-3.5 text-bronze-bright" />
            Demo {TIER_LABEL[t]} key
          </button>
        ))}
      </div>

      {hist ? (
        <div className="w-full mono-num text-[12px] text-[#68c96a] rounded-lg border border-[#68c96a]/30 bg-[#68c96a]/[0.07] px-4 py-3 flex items-center gap-2">
          <CheckCircle2 className="size-3.5 shrink-0" />
          <span className="truncate">{hist.tier.toUpperCase()} — {hist.key}</span>
          <span className="ml-auto text-ink-faint hidden md:block shrink-0">active — restart Studio</span>
        </div>
      ) : null}
      {err ? (
        <p className="w-full mono-num text-[12px] text-[#f05545] flex items-center gap-2">
          <AlertTriangle className="size-3.5" /> {err}
        </p>
      ) : null}

      {open ? <KeyEntryModal onClose={() => setOpen(false)} /> : null}
    </div>
  );
}
