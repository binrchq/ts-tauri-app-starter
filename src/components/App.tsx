import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { TopBar } from '@/components/layout/TopBar';
import { MobileTopBar } from '@/components/layout/MobileTopBar';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { AmbientBackground } from '@/components/theme/AmbientBackground';
import { GlassFilters } from '@/components/theme/GlassFilters';
import { Dashboard } from '@/components/views/Dashboard';
import { ItemsView } from '@/components/views/ItemsView';
import { SettingsView } from '@/components/views/SettingsView';
import { ItemFormModal } from '@/components/items/ItemFormModal';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Toast, type ToastMessage, type ToastType } from '@/components/common/Toast';
import { SurfaceProvider } from '@/components/theme/SurfaceContext';
import { useItems } from '@/hooks/useItems';
import { useSettings } from '@/hooks/useSettings';
import { useTheme } from '@/hooks/useTheme';
import { useMobile } from '@/hooks/useMobile';
import { api } from '@/api';
import i18n, { normalizeLanguage } from '@/i18n';
import type { AppInfo, AppSettings, AppView, Item, ItemInput, ThemePreference } from '@/types';

const VIEW_STORAGE_KEY = 'tauri-starter.view';

function readInitialView(): AppView {
  try {
    const stored = localStorage.getItem(VIEW_STORAGE_KEY);
    if (stored === 'dashboard' || stored === 'items' || stored === 'settings') {
      return stored;
    }
  } catch {
    // Ignore storage errors.
  }
  return 'dashboard';
}

