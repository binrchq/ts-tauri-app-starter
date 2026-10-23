use serde::Serialize;
use serde_json::Value;
use tauri::State;

use crate::{
    model::{AppSettings, AppState, Item, ItemInput},
    service::{item as item_service, settings as settings_service},
};

#[derive(Serialize)]
pub struct SettingsResponse {
    pub success: bool,
    pub settings: AppSettings,
}

// ---------------------------------------------------------------- system ---

/// Build metadata used by the About section and platform detection.
#[tauri::command]
pub async fn get_app_info() -> Result<Value, String> {
    let platform = tauri_plugin_os::platform();
    Ok(serde_json::json!({
        "name": env!("CARGO_PKG_NAME"),
        "version": env!("CARGO_PKG_VERSION"),
        "platform": platform,
        "family": tauri_plugin_os::family(),
        "isMobile": platform == "android" || platform == "ios",
    }))
}

/// OS locale, used to pick an initial language on first launch.
#[tauri::command]
pub async fn get_system_locale() -> Result<String, String> {
    Ok(tauri_plugin_os::locale().unwrap_or_else(|| "en-US".to_string()))
}

// -------------------------------------------------------------- settings ---

#[tauri::command]
pub async fn get_settings(state: State<'_, AppState>) -> Result<SettingsResponse, String> {
    Ok(SettingsResponse {
        success: true,
        settings: settings_service::get_cached_settings(state.inner()),
    })
}

#[tauri::command]
pub async fn update_setting(
    key: String,
    value: Value,
    app: tauri::AppHandle,
    state: State<'_, AppState>,
) -> Result<SettingsResponse, String> {
    let settings = settings_service::update_setting(key, value, app, state).await?;
    Ok(SettingsResponse {
        success: true,
        settings,
    })
}

#[tauri::command]
pub async fn reset_settings(
    app: tauri::AppHandle,
    state: State<'_, AppState>,
) -> Result<SettingsResponse, String> {
    let settings = settings_service::reset_settings(app, state).await?;
    Ok(SettingsResponse {
        success: true,
        settings,
    })
}

// ----------------------------------------------------------------- items ---

#[tauri::command]
pub async fn list_items(state: State<'_, AppState>) -> Result<Vec<Item>, String> {
    Ok(item_service::list(state.inner()))
}

#[tauri::command]
pub async fn create_item(
    input: ItemInput,
    app: tauri::AppHandle,
    state: State<'_, AppState>,
) -> Result<Item, String> {
    item_service::create(input, app, state).await
}

#[tauri::command]
pub async fn update_item(
    id: String,
    input: ItemInput,
    app: tauri::AppHandle,
    state: State<'_, AppState>,
) -> Result<Item, String> {
    item_service::update(id, input, app, state).await
}

/// Partial update for quick toggles (star / archive) from list and inspector.
#[tauri::command]
pub async fn patch_item(
    id: String,
    favorite: Option<bool>,
    status: Option<String>,
    app: tauri::AppHandle,
    state: State<'_, AppState>,
) -> Result<Item, String> {
    item_service::patch(id, favorite, status, app, state).await
}

#[tauri::command]
pub async fn delete_item(
    id: String,
    app: tauri::AppHandle,
    state: State<'_, AppState>,
) -> Result<(), String> {
    item_service::delete(id, app, state).await
}