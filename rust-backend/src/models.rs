use serde::{Deserialize, Serialize};
use uuid::Uuid;

// ── Grade Request ─────────────────────────────────

#[derive(Debug, Deserialize)]
pub struct GradeRequest {
    pub input_url: String,
    pub adjustments: GradeAdjustments,
    pub output_format: Option<String>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct GradeAdjustments {
    pub lut_preset: Option<String>,
    pub white_balance: Option<f32>,
    pub exposure: Option<f32>,
    pub contrast: Option<f32>,
    pub saturation: Option<f32>,
    pub brightness: Option<f32>,
    pub temperature: Option<f32>,
    pub shadows_hue: Option<f32>,
    pub midtones_hue: Option<f32>,
    pub highlights_hue: Option<f32>,
    pub shadows_sat: Option<f32>,
    pub midtones_sat: Option<f32>,
    pub highlights_sat: Option<f32>,
    pub hdr_strength: Option<f32>,
    pub highlight_recovery: Option<f32>,
    pub film_grain: Option<f32>,
    pub halation: Option<f32>,
    pub bloom: Option<f32>,
}

impl Default for GradeAdjustments {
    fn default() -> Self {
        Self {
            lut_preset: None,
            white_balance: Some(0.0),
            exposure: Some(0.0),
            contrast: Some(0.0),
            saturation: Some(0.0),
            brightness: Some(0.0),
            temperature: Some(0.0),
            shadows_hue: Some(0.0),
            midtones_hue: Some(0.0),
            highlights_hue: Some(0.0),
            shadows_sat: Some(100.0),
            midtones_sat: Some(100.0),
            highlights_sat: Some(100.0),
            hdr_strength: Some(0.0),
            highlight_recovery: Some(0.0),
            film_grain: Some(0.0),
            halation: Some(0.0),
            bloom: Some(0.0),
        }
    }
}

// ── Job Status ────────────────────────────────────

#[derive(Debug, Serialize)]
pub struct GradeJob {
    pub job_id: String,
    pub user_id: String,
    pub status: JobStatus,
    pub progress: f32,
    pub output_url: Option<String>,
    pub adjustments: GradeAdjustments,
    pub created_at: String,
    pub completed_at: Option<String>,
}

#[derive(Debug, Serialize, PartialEq)]
pub enum JobStatus {
    #[serde(rename = "pending")]
    Pending,
    #[serde(rename = "processing")]
    Processing,
    #[serde(rename = "completed")]
    Completed,
    #[serde(rename = "failed")]
    Failed,
}

// ── Upload ────────────────────────────────────────

#[derive(Debug, Deserialize)]
pub struct PresignRequest {
    pub file_name: String,
    pub file_type: String,
    pub file_size: u64,
}

#[derive(Debug, Serialize)]
pub struct PresignResponse {
    pub upload_url: String,
    pub file_key: String,
    pub expires_at: String,
}

// ── Auth ──────────────────────────────────────────

#[derive(Debug, Deserialize)]
pub struct VerifyTokenRequest {
    pub id_token: String,
}

#[derive(Debug, Serialize)]
pub struct UserPayload {
    pub uid: String,
    pub email: String,
    pub plan: String,
    pub tokens_remaining: u32,
    pub trial_ends_at: Option<String>,
    pub age_verified: bool,
    pub parental_consent: bool,
}

// ── LUT ───────────────────────────────────────────

#[derive(Debug, Serialize)]
pub struct LutPreset {
    pub id: String,
    pub name: String,
    pub category: String,
    pub preview_url: Option<String>,
}

// ── Webhook ───────────────────────────────────────

#[derive(Debug, Deserialize)]
pub struct StripeWebhookPayload {
    #[serde(rename = "type")]
    pub event_type: String,
    pub data: serde_json::Value,
}
