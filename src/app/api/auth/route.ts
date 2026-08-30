import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createUser, getUserByEmail, updateUser, type UserRow } from "@/lib/auth-db";
import { createSessionToken, verifySessionToken, COOKIE_NAME } from "@/lib/jwt";

// ── POST /api/auth ───────────────────────────────
// Actions: signup, signin, signout

export async function POST(request: NextRequest) {
  const { action, email, password, fullName, birthDate } = await request.json();

  switch (action) {
    case "signup": {
      // Age verification
      if (birthDate) {
        const birth = new Date(birthDate);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;

        if (age < 13) {
          return NextResponse.json(
            { error: "You must be at least 13 years old" },
            { status: 400 }
          );
        }
      }

      // Check if user exists
      const existing = getUserByEmail(email);
      if (existing) {
        return NextResponse.json(
          { error: "Email already registered" },
          { status: 409 }
        );
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 12);

      // Create user
      const user = createUser(email, passwordHash, fullName || "");

      // Create session token
      const token = await createSessionToken(user.id, user.email);

      // Set cookie
      const response = NextResponse.json({
        success: true,
        user: sanitizeUser(user),
      });

      response.cookies.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60, // 7 days
      });

      return response;
    }

    case "signin": {
      const user = getUserByEmail(email);
      if (!user) {
        return NextResponse.json(
          { error: "Invalid email or password" },
          { status: 401 }
        );
      }

      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) {
        return NextResponse.json(
          { error: "Invalid email or password" },
          { status: 401 }
        );
      }

      const token = await createSessionToken(user.id, user.email);

      const response = NextResponse.json({
        success: true,
        user: sanitizeUser(user),
      });

      response.cookies.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60,
      });

      return response;
    }

    case "signout": {
      const response = NextResponse.json({ success: true });
      response.cookies.set(COOKIE_NAME, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
      });
      return response;
    }

    case "update_profile": {
      // Verify session
      const token = request.cookies.get(COOKIE_NAME)?.value;
      if (!token) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      }

      const session = await verifySessionToken(token);
      if (!session) {
        return NextResponse.json({ error: "Invalid session" }, { status: 401 });
      }

      const updates: Record<string, string> = {};
      if (fullName) updates.full_name = fullName;

      updateUser(session.userId, updates);

      const user = getUserByEmail(session.email);
      return NextResponse.json({ success: true, user: sanitizeUser(user!) });
 }

    default:
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }
}

// ── GET /api/auth ────────────────────────────────
// Get current session

export async function GET(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ user: null });
  }

  const session = await verifySessionToken(token);
  if (!session) {
    return NextResponse.json({ user: null });
  }

  // Import dynamically to avoid issues
  const { getUserById } = await import("@/lib/auth-db");
  const user = getUserById(session.userId);

  if (!user) {
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({ user: sanitizeUser(user) });
}

// Remove password hash from response
function sanitizeUser(user: UserRow) {
  const { password_hash, ...safe } = user;
  return safe;
}
