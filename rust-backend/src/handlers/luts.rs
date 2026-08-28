use axum::Json;
use crate::models::LutPreset;

pub async fn list_presets() -> Json<Vec<LutPreset>> {
    Json(vec![
        LutPreset { id: "moody".into(), name: "Moody Cinematic".into(), category: "basic".into(), preview_url: None },
        LutPreset { id: "warm".into(), name: "Warm Tone".into(), category: "basic".into(), preview_url: None },
        LutPreset { id: "clean".into(), name: "Clean Minimal".into(), category: "basic".into(), preview_url: None },
        LutPreset { id: "cool".into(), name: "Cool Blue".into(), category: "basic".into(), preview_url: None },
        LutPreset { id: "vintage".into(), name: "Vintage Film".into(), category: "pro".into(), preview_url: None },
        LutPreset { id: "neon".into(), name: "Neon Pop".into(), category: "pro".into(), preview_url: None },
        LutPreset { id: "pastel".into(), name: "Muted Pastel".into(), category: "pro".into(), preview_url: None },
    ])
}

pub async fn upload_custom(
    axum::extract::Multipart(multipart): axum::extract::Multipart,
) -> Result<Json<serde_json::Value>, crate::error::AppError> {
    // TODO: Validate .cube file format
    // TODO: Parse LUT data
    // TODO: Store in database linked to user
    // TODO: Return preset info

    Ok(Json(serde_json::json!({
        "success": true,
        "message": "Custom LUT upload endpoint ready — connect storage backend"
    })))
}
