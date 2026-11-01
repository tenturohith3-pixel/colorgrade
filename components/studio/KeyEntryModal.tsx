"use client";

import { useState } from "react";
import { KeyRound, CheckCircle2, AlertTriangle, Sparkles } from "lucide-react";
import { useLicense } from "@/hooks/useLicense";
import { buildLicense, generateKey, saveLicense, TIER_LABEL, type Tier } from "@/lib/license";

export function KeyEntryModal({ onClose }: { onClose: () => void }) {
  const { activate, license, deactivate } = useLicense();
  const [input, setInput] = useState("");
  const [result, setResult] = useState<
    { ok: boolean; tier?: Tier; key?: string; error?: string } | null
  >(null);

  const activateDemo = (tier: Exclude<Tier, "basic">) => {
    const key = generateKey(tier);
    saveLicense(buildLicense(tier, key));
    setResult({ ok: true, tier, key, });
    window.setTimeout(onClose, 700);
  };

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-line bg-bg-raised shadow-2xl overflow-hidden">
        <header className="px-6 py-5 border-b border-line flex items-center justify-between">
          <div>
            <h2 className="display text-lg">Activate a key</h2>
            <p className="mono-label !text-[9px] mt-1">CLIENT-VERIFIED — DEMO BUILD</p>
          </div>
          <button onClick={onClose} className="text-ink-muted hover:text-ink text-xl" aria-label="Close">
            ×
          </button>
        </header>

        <div className="px-6 py-5 space-y-4">
          <div className="flex items-center gap-2.5">
            <KeyRound className="size-4 text-bronze-bright" />
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="EC—XXXX-XXXX-XXXX-XXXX-X"
              spellCheck={false}
              className="flex-1 rounded-lg bg-black/30 border border-line px-4 py-3 text-sm font-mono tracking-wider placeholder:text-ink-faint focus:border-bronze/50 outline-none"
            />
          </div>

          {result ? (
            <p
              className={
                result.ok
                  ? "flex items-center gap-2 text-[12px] text-[#68c96a]"
                  : "flex items-center gap-2 text-[12px] text-[#f05545]"
              }
            >
              {result.ok ? <CheckCircle2 className="size-3.5" /> : <AlertTriangle className="size-3.5" />}
              {result.ok
                ? `Key valid — ${TIER_LABEL[result.tier ?? "pro"]} unlocked.`
                : result.error}
            </p>
          ) : null}

          {license ? (
            <p className="mono-num text-[11px] text-ink-muted">
              Active — {TIER_LABEL[license.tier]} · {license.key}
            </p>
          ) : null}

          <button
            onClick={() => {
              const r = activate(input);
              setResult(r);
              if (r.ok) {
                window.setTimeout(onClose, 700);
              }
            }}
            className="btn-primary w-full justify-center"
          >
            Validate & activate
          </button>

          <div className="hairline" />

          <div className="flex flex-col gap-2">
            <p className="mono-label !text-[9px]">Demo keys — generate locally</p>
            <div className="grid grid-cols-2 gap-2">
              {(["pro", "studio"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => activateDemo(t)}
                  className="btn-ghost !py-2 text-[12px] justify-center gap-1.5"
                >
                  <Sparkles className="size-3.5 text-bronze-bright" />
                  {TIER_LABEL[t]} demo
                </button>
              ))}
            </div>
            <p className="text-[10px] text-ink-faint leading-relaxed">
              In this build keys are verified client-side. Wire Stripe +
              delivery to sell real ones — see the pricing page docs.
            </p>
          </div>

          {license ? (
            <button onClick={deactivate} className="text-[12px] text-ink-faint hover:text-ink w-full text-center">
              Deactivate current key
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
