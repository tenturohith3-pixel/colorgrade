/**
 * Mint a license key from the terminal (owner only).
 *
 *   bun run mint [bundle|pro|studio|lifetime] [customer name]
 *
 * Requires LICENSE_SECRET in the environment (same secret as production).
 */

import { mintKey, validateLicense } from "../lib/license-server";
import { TIER_LABEL, type Tier } from "../lib/license";

const arg = process.argv[2]?.toLowerCase();
const tier = (arg === "bundle" || arg === "pro" || arg === "studio" || arg === "lifetime"
  ? arg
  : "pro") as Exclude<Tier, "basic">;
const name = process.argv[3] ?? "";

if (!process.env.LICENSE_SECRET) {
  console.error(
    "\n✗ LICENSE_SECRET is not set.\n  Run like:  LICENSE_SECRET=$(openssl rand -hex 24) bun run mint studio\n  Use the SAME value you set in Vercel → Environment Variables.\n",
  );
  process.exit(1);
}

let minted: ReturnType<typeof mintKey>;
try {
  minted = mintKey(tier);
} catch (err) {
  console.error("✗", err instanceof Error ? err.message : err);
  process.exit(1);
}

const check = validateLicense(minted.key);
if (!check.ok) {
  console.error("✗ self-check failed:", check.error);
  process.exit(1);
}

const expiry = minted.expiresAt
  ? new Date(minted.expiresAt).toISOString().slice(0, 10)
  : "never";

console.log("\n┌─ EFFECTCRAFT KEY ─────────────────────────────");
console.log(`│ key       ${minted.key}`);
console.log(`│ tier      ${TIER_LABEL[tier]}${name ? ` (for ${name})` : ""}`);
console.log(`│ issued    ${new Date(minted.issuedAt).toISOString().slice(0, 10)}`);
console.log(`│ expires   ${expiry}`);
console.log("└───────────────────────────────────────────────\n");
