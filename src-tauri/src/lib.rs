mod commands;
mod dao;
mod model;
mod service;
mod util;

use commands::*;
use model::AppState;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    #[allow(unused_mut)]
    let mut builder = tauri::Builder::default()
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init());

    // Window geometry restore is desktop-only.
    #[cfg(not(any(target_os = "android", target_os = "ios")))]
    {
        builder = builder.plugin(tauri_plugin_window_state::Builder::default().build());
    }

    builder
        .manage(AppState::default())
        .setup(|app| {
            let app_handle = app.handle();
            let state = app.state::<AppState>();

            if let Err(error) = tauri::async_runtime::block_on(async {
                service::app_state::initialize(app_handle, state.inner()).await
            }) {
                eprintln!("failed to initialize app state: {error}");
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // system
            get_app_info,
            get_system_locale,
            // settings
            get_settings,
            update_setting,
            reset_settings,
            // items
            list_items,
            create_item,
            update_item,
            patch_item,
            delete_item,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}