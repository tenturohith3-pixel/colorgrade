import { createReadStream, existsSync, statSync } from "node:fs";
import { Readable } from "node:stream";
import { join, basename, normalize } from "node:path";
import type { NextRequest } from "next/server";
import { pluginById } from "@/lib/catalog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Streams a Prism plugin binary from private/plugins.
 * Ids are validated against the catalog, normalized and resolved inside the
 * private directory — no traversal beyond it.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const plugin = pluginById(id);
  if (!plugin) {
    return Response.json({ error: "Unknown module id." }, { status: 404 });
  }

  const safeBase = basename(plugin.binaryPath.split("/").at(-1) ?? `${plugin.id}.wasm`);
  const safeDir = normalize(join(process.cwd(), "private", "plugins"));
  const filePath = join(safeDir, safeBase);

  if (!existsSync(filePath) || !statSync(filePath).isFile()) {
    return Response.json({ error: "Binary missing from registry." }, { status: 404 });
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
      "Cache-Control": "public, max-age=3600",
    },
  });
}
