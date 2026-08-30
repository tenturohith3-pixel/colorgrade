import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

  // Use service role for webhook (bypasses RLS)
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  );

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;
        const plan = session.metadata?.plan;

        if (userId && plan) {
          // Update user plan
          const planCredits: Record<string, number> = {
            single: 1,
            monthly: 200,
            yearly: 1800,
            lifetime: 999999,
          };

          await supabaseAdmin
            .from("user_profiles")
            .update({
              plan: plan === "single" ? "basic" : "pro",
              clips_remaining: planCredits[plan] || 0,
              trial_ends_at: plan.includes("monthly") || plan.includes("yearly")
                ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
                : null,
            })
            .eq("id", userId);

          // Update payment record
          await supabaseAdmin
            .from("payments")
            .update({ status: "completed" })
            .eq("stripe_session_id", session.id);
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        // For subscription invoices, the subscription ID is in the metadata
        const subscriptionId = (invoice as any).subscription as string;

        if (subscriptionId) {
          // Renew subscription — update trial/plan end date
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const customerId = subscription.customer as string;

          // Find user by Stripe customer ID
          const { data: profile } = await supabaseAdmin
            .from("user_profiles")
            .select("id")
            .eq("stripe_customer_id", customerId)
            .single();

          if (profile && (subscription as any).current_period_end) {
            const periodEnd = new Date((subscription as any).current_period_end * 1000);
            await supabaseAdmin
              .from("user_profiles")
              .update({ trial_ends_at: periodEnd.toISOString() })
              .eq("id", profile.id);
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Find user and revert to free
        const { data: profile } = await supabaseAdmin
          .from("user_profiles")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (profile) {
          await supabaseAdmin
            .from("user_profiles")
            .update({
              plan: "free",
              clips_remaining: 0,
              trial_ends_at: null,
            })
            .eq("id", profile.id);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        const { data: profile } = await supabaseAdmin
          .from("user_profiles")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (profile) {
          await supabaseAdmin
            .from("payments")
            .update({ status: "failed" })
            .eq("user_id", profile.id)
            .order("created_at", { ascending: false })
            .limit(1);
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
