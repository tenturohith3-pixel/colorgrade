"use client";

import { useActionState } from "react";
import { Check, Copy, KeyRound, LoaderCircle, TriangleAlert } from "lucide-react";
import { useState } from "react";
import { mintKeyAction, type MintState } from "@/app/admin/actions";
import { TIER_LABEL, type Tier } from "@/lib/license";
import Link from "next/link";

const TIER_PRICES: { tier: Tier; price: string }[] = [
  { tier: "bundle", price: "$29" },
  { tier: "pro", price: "$9" },
  { tier: "studio", price: "$19" },
  { tier: "lifetime", price: "$59" },
];

function fmtDate(ms: number | null | undefined): string {
  if (!ms) return "never";
  return new Date(ms).toISOString().slice(0, 10);
}

export function AdminForge({
  pinSet,
  secretSet,
}: {
  pinSet: boolean;
  secretSet: boolean;
}) {
  const [state, action, pending] = useActionState(mintKeyAction, {} as MintState);
  const [copied, setCopied] = useState(false);
  const ready = pinSet && secretSet;

  return (
    <div className="space-y-6">
      {!ready ? (
        <div className="glass p-6 border-[#f05545]/30 space-y-3">
          <p className="flex items-center gap-2 text-sm text-[#f05545]">
            <TriangleAlert className="size-4" /> Setup required — minting is disabled.
          </p>
          <ol className="text-[13px] text-ink-muted space-y-2 list-decimal pl-5">
            <li>
              Vercel → your project (ezcc) → Settings → Environment Variables.
            </li>
            <li>
              Add <code className="mono-num text-bronze-bright">ADMIN_PIN</code> — your
              private PIN (min 6 chars). Share it only with people allowed to mint keys.
            </li>
            <li>
              Add <code className="mono-num text-bronze-bright">LICENSE_SECRET</code> — a long
              random string (min 16 chars, e.g. <code>openssl rand -hex 24</code>).
            </li>
            <li>Redeploy (any push or “Redeploy” in the dashboard). Reload this page.</li>
          </ol>
          <p className="mono-label !text-[9px]">
            CURRENTLY: ADMIN_PIN {pinSet ? "✓ SET" : "✗ MISSING"} · LICENSE_SECRET{" "}
            {secretSet ? "✓ SET" : "✗ MISSING"}
          </p>
        </div>
      ) : null}

      <form action={action} className="glass p-7 md:p-9 space-y-5">
        <div>
          <p className="mono-label">KEY FORGE</p>
          <h2 className="display text-2xl mt-2">Mint a license key</h2>
          <p className="text-[13px] text-ink-muted mt-1.5">
            Keys are HMAC-signed with the server secret. Nothing else can produce a valid one.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className="block md:col-span-1">
            <span className="mono-label !text-[9px] block mb-2">ADMIN PIN</span>
            <input
              type="password"
              name="pin"
              autoComplete="off"
              required
              className="w-full rounded-lg bg-black/40 border border-line px-4 py-3 text-sm outline-none focus:border-bronze/50"
            />
          </label>
          <label className="block">
            <span className="mono-label !text-[9px] block mb-2">TIER</span>
            <select
              name="tier"
              defaultValue="pro"
              className="w-full rounded-lg bg-black/40 border border-line px-4 py-3 text-sm outline-none focus:border-bronze/50 [&>option]:bg-bg-raised"
            >
              {TIER_PRICES.map((t) => (
                <option key={t.tier} value={t.tier}>
                  {TIER_LABEL[t.tier]} — {t.price}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mono-label !text-[9px] block mb-2">CUSTOMER (OPTIONAL)</span>
            <input
              name="name"
              placeholder="who it’s for"
              maxLength={80}
              className="w-full rounded-lg bg-black/40 border border-line px-4 py-3 text-sm outline-none focus:border-bronze/50 placeholder:text-ink-faint"
            />
          </label>
        </div>

        {state?.error ? (
          <p className="text-[13px] text-[#f05545]">{state.error}</p>
        ) : null}

        <button
          type="submit"
          disabled={pending || !ready}
          className="btn-primary w-full justify-center gap-2 disabled:opacity-50"
        >
          {pending ? (
            <>
              <LoaderCircle className="size-4 animate-spin" /> Signing…
            </>
          ) : (
            <>
              <KeyRound className="size-4" /> Mint key
            </>
          )}
        </button>
        <p className="mono-label !text-[8px] text-center !text-ink-faint">
          RATE-LIMITED · TIMING-SAFE PIN CHECK · SECRET NEVER LEAVES THE SERVER
        </p>
      </form>

      {state?.ok && state.key ? (
        <div className="glass p-7 border-[#68c96a]/30 space-y-4">
          <p className="flex items-center gap-2 text-sm text-[#68c96a]">
            <Check className="size-4" />
            Key minted{state.name ? ` for ${state.name}` : ""}.
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <code className="mono-num text-lg md:text-xl text-bronze-bright tracking-wider select-all">
              {state.key}
            </code>
            <button
              onClick={async () => {
                await navigator.clipboard.writeText(state.key ?? "");
                setCopied(true);
                setTimeout(() => setCopied(false), 1600);
              }}
              className="btn-ghost !py-2 !px-3 gap-1.5 text-[12px]"
            >
              {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              {copied ? "copied" : "copy"}
            </button>
          </div>
          <p className="mono-num text-[11px] text-ink-muted">
            {TIER_LABEL[state.tier ?? "pro"]} · issued{" "}
            {fmtDate(state.issuedAt)} · expires {fmtDate(state.expiresAt)}
          </p>
          <p className="text-[12px] text-ink-faint">
            Send the key to the customer — they activate it in Studio (top-right badge) or on
            the pricing page.{" "}
            <Link href="/studio" className="text-bronze-bright/80 hover:text-bronze-bright">
              Open Studio to test it →
            </Link>
          </p>
        </div>
      ) : null}
    </div>
  );
}
