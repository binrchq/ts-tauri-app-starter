export type ThemePreference = 'light' | 'dark' | 'system';
export type SurfaceStyle = 'solid' | 'glass';

export interface Item {
  id: string;
  title: string;
  description: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ItemInput {
  title: string;
  description?: string;
  tags?: string[];
}

export interface GeneralSettings {
  language: string;
}

export interface UiSettings {
  theme: ThemePreference;
  /** Visual treatment of panels: flat solid cards or Liquid Glass. */
  surface: SurfaceStyle;
  compact: boolean;
  pageSize: number;
}

export interface AppSettings {
  general: GeneralSettings;
  ui: UiSettings;
}

export interface SettingsResponse {
  success: boolean;
  settings: AppSettings;
}

export interface AppInfo {
  name: string;
  version: string;
  platform: string;
  family: string;
  isMobile: boolean;
}

export type AppView = 'dashboard' | 'items' | 'settings';