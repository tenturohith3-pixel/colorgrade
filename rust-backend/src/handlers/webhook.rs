use axum::Json;
use crate::models::StripeWebhookPayload;
use crate::error::AppError;

pub async fn stripe_webhook(
    Json(payload): Json<StripeWebhookPayload>,
) -> Result<Json<serde_json::Value>, AppError> {
    // TODO: Verify Stripe webhook signature
    // let stripe_secret = std::env::var("STRIPE_WEBHOOK_SECRET")?;
    // let event = stripe::Webhook::construct_event(&body, &sig, &secret)?;

    match payload.event_type.as_str() {
        "payment_intent.succeeded" => {
            tracing::info!("Payment succeeded: {:?}", payload.data);
            // TODO: Activate user plan, add tokens
        }
        "customer.subscription.created" => {
            tracing::info!("Subscription created: {:?}", payload.data);
            // TODO: Start billing cycle
        }
        "customer.subscription.deleted" => {
            tracing::info!("Subscription cancelled: {:?}", payload.data);
            // TODO: Revert to free tier
        }
        "invoice.payment_failed" => {
            tracing::warn!("Payment failed: {:?}", payload.data);
            // TODO: Notify user
        }
        _ => {
            tracing::debug!("Unhandled event: {}", payload.event_type);
        }
    }

    Ok(Json(serde_json::json!({
        "received": true
    })))
}
