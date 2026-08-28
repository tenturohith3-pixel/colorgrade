use jsonwebtoken::{decode, DecodingKey, Validation, Algorithm};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,
    pub email: Option<String>,
    pub exp: usize,
    pub iat: usize,
    pub firebase: FirebaseClaims,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct FirebaseClaims {
    pub identities: serde_json::Value,
    pub sign_in_provider: String,
}

/// Verify a Firebase ID token using the Firebase public keys.
///
/// In production, fetch and cache the Firebase public keys from:
/// https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com
///
/// For now, this validates the token structure and returns claims.
pub fn verify_firebase_token(
    id_token: &str,
    _project_id: &str,
) -> Result<Claims, anyhow::Error> {
    // Decode without signature verification for demo
    // In production, use the Firebase public keys for proper verification

    let parts: Vec<&str> = id_token.split('.').collect();
    if parts.len() != 3 {
        return Err(anyhow::anyhow!("Invalid token format"));
    }

    // Decode the payload (second part)
    let payload = parts[1];
    let padding = match payload.len() % 4 {
        2 => "==",
        3 => "=",
        _ => "",
    };
    let decoded = base64_decode(&format!("{}{}", payload, padding))?;
    let claims: Claims = serde_json::from_slice(&decoded)?;

    Ok(claims)
}

/// Check age compliance (COPPA/GDPR/DPDP)
pub fn check_age_compliance(birth_year: i32, birth_month: u32, birth_day: u32) -> AgeCheck {
    let now = chrono::Utc::now();
    let mut age = (now.year() - birth_year) as u32;
    if (now.month() as u32) < birth_month || (now.month() as u32 == birth_month && (now.day() as u32) < birth_day) {
        age -= 1;
    }

    AgeCheck {
        allowed: age >= 13,
        requires_parental_consent: age >= 13 && age < 18,
        age,
    }
}

#[derive(Debug)]
pub struct AgeCheck {
    pub allowed: bool,
    pub requires_parental_consent: bool,
    pub age: u32,
}

/// Simple base64url decode
fn base64_decode(input: &str) -> Result<Vec<u8>, anyhow::Error> {
    use base64::{Engine, engine::general_purpose::URL_SAFE_NO_PAD};
    // Add padding
    let mut s = input.to_string();
    while s.len() % 4 != 0 {
        s.push('=');
    }
    Ok(URL_SAFE_NO_PAD.decode(&s)?)
}
