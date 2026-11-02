import { validateLicense } from "@/lib/license-server";
import { ipOf, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!process.env.LICENSE_SECRET || process.env.LICENSE_SECRET.length < 16) {
    return Response.json(
      {
        ok: false,
        tier: "basic",
        error:
          "Key service is not configured yet — the owner must set LICENSE_SECRET in Vercel → Settings → Environment Variables.",
      },
      { status: 503, headers: { "cache-control": "no-store" } },
    );
  }

  const rl = rateLimit(`validate|${ipOf(req)}`, 20, 60_000);
  if (!rl.ok) {
    return Response.json(
      { ok: false, tier: "basic", error: "Too many attempts — wait a minute and retry." },
      { status: 429, headers: { "cache-control": "no-store" } },
    );
  }

  let key = "";
  try {
    const body = (await req.json()) as { key?: unknown };
    if (typeof body.key === "string") key = body.key;
  } catch {
    // fallthrough to empty-key error
  }
  if (!key.trim()) {
    return Response.json(
      { ok: false, tier: "basic", error: "No key provided." },
      { status: 400, headers: { "cache-control": "no-store" } },
    );
  }

  const result = validateLicense(key.trim());
  const headers = { "cache-control": "no-store" };
  if (!result.ok) {
    return Response.json(
      {
        ok: false,
        tier: result.tier,
        error: result.error,
        expired: result.expired,
      },
      { status: 400, headers },
    );
  }
  return Response.json(
    {
      ok: true,
      tier: result.tier,
      key: result.key,
      issuedAt: result.issuedAt,
      expiresAt: result.expiresAt,
    },
    { headers },
  );
}
