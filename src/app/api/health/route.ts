/**
 * GET /api/health
 *
 * Diagnostic endpoint — checks which env vars are set.
 * Use this after deploying to verify Vercel has all required env vars.
 */

import { NextResponse } from "next/server";

export async function GET() {
  const tokenSecret = process.env.TOKEN_SECRET;
  const adminSecret = process.env.ADMIN_SECRET;

  return NextResponse.json({
    env: {
      TOKEN_SECRET: tokenSecret
        ? tokenSecret.length >= 16
          ? "SET (length: " + tokenSecret.length + ")"
          : "SET but too short (length: " + tokenSecret.length + ", need 16+)"
        : "MISSING — keys will not work!",
      ADMIN_SECRET: adminSecret
        ? "SET (length: " + adminSecret.length + ")"
        : "MISSING — admin page will not authenticate",
    },
    status: tokenSecret && adminSecret ? "OK" : "MISSING ENV VARS",
    timestamp: new Date().toISOString(),
  });
}
