/**
 * POST /api/admin/generate-keys
 *
 * Admin-only endpoint to batch-generate access keys.
 * Protected by ADMIN_SECRET environment variable.
 *
 * Body: { tier: KeyTier, count: number, secret: string }
 * Response: { success, keys: string[], tier, expiresAt }
 */

import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

// Key generation config
const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no I/O/0/1
const SEGMENT_LENGTH = 4;
const SEGMENT_COUNT = 3;

const TIER_DURATIONS: Record<string, number | null> = {
  basic: 7 * 24 * 60 * 60 * 1000,       // 7 days
  pro: 30 * 24 * 60 * 60 * 1000,         // 30 days
  studio: 365 * 24 * 60 * 60 * 1000,     // 1 year
  lifetime: null,                          // never
};

function generateKeyCode(): string {
  const segments: string[] = [];
  for (let s = 0; s < SEGMENT_COUNT; s++) {
    let segment = "";
    for (let i = 0; i < SEGMENT_LENGTH; i++) {
      segment += CHARS[Math.floor(Math.random() * CHARS.length)];
    }
    segments.push(segment);
  }
  return "CG-" + segments.join("-");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tier, count, secret } = body;

    // Authenticate
    if (secret !== process.env.ADMIN_SECRET) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Validate inputs
    if (!tier || !TIER_DURATIONS.hasOwnProperty(tier)) {
      return NextResponse.json(
        { success: false, error: "Invalid tier. Must be: basic, pro, studio, or lifetime" },
        { status: 400 }
      );
    }

    const keyCount = Math.min(Math.max(Math.floor(Number(count)), 1), 100);
    if (keyCount < 1 || keyCount > 100) {
      return NextResponse.json(
        { success: false, error: "Count must be between 1 and 100" },
        { status: 400 }
      );
    }

    // Connect to Supabase with validation
    const supabase = getSupabaseAdmin();
    if (!supabase.ok) {
      return NextResponse.json(
        { success: false, error: "Server configuration error: " + supabase.error },
        { status: 500 }
      );
    }

    // Generate keys
    const now = new Date();
    const duration = TIER_DURATIONS[tier];
    const expiresAt = duration !== null
      ? new Date(now.getTime() + duration).toISOString()
      : null;

    const keysToInsert: {
      key_code: string;
      tier: string;
      expires_at: string | null;
    }[] = [];

    const generatedKeys: string[] = [];

    for (let i = 0; i < keyCount; i++) {
      let keyCode = generateKeyCode();
      // Ensure uniqueness (retry on collision, extremely unlikely)
      let attempts = 0;
      while (attempts < 5) {
        const { data: existing } = await supabase.client
          .from("access_keys")
          .select("id")
          .eq("key_code", keyCode)
          .single();
        if (!existing) break;
        keyCode = generateKeyCode();
        attempts++;
      }

      keysToInsert.push({
        key_code: keyCode,
        tier,
        expires_at: expiresAt,
      });
      generatedKeys.push(keyCode);
    }

    // Bulk insert
    const { error: insertError } = await supabase.client
      .from("access_keys")
      .insert(keysToInsert);

    if (insertError) {
      console.error("Key generation error:", insertError);
      return NextResponse.json(
        { success: false, error: "Failed to generate keys: " + insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      count: generatedKeys.length,
      tier,
      expiresAt,
      keys: generatedKeys,
    });
  } catch (error) {
    console.error("Key generation error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
