/**
 * EffectCraft — local tier licensing.
 *
 * The platform is self-contained: keys are deterministic, verified by checksum,
 * validated against a tier, and persisted in localStorage. Suited for the
 * current demo/staging build (Stripe + Supabase integration hooks planned).
 *
 * Key format: EC<P|S|L><AA>-XXXX-XXXX-XXXX-CCCC
 *   - Block 1 encodes the tier letter (P=Pro, S=Studio, L=Lifetime)
 *   - Last block is a 2-char base36 checksum of blocks 1–4
 */

export type Tier = "basic" | "pro" | "studio" | "lifetime";

export const TIER_RANK: Record<Tier, number> = {
  basic: 0,
  pro: 1,
  studio: 2,
  lifetime: 3,
};

export const TIER_LABEL: Record<Tier, string> = {
  basic: "Basic",
  pro: "Pro",
  studio: "Studio",
  lifetime: "Lifetime",
};

export const TIER_DURATION: Record<Exclude<Tier, "basic" | "lifetime">, number> =
  { pro: 30, studio: 365 };

export const TIER_MAX_EXPORT: Record<Tier, number> = {
  basic: 1920,
  pro: 3840,
  studio: 3840,
  lifetime: 7680,
};

export interface StoredLicense {
  key: string;
  tier: Tier;
  issuedAt: number;
  expiresAt: number | null;
  name?: string;
}

const STORAGE_KEY = "ec:license";
const LICENSE_EVENT = "ec:license-changed";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomBlock(len: number): string {
  const bytes = new Uint8Array(len);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < len; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  let out = "";
  for (let i = 0; i < len; i++) {
    const b = bytes[i] ?? 0;
    out += ALPHABET[b % ALPHABET.length] ?? "A";
  }
  return out;
}

function checksum32(input: string): string {
  let h = 5381;
  for (let i = 0; i < input.length; i++) {
    h = ((h << 5) + h + input.charCodeAt(i)) >>> 0;
  }
  return h.toString(36).toUpperCase().padStart(2, "0").slice(-2);
}

export function generateKey(tier: Exclude<Tier, "basic">): string {
  const letter =
    tier === "pro" ? "P" : tier === "studio" ? "S" : "L";
  const block1 = `EC${letter}${randomBlock(2)}`;
  const b2 = randomBlock(4);
  const b3 = randomBlock(4);
  const b4 = randomBlock(4);
  const cks = checksum32(block1 + b2 + b3 + b4);
  return `${block1}-${b2}-${b3}-${b4}-${cks}`;
}

export interface KeyValidation {
  ok: boolean;
  tier: Tier;
  error?: string;
  key?: string;
}

/* Key layout (19 alphanumeric chars):
 *  [0..2)  "EC"
 *  [2]     tier letter P|S|L
 *  [3..17) body   (2 + 4 + 4 + 4)
 *  [17..19) base36 checksum of everything before it
 */
const KEY_LEN = 19;

/** Normalize any paste format of a license key: strip noise, re-group. */
export function normalizeKey(input: string): string | null {
  const chars = input.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (chars.length !== KEY_LEN) return null;
  if (chars.slice(0, 2) !== "EC") return null;
  const tierLetter = chars[2];
  if (!tierLetter || !("PSL".includes(tierLetter ?? ""))) return null;
  return formatGrouped(chars);
}

export function formatKey(chars: string): string {
  if (chars.length !== KEY_LEN) return chars;
  return formatGrouped(chars);
}

function formatGrouped(chars: string): string {
  return `${chars.slice(0, 5)}-${chars.slice(5, 9)}-${chars.slice(9, 13)}-${chars.slice(13, 17)}-${chars.slice(17)}`;
}

export function validateKey(input: string): KeyValidation {
  const chars = input.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (chars.length !== KEY_LEN || chars.slice(0, 2) !== "EC") {
    return { ok: false, tier: "basic", error: "That is not a valid EffectCraft key format." };
  }
  const tierLetter = chars[2];
  if (!tierLetter || !"PSL".includes(tierLetter)) {
    return { ok: false, tier: "basic", error: "Unknown tier in key." };
  }
  const body = chars.slice(0, 17);
  const cks = chars.slice(17);
  if (cks !== checksum32(body)) {
    return { ok: false, tier: "basic", error: "Key checksum failed — double-check the characters." };
  }
  const tier: Tier =
    tierLetter === "P" ? "pro" : tierLetter === "S" ? "studio" : "lifetime";
  return { ok: true, tier, key: formatGrouped(chars) };
}

export function buildLicense(
  tier: Exclude<Tier, "basic">,
  key?: string,
): StoredLicense {
  const issuedAt = Date.now();
  const finalKey = key ?? generateKey(tier);
  const days = tier === "pro" ? TIER_DURATION.pro : tier === "studio" ? TIER_DURATION.studio : null;
  return {
    key: finalKey,
    tier,
    issuedAt,
    expiresAt: days ? issuedAt + days * 86400000 : null,
  };
}

/* ── Persistence ─────────────────────────── */

export function loadLicense(): StoredLicense | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredLicense;
    if (!parsed?.tier || !TIER_RANK[parsed.tier]) return null;
    if (parsed.expiresAt && Date.now() > parsed.expiresAt) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveLicense(license: StoredLicense): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(license));
  window.dispatchEvent(new Event(LICENSE_EVENT));
}

export function clearLicense(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event(LICENSE_EVENT));
}

export const LICENSE_CHANGE_EVENT = LICENSE_EVENT;

export function tierRankOf(license: StoredLicense | null): number {
  if (!license) return 0;
  const rank = TIER_RANK[license.tier];
  return rank ?? 0;
}
