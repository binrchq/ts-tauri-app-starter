import { invoke } from './client';
import type {
  AppInfo,
  AppSettings,
  Item,
  ItemInput,
  SettingsResponse,
} from '@/types';

/**
 * Single API surface used by the UI. Components never call Tauri directly;
 * this keeps the command names in one place and makes mocking trivial.
 */
export const api = {
  app: {
    info: () => invoke<AppInfo>('get_app_info'),
    systemLocale: () => invoke<string>('get_system_locale'),
  },
  settings: {
    get: () => invoke<SettingsResponse>('get_settings'),
    update: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) =>
      invoke<SettingsResponse>('update_setting', { key, value }),
    reset: () => invoke<SettingsResponse>('reset_settings'),
  },
  items: {
    list: () => invoke<Item[]>('list_items'),
    create: (input: ItemInput) => invoke<Item>('create_item', { input }),
    update: (id: string, input: ItemInput) => invoke<Item>('update_item', { id, input }),
    remove: (id: string) => invoke<void>('delete_item', { id }),
  },
};

export type Api = typeof api;
export { invoke, isTauri } from './client';