/// S3 Storage helpers for file management
///
/// Handles:
/// - Pre-signed URL generation (upload + download)
/// - 24-hour auto-purge lifecycle
/// - File metadata storage

use aws_sdk_s3::Client;

pub struct StorageClient {
    client: Client,
    bucket: String,
}

impl StorageClient {
    pub async fn new() -> Result<Self, anyhow::Error> {
        let config = aws_config::load_from_env().await;
        let client = Client::new(&config);
        let bucket = std::env::var("S3_BUCKET").unwrap_or_else(|_| "colorgrade-media".into());

        Ok(Self { client, bucket })
    }

    /// Generate a pre-signed upload URL with 5-minute TTL
    pub async fn get_presigned_upload_url(
        &self,
        key: &str,
        content_type: &str,
    ) -> Result<String, anyhow::Error> {
        use aws_sdk_s3::presigning::PresigningConfig;

        let presigned = self
            .client
            .put_object()
            .bucket(&self.bucket)
            .key(key)
            .content_type(content_type)
            .presigned(PresigningConfig::expires_in(
                std::time::Duration::from_secs(300),
            )?)
            .await?;

        Ok(presigned.uri().to_string())
    }

    /// Generate a pre-signed download URL with 1-hour TTL
    pub async fn get_presigned_download_url(&self, key: &str) -> Result<String, anyhow::Error> {
        use aws_sdk_s3::presigning::PresigningConfig;

        let presigned = self
            .client
            .get_object()
            .bucket(&self.bucket)
            .key(key)
            .presigned(PresigningConfig::expires_in(
                std::time::Duration::from_secs(3600),
            )?)
            .await?;

        Ok(presigned.uri().to_string())
    }

    /// Delete a file from storage (used by auto-purge)
    pub async fn delete_file(&self, key: &str) -> Result<(), anyhow::Error> {
        self.client
            .delete_object()
            .bucket(&self.bucket)
            .key(key)
            .send()
            .await?;
        Ok(())
    }

    /// Check if a file exists
    pub async fn file_exists(&self, key: &str) -> Result<bool, anyhow::Error> {
        match self
            .client
            .head_object()
            .bucket(&self.bucket)
            .key(key)
            .send()
            .await
        {
            Ok(_) => Ok(true),
            Err(_) => Ok(false),
        }
    }
}

/// Lifecycle rule for 24-hour auto-purge
pub const PURGE_LIFECYCLE_RULE: &str = r#"{
    "Rules": [{
        "ID": "auto-purge-uploads",
        "Status": "Enabled",
        "Filter": { "Prefix": "uploads/" },
        "Expiration": { "Days": 1 },
        "NoncurrentVersionExpiration": { "NoncurrentDays": 1 }
    }]
}"#;
