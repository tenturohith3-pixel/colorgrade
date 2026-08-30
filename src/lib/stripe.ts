/**
 * Stripe Integration
 *
 * Handles checkout session creation for the 4 pricing tiers.
 * Uses server-side Stripe SDK for session creation.
 */

import { loadStripe } from "@stripe/stripe-js";

let stripePromise: ReturnType<typeof loadStripe>;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
    );
  }
  return stripePromise;
};

export type PlanType = "single" | "monthly" | "yearly" | "lifetime";

export const PLAN_DETAILS: Record<
  PlanType,
  { name: string; price: string; period: string; amount: number; currency: string }
> = {
  single: {
    name: "Single Clip",
    price: "₹29",
    period: "per clip",
    amount: 2900,
    currency: "inr",
  },
  monthly: {
    name: "Monthly",
    price: "₹249",
    period: "/month",
    amount: 24900,
    currency: "inr",
  },
  yearly: {
    name: "Yearly",
    price: "₹849",
    period: "/year",
    amount: 84900,
    currency: "inr",
  },
  lifetime: {
    name: "Lifetime",
    price: "₹2,000",
    period: "one-time",
    amount: 200000,
    currency: "inr",
  },
};

export async function createCheckoutSession(plan: PlanType) {
  try {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { success: false, error: data.error || "Checkout failed" };
    }

    // Redirect to Stripe Checkout URL
    if (data.url) {
      window.location.href = data.url;
    }

    return { success: true, sessionId: data.sessionId };
  } catch {
    return { success: false, error: "Network error" };
  }
}
