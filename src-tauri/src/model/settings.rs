use serde::{Deserialize, Serialize};

/// Locale and other non-visual preferences.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GeneralSettings {
    #[serde(default = "default_language")]
    pub language: String,
}

impl Default for GeneralSettings {
    fn default() -> Self {
        Self {
            language: default_language(),
        }
    }
}

/// Visual preferences shared with the React shell.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UiSettings {
    /// "light" | "dark" | "system"
    #[serde(default = "default_theme")]
    pub theme: String,
    /// "solid" | "glass" (Liquid Glass surfaces)
    #[serde(default = "default_surface")]
    pub surface: String,
    #[serde(default)]
    pub compact: bool,
    #[serde(default = "default_page_size")]
    pub page_size: u32,
}

impl Default for UiSettings {
    fn default() -> Self {
        Self {
            theme: default_theme(),
            surface: default_surface(),
            compact: false,
            page_size: default_page_size(),
        }
    }
}

/// Aggregate of every persisted preference.
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct AppSettings {
    #[serde(default)]
    pub general: GeneralSettings,
    #[serde(default)]
    pub ui: UiSettings,
}

pub const THEMES: [&str; 3] = ["light", "dark", "system"];
pub const SURFACES: [&str; 2] = ["solid", "glass"];
pub const LANGUAGES: [&str; 2] = ["en", "zh-CN"];

fn default_language() -> String {
    "en".to_string()
}

fn default_theme() -> String {
    "system".to_string()
}

fn default_surface() -> String {
    "solid".to_string()
}

fn default_page_size() -> u32 {
    12
}