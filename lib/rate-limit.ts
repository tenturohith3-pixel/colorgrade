/**
 * Tiny in-memory rate limiter. Per serverless instance — best effort,
 * stops casual key-enumeration and PIN brute-force loops.
 */

const buckets = new Map<string, { count: number; reset: number }>();
const MAX_TRACKED = 5_000;

export interface RateResult {
  ok: boolean;
  remaining: number;
}

export function rateLimit(key: string, limit: number, windowMs: number): RateResult {
  const now = Date.now();
  const existing = buckets.get(key);
  if (!existing || now > existing.reset) {
    if (buckets.size > MAX_TRACKED) buckets.clear();
    buckets.set(key, { count: 1, reset: now + windowMs });
    return { ok: true, remaining: limit - 1 };
  }
  existing.count += 1;
  return { ok: existing.count <= limit, remaining: Math.max(0, limit - existing.count) };
}

export function ipOf(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for") ?? "";
  const first = fwd.split(",")[0]?.trim();
  return first || "local";
}
