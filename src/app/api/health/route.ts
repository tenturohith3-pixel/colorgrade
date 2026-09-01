/**
 * GET /api/health
 *
 * Diagnostic endpoint — checks which env vars are set (without revealing their values).
 * Use this after deploying to verify Vercel has all required env vars.
 *
 * Response: { supabaseUrl, supabaseKey, adminSecret, ... }
 */

import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const adminSecret = process.env.ADMIN_SECRET;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Check if Supabase connection works
  let supabaseOk = false;
  let supabaseError: string | null = null;
  try {
    const result = getSupabaseAdmin();
    if (result.ok) {
      const { error } = await result.client.from("access_keys").select("id", { count: "exact", head: true });
      if (error) {
        supabaseError = error.message;
      } else {
        supabaseOk = true;
      }
    } else {
      supabaseError = result.error;
    }
  } catch (e) {
    supabaseError = e instanceof Error ? e.message : "Unknown error";
  }

  return NextResponse.json({
    env: {
      NEXT_PUBLIC_SUPABASE_URL: supabaseUrl
        ? supabaseUrl.includes("your-project")
          ? "PLACEHOLDER — NOT SET"
          : "SET (" + supabaseUrl.slice(0, 30) + "...)"
        : "MISSING",
      SUPABASE_SERVICE_ROLE_KEY: supabaseKey
        ? supabaseKey.includes("your-")
          ? "PLACEHOLDER — NOT SET"
          : "SET (length: " + supabaseKey.length + ")"
        : "MISSING",
      ADMIN_SECRET: adminSecret
        ? adminSecret.includes("your-")
          ? "PLACEHOLDER — NOT SET"
          : "SET (length: " + adminSecret.length + ")"
        : "MISSING",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: anonKey
        ? anonKey.includes("your-")
          ? "PLACEHOLDER — NOT SET"
          : "SET (length: " + anonKey.length + ")"
        : "MISSING",
    },
    supabase: {
      connected: supabaseOk,
      error: supabaseError,
    },
    timestamp: new Date().toISOString(),
  });
}
