import { invoke as tauriInvoke } from '@tauri-apps/api/core';
import type { AppInfo, AppSettings, GeneralSettings, Item, ItemInput, UiSettings } from '@/types';
import { normalizeTags } from '@/lib/utils';

const MOCK_STORAGE_KEY = 'tauri-starter.mock.v1';

export function isTauri() {
  return typeof window !== 'undefined' && Boolean(window.__TAURI_INTERNALS__);
}

const defaultSettings = (): AppSettings => ({
  general: { language: 'en' },
  ui: { theme: 'system', surface: 'solid', compact: false, pageSize: 12 },
});

const seedItems = (): Item[] => {
  const now = new Date();
  const iso = (minutesAgo: number) =>
    new Date(now.getTime() - minutesAgo * 60_000).toISOString();

  return [
    {
      id: 'welcome',
      title: 'Welcome to your new app',
      description:
        'This starter ships with a typed React shell, a layered Rust backend and a ready-to-use CRUD example.',
      tags: ['starter', 'welcome'],
      createdAt: iso(120),
      updatedAt: iso(5),
    },
    {
      id: 'customize',
      title: 'Make it yours',
      description:
        'Change the product name, colors, identifier and icons. Every placeholder is documented in the README.',
      tags: ['theme', 'branding'],
      createdAt: iso(240),
      updatedAt: iso(30),
    },
    {
      id: 'extend',
      title: 'Add your first domain feature',
      description:
        'Follow the commands → service → dao → model flow to add a new capability without breaking the architecture.',
      tags: ['architecture', 'rust'],
      createdAt: iso(360),
      updatedAt: iso(60),
    },
  ];
};

interface MockDb {
  settings: AppSettings;
  items: Item[];
}

function mergeSettings(value: Partial<AppSettings> | undefined): AppSettings {
  const defaults = defaultSettings();
  return {
    general: { ...defaults.general, ...(value?.general ?? {}) },
    ui: { ...defaults.ui, ...(value?.ui ?? {}) },
  };
}

function writeMockDb(db: MockDb) {
  try {
    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(db));
  } catch {
    // Storage can be unavailable in private mode; the in-memory copy still works.
  }
}

function readMockDb(): MockDb {
  try {
    const raw = localStorage.getItem(MOCK_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<MockDb>;
      return {
        settings: mergeSettings(parsed.settings),
        items: Array.isArray(parsed.items) ? parsed.items : seedItems(),
      };
    }
  } catch {
    // Fall back to a fresh database.
  }

  const db: MockDb = { settings: defaultSettings(), items: seedItems() };
  writeMockDb(db);
  return db;
}

function mockUid() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `mock-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function mockPlatform(): Pick<AppInfo, 'platform' | 'family' | 'isMobile'> {
  if (typeof navigator === 'undefined') {
    return { platform: 'web', family: 'web', isMobile: false };
  }
  const ua = navigator.userAgent;
  if (/Android/i.test(ua)) return { platform: 'android', family: 'mobile', isMobile: true };
  if (/iPhone|iPad|iPod/i.test(ua)) return { platform: 'ios', family: 'mobile', isMobile: true };
  if (/Macintosh|Mac OS X/i.test(ua)) return { platform: 'macos', family: 'desktop', isMobile: false };
  if (/Windows/i.test(ua)) return { platform: 'windows', family: 'desktop', isMobile: false };
  if (/Linux/i.test(ua)) return { platform: 'linux', family: 'desktop', isMobile: false };
  return { platform: 'web', family: 'web', isMobile: false };
}

const delay = (ms = 60) => new Promise((resolve) => setTimeout(resolve, ms));

/** Browser-only mock so `npm run dev` works without the Rust side. */
async function mockInvoke(command: string, args: Record<string, unknown>): Promise<unknown> {
  await delay();
  const db = readMockDb();

  switch (command) {
    case 'get_app_info':
      return {
        name: 'ts-tauri-app-starter',
        version: '0.1.0',
        ...mockPlatform(),
      } satisfies AppInfo;

    case 'get_system_locale':
      return typeof navigator !== 'undefined' ? navigator.language : 'en-US';

    case 'get_settings':
      return { success: true, settings: db.settings };

    case 'update_setting': {
      const key = String(args.key);

      if (key === 'general') {
        db.settings.general = {
          ...db.settings.general,
          ...(args.value as Partial<GeneralSettings>),
        };
      } else if (key === 'ui') {
        db.settings.ui = {
          ...db.settings.ui,
          ...(args.value as Partial<UiSettings>),
        };
      } else {
        throw new Error(`Unsupported setting: ${key}`);
      }

      writeMockDb(db);
      return { success: true, settings: db.settings };
    }

    case 'reset_settings':
      db.settings = defaultSettings();
      writeMockDb(db);
      return { success: true, settings: db.settings };

    case 'list_items':
      return db.items;

    case 'create_item': {
      const input = args.input as ItemInput;
      const now = new Date().toISOString();
      const item: Item = {
        id: mockUid(),
        title: (input.title ?? '').trim(),
        description: (input.description ?? '').trim(),
        tags: normalizeTags(input.tags),
        createdAt: now,
        updatedAt: now,
      };
      db.items = [item, ...db.items];
      writeMockDb(db);
      return item;
    }

    case 'update_item': {
      const id = String(args.id);
      const input = args.input as ItemInput;
      const index = db.items.findIndex((item) => item.id === id);
      if (index === -1) throw new Error('Item not found');

      const current = db.items[index];
      const updated: Item = {
        ...current,
        title: (input.title ?? current.title).trim(),
        description: (input.description ?? '').trim(),
        tags: normalizeTags(input.tags ?? current.tags),
        updatedAt: new Date().toISOString(),
      };
      db.items = db.items.map((item) => (item.id === id ? updated : item));
      writeMockDb(db);
      return updated;
    }

    case 'delete_item': {
      const id = String(args.id);
      db.items = db.items.filter((item) => item.id !== id);
      writeMockDb(db);
      return undefined;
    }

    default:
      throw new Error(`[browser mock] Unsupported command: ${command}`);
  }
}

/** Typed bridge to the Rust backend. Falls back to a localStorage mock in a browser. */
export async function invoke<T>(
  command: string,
  args: Record<string, unknown> = {},
): Promise<T> {
  if (!isTauri()) {
    return (await mockInvoke(command, args)) as T;
  }
  return tauriInvoke<T>(command, args);
}