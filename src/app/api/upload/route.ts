import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, COOKIE_NAME } from "@/lib/jwt";
import { createGradingJob, updateGradingJob, getUserById, updateUser } from "@/lib/auth-db";
import path from "path";
import fs from "fs";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
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
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 20MB." },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/tiff"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: JPEG, PNG, WebP, TIFF" },
        { status: 400 }
      );
    }

    // Check user credits
    if (user.plan === "free" && user.clips_remaining <= 0) {
      return NextResponse.json(
        { error: "No clips remaining. Please upgrade your plan." },
        { status: 403 }
      );
    }

    // Save file to disk
    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}_${Date.now()}.${fileExt}`;
    const filePath = path.join(UPLOAD_DIR, fileName);
    const publicUrl = `/uploads/${fileName}`;

    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, buffer);

    // Create grading job record
    const job = createGradingJob(user.id, publicUrl);

    // Decrement clips remaining
    if (user.plan !== "pro" && user.plan !== "lifetime" && user.clips_remaining > 0) {
      updateUser(user.id, { clips_remaining: user.clips_remaining - 1 });
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      path: fileName,
      jobId: job.id,
    });
  } catch (error) {
    console.error("Upload route error:", error);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get("path");

    if (!filePath) {
      return NextResponse.json(
        { error: "No file path provided" },
        { status: 400 }
      );
    }

    // Delete file from disk
    const fullPath = path.join(UPLOAD_DIR, filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Delete failed" },
      { status: 500 }
    );
  }
}
