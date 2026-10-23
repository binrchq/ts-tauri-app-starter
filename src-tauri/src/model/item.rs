use serde::{Deserialize, Serialize};

/// Lifecycle states for an item.
pub const STATUS_ACTIVE: &str = "active";
pub const STATUS_ARCHIVED: &str = "archived";

/// A generic record owned by the application.
///
/// Intentionally domain-neutral: rename it (and the matching
/// command/service/dao files) to model your own data.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Item {
    pub id: String,
    pub title: String,
    #[serde(default)]
    pub description: String,
    #[serde(default)]
    pub tags: Vec<String>,
    #[serde(default)]
    pub favorite: bool,
    /// "active" | "archived"
    #[serde(default = "default_status")]
    pub status: String,
    pub created_at: String,
    pub updated_at: String,
}

/// Payload accepted from the frontend when creating or updating an item.
#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ItemInput {
    pub title: String,
    #[serde(default)]
    pub description: String,
    #[serde(default)]
    pub tags: Vec<String>,
    #[serde(default)]
    pub favorite: bool,
    #[serde(default = "default_status")]
    pub status: String,
}

fn default_status() -> String {
    STATUS_ACTIVE.to_string()
}