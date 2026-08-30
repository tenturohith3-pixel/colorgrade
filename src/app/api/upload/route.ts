import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

const BUCKET_NAME = "graded-images";
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
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
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("plan, clips_remaining")
      .eq("id", user.id)
      .single();

    if (profile?.plan === "free" && (!profile.clips_remaining || profile.clips_remaining <= 0)) {
      return NextResponse.json(
        { error: "No clips remaining. Please upgrade your plan." },
        { status: 403 }
      );
    }

    // Upload to Supabase Storage
    const fileExt = file.name.split(".").pop();
    const filePath = `${user.id}/${Date.now()}.${fileExt}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json(
        { error: "Upload failed: " + uploadError.message },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(uploadData.path);

    // Create grading job record
    const { data: job, error: jobError } = await supabase
      .from("grading_jobs")
      .insert({
        user_id: user.id,
        input_url: urlData.publicUrl,
        status: "pending",
      })
      .select()
      .single();

    if (jobError) {
      console.error("Job creation error:", jobError);
    }

    // Decrement clips remaining for non-lifetime plans
    if (profile?.plan !== "pro" && profile?.clips_remaining) {
      await supabase
        .from("user_profiles")
        .update({ clips_remaining: profile.clips_remaining - 1 })
        .eq("id", user.id);
    }

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      path: uploadData.path,
      jobId: job?.id,
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
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
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

    // Verify the file belongs to the user
    if (!filePath.startsWith(user.id + "/")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error) {
      return NextResponse.json(
        { error: "Delete failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Delete failed" },
      { status: 500 }
    );
  }
}