export default function App() {
  const { t } = useTranslation();
  const { isMobile } = useMobile();
  const { settings, loading: settingsLoading, error: settingsError, updateSetting, resetSettings, reload } =
    useSettings();
  const { items, loading: itemsLoading, error: itemsError, createItem, updateItem, deleteItem, reload: reloadItems } =
    useItems();

  const [view, setView] = useState<AppView>(readInitialView);
  const [appInfo, setAppInfo] = useState<AppInfo | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [deletingItem, setDeletingItem] = useState<Item | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const toastId = useRef(0);

  useTheme(settings?.ui.theme);

  const notify = useCallback((message: string, type: ToastType = 'success') => {
    toastId.current += 1;
    setToast({ id: toastId.current, message, type });
  }, []);

  const closeToast = useCallback(() => setToast(null), []);

  // Persist the active view so a restart feels continuous.
  useEffect(() => {
    try {
      localStorage.setItem(VIEW_STORAGE_KEY, view);
    } catch {
      // Ignore storage errors.
    }
  }, [view]);

  // Load backend app info once.
  useEffect(() => {
    let cancelled = false;
    api.app
      .info()
      .then((info) => {
        if (!cancelled) setAppInfo(info);
      })
      .catch(() => {
        // Browser mock and non-Tauri environments still render.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Apply the persisted language once settings are available.
  useEffect(() => {
    if (!settings) return;
    const language = normalizeLanguage(settings.general.language);
    if (i18n.resolvedLanguage !== language) {
      void i18n.changeLanguage(language);
    }
  }, [settings]);

  const navigate = useCallback((next: AppView) => {
    setView(next);
  }, []);

  const openCreate = useCallback(() => {
    setEditingItem(null);
    setFormOpen(true);
  }, []);

  const openEdit = useCallback((item: Item) => {
    setEditingItem(item);
    setFormOpen(true);
  }, []);

  const closeForm = useCallback(() => {
    setFormOpen(false);
    setEditingItem(null);
  }, []);

  const handleSave = useCallback(
    async (input: ItemInput) => {
      try {
        if (editingItem) {
          await updateItem(editingItem.id, input);
          notify(t('toast.itemUpdated'));
        } else {
          await createItem(input);
          notify(t('toast.itemCreated'));
        }
      } catch (cause) {
        notify(cause instanceof Error ? cause.message : String(cause), 'error');
        throw cause;
      }
    },
    [createItem, editingItem, notify, t, updateItem],
  );

  const handleDelete = useCallback(async () => {
    if (!deletingItem) return;
    setDeleting(true);
    try {
      await deleteItem(deletingItem.id);
      setDeletingItem(null);
      notify(t('toast.itemDeleted'));
    } catch (cause) {
      notify(cause instanceof Error ? cause.message : String(cause), 'error');
    } finally {
      setDeleting(false);
    }
  }, [deleteItem, deletingItem, notify, t]);

  const changeTheme = useCallback(
    (theme: ThemePreference) => {
      if (!settings) return;
      void updateSetting('ui', { ...settings.ui, theme }).catch((cause) => {
        notify(cause instanceof Error ? cause.message : String(cause), 'error');
      });
    },
    [notify, settings, updateSetting],
  );

  const changeSettings = useCallback(
    async <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
      const next = await updateSetting(key, value);
      notify(t('toast.settingsSaved'));
      return next;
    },
    [notify, t, updateSetting],
  );

  const handleResetSettings = useCallback(async () => {
    const next = await resetSettings();
    notify(t('toast.settingsReset'));
    return next;
  }, [notify, resetSettings, t]);

  if (settingsLoading && !settings) {
    return <SplashScreen label={t('app.loading')} />;
  }

  if (!settings) {
    return (
      <SplashScreen
        label={settingsError ?? t('app.loadError')}
        action={
          <button type="button" className="btn-primary" onClick={() => void reload()}>
            {t('common.retry')}
          </button>
        }
      />
    );
  }

  const surface = settings.ui.surface;

  return (
    <SurfaceProvider surface={surface}>
      <div data-surface={surface} className="relative flex h-dvh flex-col overflow-hidden">
        <GlassFilters />
        <AmbientBackground />

        {isMobile ? (
          <MobileTopBar theme={settings.ui.theme} onThemeChange={changeTheme} />
        ) : (
          <TopBar
            view={view}
            onNavigate={navigate}
            theme={settings.ui.theme}
            onThemeChange={changeTheme}
          />
        )}

        <main className="min-h-0 flex-1 overflow-hidden">
            {view === 'dashboard' && (
              <Dashboard
                items={items}
                settings={settings}
                appInfo={appInfo}
                onNavigate={navigate}
                onCreate={openCreate}
                onEdit={openEdit}
              />
            )}

            {view === 'items' && (
              <ItemsView
                items={items}
                loading={itemsLoading}
                error={itemsError}
                pageSize={settings.ui.pageSize}
                compact={settings.ui.compact}
                onCreate={openCreate}
                onEdit={openEdit}
                onDelete={setDeletingItem}
                onReload={() => void reloadItems()}
              />
            )}

            {view === 'settings' && (
              <SettingsView
                settings={settings}
                appInfo={appInfo}
                onUpdate={changeSettings}
                onReset={handleResetSettings}
              />
            )}
          </main>

          {isMobile && <MobileBottomNav view={view} onNavigate={navigate} />}

          <ItemFormModal open={formOpen} item={editingItem} onClose={closeForm} onSave={handleSave} />

          <ConfirmDialog
            open={Boolean(deletingItem)}
            title={t('items.delete.title')}
            description={t('items.delete.description', { title: deletingItem?.title ?? '' })}
            confirmLabel={t('common.delete')}
            busy={deleting}
            onConfirm={handleDelete}
            onClose={() => setDeletingItem(null)}
          />

          <Toast toast={toast} onClose={closeToast} />
      </div>
    </SurfaceProvider>
  );
}

interface SplashScreenProps {
  label: string;
  action?: ReactNode;
}

function SplashScreen({ label, action }: SplashScreenProps) {
  return (
    <div className="relative flex h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <AmbientBackground />
      <img src="/logo.svg" alt="" className="h-16 w-16 rounded-2xl shadow-lg" />
      <div className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
        {!action && (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
        )}
        <span>{label}</span>
      </div>
      {action}
    </div>
  );
}