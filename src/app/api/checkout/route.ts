import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, COOKIE_NAME } from "@/lib/jwt";
import { getUserById, createPayment } from "@/lib/auth-db";

const PRICE_MAP: Record<string, { amount: number; currency: string; recurring: boolean; name: string }> = {
  single:   { amount: 2900,  currency: "inr", recurring: false, name: "Single Clip" },
  monthly:  { amount: 24900, currency: "inr", recurring: true,  name: "Monthly Pro" },
  yearly:   { amount: 84900, currency: "inr", recurring: true,  name: "Yearly Pro" },
  lifetime: { amount: 200000, currency: "inr", recurring: false, name: "Lifetime Pro" },
};

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

    const { plan } = await request.json();

    if (!plan || !PRICE_MAP[plan]) {
      return NextResponse.json(
        { error: "Invalid plan" },
        { status: 400 }
      );
    }

    const planDetails = PRICE_MAP[plan];

    // Record payment
    createPayment(user.id, planDetails.amount, planDetails.currency, plan, `demo_${Date.now()}`);

    // For demo: simulate successful payment and upgrade user
    // In production, use real Stripe checkout
    const { updateUser } = await import("@/lib/auth-db");
    const planCredits: Record<string, number> = {
      single: 1,
      monthly: 200,
      yearly: 1800,
      lifetime: 999999,
    };

    updateUser(user.id, {
      plan: plan === "single" ? "basic" : "pro",
      clips_remaining: planCredits[plan] || 0,
    });

    return NextResponse.json({
      success: true,
      message: "Payment processed (demo mode)",
      plan,
      amount: planDetails.amount,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Checkout failed" },
      { status: 500 }
    );
  }
}
