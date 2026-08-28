use axum::{extract::{Path, State}, Json};
use crate::models::{GradeRequest, GradeJob, JobStatus};
use crate::error::AppError;
use uuid::Uuid;

pub async fn create_job(
    Json(request): Json<GradeRequest>,
) -> Result<Json<GradeJob>, AppError> {
    // Validate input
    if request.input_url.is_empty() {
        return Err(AppError::InvalidFile("Input URL is required".into()));
    }

    let job_id = Uuid::new_v4().to_string();

    let job = GradeJob {
        job_id: job_id.clone(),
        user_id: "demo_user".into(), // Extract from auth in production
        status: JobStatus::Pending,
        progress: 0.0,
        output_url: None,
        adjustments: request.adjustments,
        created_at: chrono::Utc::now().to_rfc3339(),
        completed_at: None,
    };

    // TODO: Store job in database
    // TODO: Queue for processing (tokio::spawn or external worker)
    // tokio::spawn(process_job(job_id, request));

    tracing::info!("Created grading job: {}", job_id);

    Ok(Json(job))
}

pub async fn get_status(
    Path(job_id): Path<String>,
) -> Result<Json<GradeJob>, AppError> {
    // TODO: Query database for job
    let job = GradeJob {
        job_id: job_id.clone(),
        user_id: "demo_user".into(),
        status: JobStatus::Pending,
        progress: 0.0,
        output_url: None,
        adjustments: crate::models::GradeAdjustments::default(),
        created_at: chrono::Utc::now().to_rfc3339(),
        completed_at: None,
    };

    Ok(Json(job))
}
