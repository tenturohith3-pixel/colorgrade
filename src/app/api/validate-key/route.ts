/**
 * POST /api/validate-key
 *
 * Validates an access key and marks it as consumed (one-time use).
 * Returns the tier and expiration info if valid.
 *
 * Body: { keyCode: string }
 * Response: { success, keyCode, tier, expiresAt } or { success: false, error }
 */

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function generateFingerprint(): string {
  return `fp_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { keyCode } = body;

    if (!keyCode || typeof keyCode !== "string") {
      return NextResponse.json(
        { success: false, error: "Key code is required" },
        { status: 400 }
      );
    }

    const normalizedKey = keyCode.trim().toUpperCase();

    const keyRegex = /^CG-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
    if (!keyRegex.test(normalizedKey)) {
      return NextResponse.json(
        { success: false, error: "Invalid key format. Expected: CG-XXXX-XXXX-XXXX" },
        { status: 400 }
      );
    }

    // Lazy-init Supabase inside handler to avoid build-time env var errors
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || ""
    );

    const { data: keyRecord, error: lookupError } = await supabase
      .from("access_keys")
      .select("*")
      .eq("key_code", normalizedKey)
      .single();

    if (lookupError || !keyRecord) {
      return NextResponse.json(
        { success: false, error: "Key not found. Please check and try again." },
        { status: 404 }
      );
    }

    // Check if already consumed
    if (keyRecord.is_consumed) {
      return NextResponse.json(
        { success: false, error: "This key has already been used." },
        { status: 410 }
      );
    }

    // Check if expired
    if (keyRecord.expires_at && new Date(keyRecord.expires_at) < new Date()) {
      return NextResponse.json(
        { success: false, error: "This key has expired." },
        { status: 410 }
      );
    }

    // Mark as consumed (one-time use)
    const fingerprint = generateFingerprint();
    const { error: consumeError } = await supabase
      .from("access_keys")
      .update({
        is_consumed: true,
        used_by: fingerprint,
        used_at: new Date().toISOString(),
        consumed_by: `browser_${Date.now()}`,
      })
      .eq("id", keyRecord.id);

    if (consumeError) {
      console.error("Failed to consume key:", consumeError);
      return NextResponse.json(
        { success: false, error: "Failed to activate key. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      keyCode: keyRecord.key_code,
      tier: keyRecord.tier,
      expiresAt: keyRecord.expires_at,
    });
  } catch (error) {
    console.error("Key validation error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
