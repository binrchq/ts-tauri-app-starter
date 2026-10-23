use tauri::AppHandle;

use crate::{dao, model::AppState, service::settings as settings_service};

/// Warm the in-memory cache from disk. Called once during `setup`.
pub async fn initialize(app: &AppHandle, state: &AppState) -> Result<(), String> {
    let settings = settings_service::load_settings(app).await?;
    *state.settings.lock().unwrap() = settings;

    let items = dao::item::load_items(app).await?;
    *state.items.lock().unwrap() = items;
    *state.items_loaded.lock().unwrap() = true;

    Ok(())
}

/// Lazily load items if `initialize` has not run yet (e.g. after a hot reload).
pub async fn ensure_items_loaded(app: &AppHandle, state: &AppState) -> Result<(), String> {
    if *state.items_loaded.lock().unwrap() {
        return Ok(());
    }

    let items = dao::item::load_items(app).await?;
    *state.items.lock().unwrap() = items;
    *state.items_loaded.lock().unwrap() = true;

    Ok(())
}