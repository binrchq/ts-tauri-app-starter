use serde_json::Value;
use tauri::{AppHandle, State};

use crate::{
    dao,
    model::{
        settings::{LANGUAGES, SURFACES, THEMES},
        AppSettings, AppState, GeneralSettings, UiSettings,
    },
};

/// Load persisted settings, falling back to defaults when absent or corrupt.
pub async fn load_settings(app: &AppHandle) -> Result<AppSettings, String> {
    match dao::settings::load_settings(app).await {
        Ok(Some(settings)) => Ok(settings),
        Ok(None) => Ok(AppSettings::default()),
        Err(error) => {
            eprintln!("{error}; falling back to default settings");
            Ok(AppSettings::default())
        }
    }
}

pub async fn save_settings(app: &AppHandle, settings: &AppSettings) -> Result<(), String> {
    dao::settings::save_settings(app, settings).await
}

pub fn get_cached_settings(state: &AppState) -> AppSettings {
    state.settings.lock().unwrap().clone()
}

/// Update a single top-level settings group ("general" or "ui").
pub async fn update_setting(
    key: String,
    value: Value,
    app: AppHandle,
    state: State<'_, AppState>,
) -> Result<AppSettings, String> {
    let mut current = state.settings.lock().unwrap().clone();
    apply_setting(&mut current, &key, value)?;

    save_settings(&app, &current).await?;
    *state.settings.lock().unwrap() = current.clone();

    Ok(current)
}

pub async fn reset_settings(
    app: AppHandle,
    state: State<'_, AppState>,
) -> Result<AppSettings, String> {
    let defaults = AppSettings::default();
    save_settings(&app, &defaults).await?;
    *state.settings.lock().unwrap() = defaults.clone();
    Ok(defaults)
}

fn apply_setting(settings: &mut AppSettings, key: &str, value: Value) -> Result<(), String> {
    match key {
        "general" => {
            let mut update: GeneralSettings = serde_json::from_value(value)
                .map_err(|error| format!("invalid_general_settings: {error}"))?;

            if !LANGUAGES.contains(&update.language.as_str()) {
                update.language = GeneralSettings::default().language;
            }

            settings.general = update;
        }
        "ui" => {
            let mut update: UiSettings = serde_json::from_value(value)
                .map_err(|error| format!("invalid_ui_settings: {error}"))?;

            let defaults = UiSettings::default();
            if !THEMES.contains(&update.theme.as_str()) {
                update.theme = defaults.theme;
            }
            if !SURFACES.contains(&update.surface.as_str()) {
                update.surface = defaults.surface;
            }
            update.page_size = update.page_size.clamp(1, 200);

            settings.ui = update;
        }
        other => return Err(format!("unsupported_setting: {other}")),
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn unknown_values_fall_back_to_defaults() {
        let mut settings = AppSettings::default();
        apply_setting(
            &mut settings,
            "ui",
            serde_json::json!({ "theme": "neon", "surface": "marble", "pageSize": 9000 }),
        )
        .unwrap();

        assert_eq!(settings.ui.theme, "system");
        assert_eq!(settings.ui.surface, "solid");
        assert_eq!(settings.ui.page_size, 200);
    }

    #[test]
    fn rejects_unknown_keys() {
        let mut settings = AppSettings::default();
        assert!(apply_setting(&mut settings, "nope", serde_json::json!({})).is_err());
    }
}