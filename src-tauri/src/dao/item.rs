use tauri::AppHandle;

use super::storage;
use crate::{model::Item, util::constants::ITEMS_FILE};

/// Load every stored item. A corrupt file degrades to an empty list instead of
/// blocking application start-up.
pub async fn load_items(app: &AppHandle) -> Result<Vec<Item>, String> {
    match storage::read_json::<Vec<Item>>(app, ITEMS_FILE).await {
        Ok(Some(items)) => Ok(items),
        Ok(None) => Ok(Vec::new()),
        Err(error) => {
            eprintln!("{error}; starting with an empty item list");
            Ok(Vec::new())
        }
    }
}

pub async fn save_items(app: &AppHandle, items: &[Item]) -> Result<(), String> {
    storage::write_json(app, ITEMS_FILE, &items).await
}