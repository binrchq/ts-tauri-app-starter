use tauri::{AppHandle, State};

use crate::{
    dao,
    model::{AppState, Item, ItemInput},
    service::app_state,
    util::time,
};

const MAX_TITLE_LEN: usize = 120;
const MAX_DESCRIPTION_LEN: usize = 2000;
const MAX_TAGS: usize = 8;
const MAX_TAG_LEN: usize = 24;

/// Return the cached items (newest-first ordering is handled by the UI).
pub fn list(state: &AppState) -> Vec<Item> {
    state.items.lock().unwrap().clone()
}

pub async fn create(
    input: ItemInput,
    app: AppHandle,
    state: State<'_, AppState>,
) -> Result<Item, String> {
    app_state::ensure_items_loaded(&app, state.inner()).await?;

    let title = sanitize_title(&input.title)?;
    let now = time::now_iso();

    let item = Item {
        id: time::new_id(),
        title,
        description: truncate(input.description.trim(), MAX_DESCRIPTION_LEN),
        tags: normalize_tags(input.tags),
        created_at: now.clone(),
        updated_at: now,
    };

    {
        let mut items = state.items.lock().unwrap();
        items.insert(0, item.clone());
    }

    persist(&app, state.inner()).await?;
    Ok(item)
}

pub async fn update(
    id: String,
    input: ItemInput,
    app: AppHandle,
    state: State<'_, AppState>,
) -> Result<Item, String> {
    app_state::ensure_items_loaded(&app, state.inner()).await?;

    let title = sanitize_title(&input.title)?;

    let updated = {
        let mut items = state.items.lock().unwrap();
        let item = items
            .iter_mut()
            .find(|item| item.id == id)
            .ok_or_else(|| "item_not_found".to_string())?;

        item.title = title;
        item.description = truncate(input.description.trim(), MAX_DESCRIPTION_LEN);
        item.tags = normalize_tags(input.tags);
        item.updated_at = time::now_iso();
        item.clone()
    };

    persist(&app, state.inner()).await?;
    Ok(updated)
}

pub async fn delete(
    id: String,
    app: AppHandle,
    state: State<'_, AppState>,
) -> Result<(), String> {
    app_state::ensure_items_loaded(&app, state.inner()).await?;

    let removed = {
        let mut items = state.items.lock().unwrap();
        let before = items.len();
        items.retain(|item| item.id != id);
        items.len() != before
    };

    if !removed {
        return Err("item_not_found".to_string());
    }

    persist(&app, state.inner()).await
}

/// Snapshot the cache and write it to disk. The lock is released before the
/// await so the mutex guard never crosses a suspension point.
async fn persist(app: &AppHandle, state: &AppState) -> Result<(), String> {
    let snapshot = state.items.lock().unwrap().clone();
    dao::item::save_items(app, &snapshot).await
}

fn sanitize_title(raw: &str) -> Result<String, String> {
    let title = raw.trim();
    if title.is_empty() {
        return Err("title_required".to_string());
    }
    Ok(truncate(title, MAX_TITLE_LEN))
}

fn truncate(value: &str, max_chars: usize) -> String {
    value.chars().take(max_chars).collect()
}

fn normalize_tags(tags: Vec<String>) -> Vec<String> {
    let mut result: Vec<String> = Vec::new();

    for raw in tags {
        let tag = raw.trim().trim_start_matches('#').trim();
        if tag.is_empty() {
            continue;
        }

        let tag = truncate(tag, MAX_TAG_LEN);
        if !result.iter().any(|existing| existing.eq_ignore_ascii_case(&tag)) {
            result.push(tag);
        }

        if result.len() >= MAX_TAGS {
            break;
        }
    }

    result
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn rejects_blank_titles() {
        assert!(sanitize_title("   ").is_err());
        assert_eq!(sanitize_title("  hello  ").unwrap(), "hello");
    }

    #[test]
    fn tags_are_trimmed_deduped_and_capped() {
        let tags = normalize_tags(vec![
            " #design ".into(),
            "DESIGN".into(),
            String::new(),
            "backlog".into(),
        ]);
        assert_eq!(tags, vec!["design".to_string(), "backlog".to_string()]);
    }
}