use std::sync::Mutex;

use super::{AppSettings, Item};

/// Runtime state shared by every command.
///
/// Disk is the source of truth; these mutexes are a warm cache so reads do not
/// hit the filesystem on every invoke.
pub struct AppState {
    pub settings: Mutex<AppSettings>,
    pub items: Mutex<Vec<Item>>,
    pub items_loaded: Mutex<bool>,
}

impl Default for AppState {
    fn default() -> Self {
        Self {
            settings: Mutex::new(AppSettings::default()),
            items: Mutex::new(Vec::new()),
            items_loaded: Mutex::new(false),
        }
    }
}