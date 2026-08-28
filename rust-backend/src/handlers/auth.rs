use axum::{extract::Request, Json};
use crate::models::{VerifyTokenRequest, UserPayload};
use crate::error::AppError;

pub async fn verify_token(
    Json(request): Json<VerifyTokenRequest>,
) -> Result<Json<UserPayload>, AppError> {
    // TODO: Verify Firebase ID token
    // let claims = crate::auth::verify_firebase_token(&request.id_token, &project_id)?;

    // TODO: Check age compliance
    // let age_check = crate::auth::check_age_compliance(birth_year, birth_month, birth_day);
    // if !age_check.allowed {
    //     return Err(AppError::Auth("Must be 13+ to use ColorGrade".into()));
    // }

    // TODO: Query database for user profile and token balance

    Ok(Json(UserPayload {
        uid: "demo_user".into(),
        email: "demo@colorgrade.app".into(),
        plan: "trial".into(),
        tokens_remaining: 3,
        trial_ends_at: Some(
            chrono::Utc::now()
                .checked_add_signed(chrono::Duration::days(3))
                .unwrap()
                .to_rfc3339(),
        ),
        age_verified: true,
        parental_consent: false,
    }))
}

pub async fn get_user(
    request: Request,
) -> Result<Json<UserPayload>, AppError> {
    // TODO: Extract auth token from Authorization header
    // TODO: Verify token and return user data

    Ok(Json(UserPayload {
        uid: "demo_user".into(),
        email: "demo@colorgrade.app".into(),
        plan: "trial".into(),
        tokens_remaining: 3,
        trial_ends_at: None,
        age_verified: true,
        parental_consent: false,
    }))
}
