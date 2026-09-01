/**
 * POST /api/admin/generate-keys
 *
 * Generate signed access keys — no database needed.
 * Keys are HMAC-signed tokens containing tier + expiry + creation time.
 * Protected by ADMIN_SECRET.
 *
 * Body: { tier: KeyTier, count: number, secret: string }
 * Response: { success, keys: string[], tier, expiresAt }
 */

import { NextResponse } from "next/server";
import { generateKey, getTierDuration, type KeyTier } from "@/lib/token";

const VALID_TIERS: KeyTier[] = ["basic", "pro", "studio", "lifetime"];

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

    // Validate tier
    if (!tier || !VALID_TIERS.includes(tier)) {
      return NextResponse.json(
        { success: false, error: "Invalid tier. Must be: basic, pro, studio, or lifetime" },
        { status: 400 }
      );
    }

    // Validate count
    const keyCount = Math.min(Math.max(Math.floor(Number(count)), 1), 100);
    if (keyCount < 1 || keyCount > 100) {
      return NextResponse.json(
        { success: false, error: "Count must be between 1 and 100" },
        { status: 400 }
      );
    }

    // Check that TOKEN_SECRET is configured
    const tokenSecret = process.env.TOKEN_SECRET;
    if (!tokenSecret) {
      return NextResponse.json(
        {
          success: false,
          error: "TOKEN_SECRET environment variable is not set. Add it in Vercel → Settings → Environment Variables.",
        },
        { status: 500 }
      );
    }

    // Generate keys
    const keys: string[] = [];
    for (let i = 0; i < keyCount; i++) {
      keys.push(generateKey(tier, tokenSecret));
    }

    return NextResponse.json({
      success: true,
      count: keys.length,
      tier,
      duration: getTierDuration(tier),
      keys,
    });
  } catch (error) {
    console.error("Key generation error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
