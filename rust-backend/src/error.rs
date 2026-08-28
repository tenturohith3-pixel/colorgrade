use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use thiserror::Error;

#[derive(Error, Debug)]
pub enum AppError {
    #[error("Authentication failed: {0}")]
    Auth(String),

    #[error("Rate limit exceeded")]
    RateLimit,

    #[error("Invalid file: {0}")]
    InvalidFile(String),

    #[error("File too large: {size} bytes (max {max} bytes)")]
    FileTooLarge { size: u64, max: u64 },

    #[error("Job not found: {0}")]
    JobNotFound(String),

    #[error("Processing failed: {0}")]
    Processing(String),

    #[error("Storage error: {0}")]
    Storage(String),

    #[error("Database error: {0}")]
    Database(String),

    #[error("Internal error: {0}")]
    Internal(#[from] anyhow::Error),
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, message) = match &self {
            AppError::Auth(_) => (StatusCode::UNAUTHORIZED, self.to_string()),
            AppError::RateLimit => (StatusCode::TOO_MANY_REQUESTS, self.to_string()),
            AppError::InvalidFile(_) => (StatusCode::BAD_REQUEST, self.to_string()),
            AppError::FileTooLarge { .. } => (StatusCode::PAYLOAD_TOO_LARGE, self.to_string()),
            AppError::JobNotFound(_) => (StatusCode::NOT_FOUND, self.to_string()),
            AppError::Processing(_) => (StatusCode::INTERNAL_SERVER_ERROR, self.to_string()),
            AppError::Storage(_) => (StatusCode::BAD_GATEWAY, self.to_string()),
            AppError::Database(_) => (StatusCode::INTERNAL_SERVER_ERROR, self.to_string()),
            AppError::Internal(_) => (StatusCode::INTERNAL_SERVER_ERROR, self.to_string()),
        };

        let body = serde_json::json!({
            "error": message,
            "status": status.as_u16(),
        });

        (status, axum::Json(body)).into_response()
    }
}
