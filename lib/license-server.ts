/**
 * EffectCraft — server-side key minting & validation.
 *
 * Keys are stateless but unforgeable: an HMAC-SHA256 tag (seeded by
 * LICENSE_SECRET, which lives only in server env) covers the tier, embedded
 * issue date and random payload. Only holders of LICENSE_SECRET — the
 * EffectCraft team — can mint keys that validate.
 *
 * Layout (19 alnum chars, displayed 5-4-4-4-2):
 *   [0..2)  "EC"
 *   [2]     tier letter  B=bundle P=pro S=studio L=lifetime
 *   [3..13) 10 random chars
 *   [13..16) 3 chars, days since 2026-01-01 in base36
 *   [16..19) 3-char HMAC tag over chars [0..16)
 */

import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import type { Tier } from "./license";

export type MintTier = Exclude<Tier, "basic">;

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // 32-char, no confusables
const KEY_LEN = 19;
const MAC_LEN = 3;
const DAY = 86_400_000;
const EPOCH_0 = Date.UTC(2026, 0, 1);

const TIER_LETTER: Record<MintTier, string> = {
  bundle: "B",
  pro: "P",
  studio: "S",
  lifetime: "L",
};

const LETTER_TIER: Record<string, MintTier> = {
  B: "bundle",
  P: "pro",
  S: "studio",
  L: "lifetime",
};

export const TIER_DAYS: Partial<Record<Tier, number>> = {
  pro: 30,
  studio: 365,
};

export function licenseConfigured(): boolean {
  const s = process.env.LICENSE_SECRET;
  return typeof s === "string" && s.length >= 16;
}

function getSecret(): string {
  const s = process.env.LICENSE_SECRET;
  if (!s || s.length < 16) throw new Error("LICENSE_SECRET is not configured on this server (set it in Vercel → Settings → Environment Variables, min 16 chars).");
  return s;
}

/* ── Minting ─────────────────────────────── */

function randomChars(len: number): string {
  const out: string[] = [];
  while (out.length < len) {
    const buf = randomBytes(len * 2);
    for (let i = 0; i < buf.length && out.length < len; i++) {
      const b = buf[i] ?? 0;
      out.push(ALPHABET[b % ALPHABET.length] ?? "2");
    }
  }
  return out.join("");
}

function macOf(msg: string, secret: string): string {
  const digest = createHmac("sha256", secret).update(msg).digest();
  let out = "";
  for (let i = 0; i < MAC_LEN; i++) {
    out += ALPHABET[(digest[i] ?? 0) % ALPHABET.length] ?? "2";
  }
  return out;
}

export interface MintedKey {
  key: string;
  tier: MintTier;
  issuedAt: number;
  expiresAt: number | null;
}

export function mintKey(tier: MintTier, issuedAt: number = Date.now()): MintedKey {
  const secret = getSecret();
  const days = Math.floor((issuedAt - EPOCH_0) / DAY);
  if (days < 0 || days > 46_655) {
    throw new Error("Issue date out of encodable range.");
  }
  const daysStr = days.toString(36).toUpperCase().padStart(3, "0");
  if (daysStr.length !== 3) throw new Error("Date encoding overflow.");

  const rand = randomChars(10);
  const body = `EC${TIER_LETTER[tier]}${rand}${daysStr}`;
  if (body.length !== KEY_LEN - MAC_LEN) throw new Error("Key layout error.");
  const chars = body + macOf(body, secret);
  return { key: groupKey(chars), tier, issuedAt, expiresAt: daysExpire(tier, issuedAt) };
}

function daysExpire(tier: MintTier, issuedAt: number): number | null {
  const d = TIER_DAYS[tier];
  return d ? issuedAt + d * DAY : null;
}

function groupKey(chars: string): string {
  return [
    chars.slice(0, 5),
    chars.slice(5, 9),
    chars.slice(9, 13),
    chars.slice(13, 17),
    chars.slice(17),
  ].join("-");
}

/* ── Validation ──────────────────────────── */

export interface LicenseCheck {
  ok: boolean;
  tier: Tier;
  error?: string;
  expired?: boolean;
  key?: string;
  issuedAt?: number;
  expiresAt?: number | null;
}

function tagsEqual(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function validateLicense(raw: string): LicenseCheck {
  if (!licenseConfigured()) {
    return { ok: false, tier: "basic", error: "Key service is not configured (missing LICENSE_SECRET)." };
  }
  const chars = raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (chars.length !== KEY_LEN || !chars.startsWith("EC")) {
    return { ok: false, tier: "basic", error: "That is not a valid EffectCraft key format." };
  }
  const letter = chars[2];
  const tier = letter ? LETTER_TIER[letter] : undefined;
  if (!tier) {
    return { ok: false, tier: "basic", error: "Unknown tier in this key." };
  }

  const body = chars.slice(0, KEY_LEN - MAC_LEN);
  const expected = macOf(body, getSecret());
  const given = chars.slice(KEY_LEN - MAC_LEN);
  if (!tagsEqual(expected, given)) {
    return { ok: false, tier: "basic", error: "Key failed signature check — double-check the characters." };
  }

  const daysStr = chars.slice(13, 16);
  const days = parseInt(daysStr, 36);
  if (!Number.isFinite(days)) {
    return { ok: false, tier: "basic", error: "Key payload is corrupted." };
  }
  const issuedAt = EPOCH_0 + days * DAY;
  const expiresAt = daysExpire(tier, issuedAt);
  const expired = expiresAt != null && Date.now() > expiresAt;
  if (expired) {
    return {
      ok: false,
      tier,
      expired: true,
      expiresAt,
      error: "This key has expired — contact support@effectcraft.studio to renew.",
    };
  }
  return { ok: true, tier, key: groupKey(chars), issuedAt, expiresAt };
}
