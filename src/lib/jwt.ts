/**
 * JWT Token Utilities
 *
 * Uses jose library for Edge-compatible JWT operations.
 * Tokens are stored in httpOnly cookies.
 */

import { SignJWT, jwtVerify, type JWTPayload } from "jose";

if (!process.env.JWT_SECRET) {
  throw new Error(
    "JWT_SECRET environment variable is required. " +
    "Generate one with: openssl rand -base64 32"
  );
}

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

const COOKIE_NAME = "ezcc_session";
const EXPIRY = "7d";

export interface SessionPayload extends JWTPayload {
  userId: string;
  email: string;
}

export async function createSessionToken(userId: string, email: string): Promise<string> {
  return new SignJWT({ userId, email } satisfies SessionPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(EXPIRY)
    .sign(SECRET);
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as SessionPayload;
  } catch {
    return null;
  }
}

export { COOKIE_NAME };
