import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, COOKIE_NAME } from "@/lib/jwt";
import { getUserById } from "@/lib/auth-db";

/**
 * POST /api/grade
 * 
 * Initiates a color grading job. In production, this would:
 * 1. Validate auth and check user's token balance
 * 2. Rate limit (token bucket via Upstash)
 * 3. Queue the grading job for the Rust processing engine
 * 4. Return a job ID for polling status
 */

interface GradeRequest {
  jobId: string;
  adjustments: Record<string, number | string>;
  inputUrl: string;
  outputFormat: string;
}

async function getAuthenticatedUser(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const session = await verifySessionToken(token);
  if (!session) return null;
  return getUserById(session.userId);
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await request.json();
    const { inputUrl, adjustments, outputFormat } = body;

    if (!inputUrl) {
      return NextResponse.json({ error: "No input URL provided" }, { status: 400 });
    }

    // Validate adjustments against allowed ranges
    const ALLOWED_KEYS = new Set([
      "whiteBalance", "exposure", "contrast", "saturation", "brightness",
      "temperature", "shadowsHue", "midtonesHue", "highlightsHue",
      "shadowsSat", "midtonesSat", "highlightsSat",
      "hdrStrength", "highlightRecovery", "filmGrain", "halation", "bloom",
      "lutPreset",
    ]);

    if (adjustments && typeof adjustments === "object") {
      for (const [key, value] of Object.entries(adjustments)) {
        if (!ALLOWED_KEYS.has(key)) {
          return NextResponse.json({ error: `Invalid adjustment key: ${key}` }, { status: 400 });
        }
        if (typeof value === "number" && (value < -200 || value > 200)) {
          return NextResponse.json({ error: `Adjustment ${key} out of range` }, { status: 400 });
        }
      }
    }

    const jobId = `job_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const response: GradeRequest = {
      jobId,
      adjustments: adjustments || {},
      inputUrl,
      outputFormat: outputFormat || "mp4",
    };

    return NextResponse.json({
      success: true,
      message: "Grading job queued",
      ...response,
    });
  } catch {
    return NextResponse.json(
      { error: "Grading request failed" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/grade?jobId=xxx
 * 
 * Check grading job status. Returns progress and output URL when complete.
 */
export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const jobId = request.nextUrl.searchParams.get("jobId");

  if (!jobId) {
    return NextResponse.json({ error: "No jobId provided" }, { status: 400 });
  }

  return NextResponse.json({
    jobId,
    status: "pending",
    progress: 0,
    message: "Connect Rust backend for real job processing",
  });
}
