"use client";

import Link from "next/link";
import { useState } from "react";
import { Download, LoaderCircle, Lock, AlertTriangle } from "lucide-react";
import { useLicense } from "@/hooks/useLicense";
import { hasRank } from "@/lib/license";

export function DownloadButton({ pluginId }: { pluginId: string }) {
  const { license, hydrated } = useLicense();
  const unlocked = hydrated && hasRank(license, "bundle");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  if (!unlocked) {
    return (
      <div className="space-y-2.5">
        <Link href="/pricing#bundle" className="btn-primary w-full justify-center gap-2">
          <Lock className="size-4" />
          Unlock with the Prism Bundle — $29
        </Link>
        <p className="mono-label !text-[8px] text-center !text-ink-faint">
          BUNDLE ALSO INCLUDED FREE WITH STUDIO &amp; LIFETIME
        </p>
      </div>
    );
  }

  const run = async () => {
    if (!license) return;
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch(`/api/plugins/${pluginId}/download?key=${encodeURIComponent(license.key)}`);
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? `Download blocked (HTTP ${res.status}).`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${pluginId}.wasm`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Download failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-2.5">
      <button onClick={run} disabled={busy} className={busy ? "btn-primary w-full justify-center gap-2 opacity-70" : "btn-primary w-full justify-center gap-2"}>
        {busy ? (
          <>
            <LoaderCircle className="size-4 animate-spin" /> Streaming…
          </>
        ) : (
          <>
            <Download className="size-4" />
            Download binary
          </>
        )}
      </button>
      {err ? (
        <p className="flex items-start gap-2 text-[12px] text-[#f05545]">
          <AlertTriangle className="size-3.5 mt-0.5 shrink-0" />
          {err}{" "}
          <Link href="/pricing" className="underline underline-offset-2">
            Fix activation
          </Link>
        </p>
      ) : null}
      <p className="mono-label !text-[8px] text-center !text-ink-faint">
        BUNDLE KEY ACTIVE — SERVER-VERIFIED PER DOWNLOAD
      </p>
    </div>
  );
}
