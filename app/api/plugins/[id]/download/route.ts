import { createReadStream, existsSync, statSync } from "node:fs";
import { Readable } from "node:stream";
import { join, basename, normalize } from "node:path";
import type { NextRequest } from "next/server";
import { pluginById } from "@/lib/catalog";
import { validateLicense } from "@/lib/license-server";
import { TIER_RANK } from "@/lib/license";
import { ipOf, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE = { "cache-control": "no-store" };

/**
 * Streams a Prism plugin binary from private/plugins.
 * Paid product: downloads require a valid HMAC-signed key of tier
 * bundle/pro/studio/lifetime, passed as ?key=… (the value the browser stored
 * at activation). Validation is server-side — the client's UI state alone
 * never unlocks binaries.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const plugin = pluginById(id);
  if (!plugin) {
    return Response.json({ error: "Unknown module id." }, { status: 404, headers: NO_STORE });
  }

  const rl = rateLimit(`dl|${ipOf(req)}`, 30, 60_000);
  if (!rl.ok) {
    return Response.json(
      { error: "Too many download attempts — wait a minute." },
      { status: 429, headers: NO_STORE },
    );
  }

  const key = req.nextUrl.searchParams.get("key") ?? "";
  const license = key.trim() ? validateLicense(key.trim()) : null;
  const unlocked = license?.ok === true && TIER_RANK[license.tier] >= TIER_RANK.bundle;
  if (!unlocked) {
    const msg = license?.expired
      ? "This key has expired — renew to keep downloading Prism modules."
      : "Prism modules ship in the paid bundle. Unlock at /pricing#bundle first.";
    return Response.json(
      { error: msg },
      { status: 401, headers: NO_STORE },
    );
  }

  const safeBase = basename(plugin.binaryPath.split("/").at(-1) ?? `${plugin.id}.wasm`);
  const safeDir = normalize(join(process.cwd(), "private", "plugins"));
  const filePath = join(safeDir, safeBase);

  if (!existsSync(filePath) || !statSync(filePath).isFile()) {
    return Response.json({ error: "Binary missing from registry." }, { status: 404, headers: NO_STORE });
  }

  const size = statSync(filePath).size;
  const stream = Readable.toWeb(
    createReadStream(filePath),
  ) as unknown as ReadableStream;

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "application/wasm",
      "Content-Length": String(size),
      "Content-Disposition": `attachment; filename="${safeBase}"`,
      "Cache-Control": "private, max-age=0, no-store",
    },
  });
}
