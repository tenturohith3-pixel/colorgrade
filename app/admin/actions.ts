"use server";

import { createHash, timingSafeEqual } from "node:crypto";
import { headers } from "next/headers";
import { mintKey, type MintedKey } from "@/lib/license-server";
import { rateLimit } from "@/lib/rate-limit";
import type { Tier } from "@/lib/license";

export interface MintState {
  ok?: boolean;
  error?: string;
  key?: string;
  tier?: Tier;
  issuedAt?: number;
  expiresAt?: number | null;
  name?: string;
}

const MINTABLE: MintedKey["tier"][] = ["bundle", "pro", "studio", "lifetime"];

function pinMatches(input: string, expected: string): boolean {
  const a = createHash("sha256").update(input).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

export async function mintKeyAction(_prev: MintState, formData: FormData): Promise<MintState> {
  const adminPin = process.env.ADMIN_PIN;
  const secret = process.env.LICENSE_SECRET;

  if (!adminPin || adminPin.length < 6) {
    return {
      error:
        "ADMIN_PIN is not set — add it in Vercel → Settings → Environment Variables (minimum 6 characters), then redeploy.",
    };
  }
  if (!secret || secret.length < 16) {
    return {
      error:
        "LICENSE_SECRET is not set — add it in Vercel → Settings → Environment Variables (minimum 16 characters), then redeploy.",
    };
  }

  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "local").split(",")[0]?.trim() || "local";
  const rl = rateLimit(`admin|${ip}`, 10, 60_000);
  if (!rl.ok) {
    return { error: "Too many attempts — wait a minute and try again." };
  }

  const pin = String(formData.get("pin") ?? "");
  if (!pinMatches(pin, adminPin)) {
    return { error: "Wrong PIN." };
  }

  const tier = String(formData.get("tier") ?? "") as MintState["tier"];
  if (!tier || !MINTABLE.includes(tier as MintedKey["tier"])) {
    return { error: "Pick a tier to mint." };
  }

  const name = String(formData.get("name") ?? "").trim().slice(0, 80);

  try {
    const minted = mintKey(tier as MintedKey["tier"]);
    return {
      ok: true,
      key: minted.key,
      tier,
      issuedAt: minted.issuedAt,
      expiresAt: minted.expiresAt,
      name,
    };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Minting failed." };
  }
}
