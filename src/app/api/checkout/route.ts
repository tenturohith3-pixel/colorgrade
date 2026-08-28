import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/checkout
 *
 * Creates a Stripe Checkout Session for the selected plan.
 * In production:
 * 1. Verify Firebase auth token
 * 2. Create Stripe customer if new
 * 3. Create checkout session with correct price/subscription config
 * 4. Return session ID for client redirect
 */

const PRICE_MAP: Record<string, { amount: number; currency: string; recurring: boolean }> = {
  single:   { amount: 2900,  currency: "inr", recurring: false },
  monthly:  { amount: 24900, currency: "inr", recurring: true },
  yearly:   { amount: 84900, currency: "inr", recurring: true },
  lifetime: { amount: 200000, currency: "inr", recurring: false },
};

export async function POST(request: NextRequest) {
  try {
    const { plan } = await request.json();

    if (!plan || !PRICE_MAP[plan]) {
      return NextResponse.json(
        { error: "Invalid plan. Must be: single, monthly, yearly, lifetime" },
        { status: 400 }
      );
    }

    // TODO: Verify Firebase auth from Authorization header
    // TODO: Create Stripe checkout session
    // const session = await stripe.checkout.sessions.create({
    //   payment_method_types: ["card"],
    //   mode: PRICE_MAP[plan].recurring ? "subscription" : "payment",
    //   line_items: [{ price_data: { ... }, quantity: 1 }],
    //   success_url: `${origin}/tool?session_id={CHECKOUT_SESSION_ID}`,
    //   cancel_url: `${origin}/pricing`,
    // });

    const sessionId = `cs_demo_${Date.now()}_${plan}`;

    return NextResponse.json({
      success: true,
      sessionId,
      message: "Connect Stripe secret key to enable real checkout",
      plan,
      amount: PRICE_MAP[plan].amount,
      currency: PRICE_MAP[plan].currency,
    });
  } catch {
    return NextResponse.json(
      { error: "Checkout creation failed" },
      { status: 500 }
    );
  }
}
