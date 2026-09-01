/**
 * Shared Supabase admin client factory.
 * Validates env vars and returns clear error messages instead of cryptic Supabase errors.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type EnvCheck = { ok: true; client: SupabaseClient } | { ok: false; error: string };

/**
 * Returns a validated Supabase admin client, or an error describing which env var is missing.
 * Call this inside API route handlers (never at module scope).
 */
export function getSupabaseAdmin(): EnvCheck {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || url === "" || url.includes("your-project")) {
    return {
      ok: false,
      error:
        "NEXT_PUBLIC_SUPABASE_URL is missing or still set to the placeholder value. " +
        "Go to Vercel → Project → Settings → Environment Variables and set it to your real Supabase URL (e.g. https://abc123.supabase.co).",
    };
  }

  if (!key || key === "" || key.includes("your-")) {
    return {
      ok: false,
      error:
        "SUPABASE_SERVICE_ROLE_KEY is missing or still set to the placeholder value. " +
        "Go to Vercel → Project → Settings → Environment Variables and set it to your real service role key.",
    };
  }

  const client = createClient(url, key);
  return { ok: true, client };
}
