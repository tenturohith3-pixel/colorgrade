import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase-server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const PRICE_MAP: Record<string, { amount: number; currency: string; recurring: boolean; name: string }> = {
  single:   { amount: 2900,  currency: "inr", recurring: false, name: "Single Clip" },
  monthly:  { amount: 24900, currency: "inr", recurring: true,  name: "Monthly Pro" },
  yearly:   { amount: 84900, currency: "inr", recurring: true,  name: "Yearly Pro" },
  lifetime: { amount: 200000, currency: "inr", recurring: false, name: "Lifetime Pro" },
};

export async function POST(request: NextRequest) {
  try {
    // Verify Supabase auth
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { plan } = await request.json();

    if (!plan || !PRICE_MAP[plan]) {
      return NextResponse.json(
        { error: "Invalid plan. Must be: single, monthly, yearly, lifetime" },
        { status: 400 }
      );
    }

    const planDetails = PRICE_MAP[plan];
    const origin = request.headers.get("origin") || "http://localhost:3000";

    // Create or retrieve Stripe customer
    let customerId: string;

    // Check if user already has a Stripe customer ID
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    if (profile?.stripe_customer_id) {
      customerId = profile.stripe_customer_id;
    } else {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email!,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;

      // Save customer ID to profile
      await supabase
        .from("user_profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id);
    }

    // Create checkout session
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      payment_method_types: ["card"],
      mode: planDetails.recurring ? "subscription" : "payment",
      line_items: [
        {
          price_data: {
            currency: planDetails.currency,
            product_data: {
              name: `ColorGrade — ${planDetails.name}`,
              description: plan === "single"
                ? "1 video export with basic features"
                : `${planDetails.name} plan with all pro features`,
            },
            unit_amount: planDetails.amount,
            ...(planDetails.recurring ? { recurring: { interval: plan === "yearly" ? "year" : "month" } } : {}),
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/tool?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/#pricing`,
      metadata: {
        user_id: user.id,
        plan,
      },
    };

    const session = await stripe.checkout.sessions.create(sessionParams);

    // Record payment intent
    await supabase.from("payments").insert({
      user_id: user.id,
      stripe_session_id: session.id,
      amount: planDetails.amount,
      currency: planDetails.currency,
      plan,
      status: "pending",
    });

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Checkout creation failed" },
      { status: 500 }
    );
  }
}
