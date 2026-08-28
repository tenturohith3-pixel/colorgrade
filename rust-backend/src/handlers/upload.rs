use axum::Json;
use crate::models::{PresignRequest, PresignResponse};
use crate::error::AppError;

/// Allowed file types with magic bytes validation
const ALLOWED_TYPES: &[(&str, &[u8])] = &[
    ("video/mp4", b"\x00\x00\x00\x18ftyp"),
    ("video/quicktime", b"\x00\x00\x00\x1cftypqt  "),
    ("image/jpeg", b"\xff\xd8\xff"),
    ("image/png", b"\x89PNG"),
    ("image/webp", b"RIFF"),
];

/// Maximum file sizes in bytes
const MAX_VIDEO_SIZE: u64 = 500 * 1024 * 1024; // 500MB
const MAX_IMAGE_SIZE: u64 = 50 * 1024 * 1024;  // 50MB

pub async fn get_presigned_url(
    Json(request): Json<PresignRequest>,
) -> Result<Json<PresignResponse>, AppError> {
    // Validate file type
    let is_allowed = ALLOWED_TYPES.iter().any(|(mime, _)| *mime == request.file_type);
    if !is_allowed {
        return Err(AppError::InvalidFile(format!(
            "File type '{}' not allowed. Accepted: mp4, mov, jpg, png, webp",
            request.file_type
        )));
    }

    // Validate file size
    let max_size = if request.file_type.starts_with("video/") {
        MAX_VIDEO_SIZE
    } else {
        MAX_IMAGE_SIZE
    };

    if request.file_size > max_size {
        return Err(AppError::FileTooLarge {
            size: request.file_size,
            max: max_size,
        });
    }

    // Generate unique file key
    let ext = request.file_name.split('.').last().unwrap_or("bin");
    let file_key = format!("uploads/{}/{}/{}.{}",
        chrono::Utc::now().format("%Y/%m/%d"),
        uuid::Uuid::new_v4(),
        "original",
        ext
    );

    // TODO: Generate pre-signed S3 URL with 5-minute TTL
    // let presigned = s3_client
    //     .put_object()
    //     .bucket(&bucket)
    //     .key(&file_key)
    //     .content_type(&request.file_type)
    //     .presigned(PresigningConfig::expires_in(Duration::from_secs(300))?)
    //     .await?;

    let upload_url = format!(
        "https://s3.example.com/colorgrade/{}?presigned=demo",
        file_key
    );

    let expires_at = chrono::Utc::now()
        .checked_add_signed(chrono::Duration::minutes(5))
        .unwrap()
        .to_rfc3339();

    Ok(Json(PresignResponse {
        upload_url,
        file_key,
        expires_at,
    }))
}

pub async fn confirm_upload(
    Json(_request): Json<serde_json::Value>,
) -> Result<Json<serde_json::Value>, AppError> {
    // TODO: Verify file exists in S3
    // TODO: Check magic bytes match claimed type
    // TODO: Store file record in database
    // TODO: Trigger auto-purge after 24 hours

    Ok(Json(serde_json::json!({
        "success": true,
        "message": "Upload confirmed"
    })))
}
