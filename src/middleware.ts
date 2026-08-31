import { NextRequest, NextResponse } from "next/server";
import { jwtVerify, type JWTPayload } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "ezcc-fallback-dev-only-key-2026"
);

interface SessionPayload extends JWTPayload {
  userId: string;
  email: string;
}

async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static files, API routes, and internal Next.js paths
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/api/") ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|webp)$/)
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("ezcc_session")?.value;
  const session = token ? await verifyToken(token) : null;

  // Add user info to headers for server components
  const response = NextResponse.next();
  if (session) {
    response.headers.set("x-user-id", session.userId);
    response.headers.set("x-user-email", session.email);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
