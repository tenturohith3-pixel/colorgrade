//! ColorGrade Engine — High-Performance Color Grading Microservice
//!
//! Handles server-side video/image processing with:
//! - LUT application (cube file parsing + pixel transforms)
//! - HSL color space operations
//! - Film grain / halation / bloom post-processing
//! - S3 pre-signed URL generation
//! - Rate limiting via governor

mod auth;
mod error;
mod handlers;
mod models;
mod processing;
mod storage;

use axum::{routing::{get, post}, Router};
use tower_http::cors::{Any, CorsLayer};
use tower_http::trace::TraceLayer;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Load environment variables
    dotenvy::dotenv().ok();

    // Initialize tracing
    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::try_from_default_env()
            .unwrap_or_else(|_| "colorgrade_engine=debug,tower_http=debug".into()))
        .with(tracing_subscriber::fmt::layer())
        .init();

    // CORS layer
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    // Build application routes
    let app = Router::new()
        // Health check
        .route("/health", get(handlers::health::health_check))

        // Grade endpoints
        .route("/api/grade", post(handlers::grade::create_job))
        .route("/api/grade/:job_id", get(handlers::grade::get_status))

        // Upload endpoints
        .route("/api/upload/presign", post(handlers::upload::get_presigned_url))
        .route("/api/upload/confirm", post(handlers::upload::confirm_upload))

        // Auth endpoints
        .route("/api/auth/verify", post(handlers::auth::verify_token))
        .route("/api/auth/user", get(handlers::auth::get_user))

        // LUT management
        .route("/api/luts", get(handlers::luts::list_presets))
        .route("/api/luts/custom", post(handlers::luts::upload_custom))

        // Webhook
        .route("/api/webhook/stripe", post(handlers::webhook::stripe_webhook))

        // Middleware
        .layer(TraceLayer::new_for_http())
        .layer(cors);

    // Start server
    let addr = std::env::var("HOST").unwrap_or_else(|_| "0.0.0.0".to_string());
    let port = std::env::var("PORT").unwrap_or_else(|_| "8080".to_string());
    let listener = tokio::net::TcpListener::bind(format!("{addr}:{port}")).await?;

    tracing::info!("🎨 ColorGrade Engine listening on {}:{}", addr, port);

    axum::serve(listener, app).await?;

    Ok(())
}
