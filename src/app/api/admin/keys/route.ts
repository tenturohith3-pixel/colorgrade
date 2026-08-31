/**
 * GET /api/admin/keys
 *
 * Admin-only endpoint to list access keys with filtering and pagination.
 * Protected by ADMIN_SECRET environment variable.
 *
 * Query params:
 *   secret  — admin secret (required)
 *   tier    — filter by tier: basic, pro, studio, lifetime (optional)
 *   status  — filter by status: available, consumed, expired (optional)
 *   page    — page number, default 1 (optional)
 *   limit   — results per page, default 50, max 200 (optional)
 *
 * Response: { success, keys, total, page, totalPages }
 */

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/** Helper: create a Supabase admin client */
function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  );
}

type KeyRow = {
  id: string;
  key_code: string;
  tier: string;
  created_at: string;
  expires_at: string | null;
  is_consumed: boolean;
  used_at: string | null;
};

type KeyStatus = "available" | "consumed" | "expired";

function getKeyStatus(row: KeyRow): KeyStatus {
  if (row.is_consumed) return "consumed";
  if (row.expires_at && new Date(row.expires_at) < new Date()) return "expired";
  return "available";
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const secret = url.searchParams.get("secret");

    // Authenticate
    if (secret !== process.env.ADMIN_SECRET) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const supabase = adminClient();

    // Parse filters
    const tier = url.searchParams.get("tier");
    const status = url.searchParams.get("status") as KeyStatus | null;
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
    const limit = Math.min(200, Math.max(1, parseInt(url.searchParams.get("limit") || "50", 10)));
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from("access_keys")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    // Tier filter
    if (tier && ["basic", "pro", "studio", "lifetime"].includes(tier)) {
      query = query.eq("tier", tier);
    }

    // Status filter — applied in JS since it depends on multiple fields
    // We fetch extra rows if filtering by status, then trim
    const { data: rows, error } = await query;

    if (error) {
      console.error("Key list error:", error);
      return NextResponse.json(
        { success: false, error: "Failed to list keys: " + error.message },
        { status: 500 }
      );
    }

    // Enrich with computed status
    let enriched = (rows || []).map((row: KeyRow) => ({
      ...row,
      status: getKeyStatus(row),
    }));

    // Filter by status
    let totalFiltered = enriched.length;
    if (status && ["available", "consumed", "expired"].includes(status)) {
      enriched = enriched.filter((k) => k.status === status);
      totalFiltered = enriched.length;
    }

    // Paginate
    const totalPages = Math.ceil(totalFiltered / limit);
    const paginated = enriched.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      keys: paginated,
      total: totalFiltered,
      page,
      totalPages,
    });
  } catch (error) {
    console.error("Key list error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/keys
 *
 * Admin-only endpoint to revoke (delete) access keys.
 * Supports single key or bulk revoke.
 *
 * Body: { secret: string, keyIds?: string[], all?: boolean, tier?: string, status?: string }
 * Response: { success, revoked: number }
 */
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { secret, keyIds, all, tier, status } = body;

    // Authenticate
    if (secret !== process.env.ADMIN_SECRET) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const supabase = adminClient();

    // Build delete query
    let query = supabase.from("access_keys").delete();

    if (all) {
      // Delete all — no additional filters needed
    } else if (keyIds && Array.isArray(keyIds) && keyIds.length > 0) {
      // Delete specific keys by ID
      query = query.in("id", keyIds);
    } else if (tier || status) {
      // Delete by tier/status filter
      if (tier && ["basic", "pro", "studio", "lifetime"].includes(tier)) {
        query = query.eq("tier", tier);
      }
      if (status === "consumed") {
        query = query.eq("is_consumed", true);
      } else if (status === "expired") {
        // Can't filter by computed status in Supabase, so fetch first
        const { data: allKeys } = await supabase
          .from("access_keys")
          .select("id, expires_at")
          .eq("is_consumed", false);

        const expiredIds = (allKeys || [])
          .filter((k) => k.expires_at && new Date(k.expires_at) < new Date())
          .map((k) => k.id);

        if (expiredIds.length === 0) {
          return NextResponse.json({ success: true, revoked: 0 });
        }
        query = supabase.from("access_keys").delete().in("id", expiredIds);
      } else if (status === "available") {
        query = query.eq("is_consumed", false);
      }
    } else {
      return NextResponse.json(
        { success: false, error: "Provide keyIds, all=true, or tier/status filters" },
        { status: 400 }
      );
    }

    const { error, count } = await query;

    if (error) {
      console.error("Key revoke error:", error);
      return NextResponse.json(
        { success: false, error: "Failed to revoke keys: " + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      revoked: count ?? 0,
    });
  } catch (error) {
    console.error("Key revoke error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
