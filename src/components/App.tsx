import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { WorkspaceToolbar, type LayoutMode } from '@/components/layout/WorkspaceToolbar';
import { InspectorPanel } from '@/components/layout/InspectorPanel';
import { WorkspaceView } from '@/components/views/WorkspaceView';
import { SettingsView } from '@/components/views/SettingsView';
import { ItemFormModal } from '@/components/items/ItemFormModal';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Toast, type ToastMessage, type ToastType } from '@/components/common/Toast';
import { SurfaceProvider } from '@/components/theme/SurfaceContext';
import { AmbientBackground } from '@/components/theme/AmbientBackground';
import { GlassFilters } from '@/components/theme/GlassFilters';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { useItems } from '@/hooks/useItems';
import { useSettings } from '@/hooks/useSettings';
import { useTheme } from '@/hooks/useTheme';
import { api } from '@/api';
import i18n, { normalizeLanguage } from '@/i18n';
import type {
  AppInfo,
  AppSettings,
  AppView,
  Item,
  ItemInput,
  ItemScope,
  ThemePreference,
} from '@/types';
import { cn } from '@/lib/utils';

const VIEW_STORAGE_KEY = 'tauri-starter.view';
const LAYOUT_STORAGE_KEY = 'tauri-starter.layout';

function readStored<T extends string>(key: string, allowed: readonly T[], fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    if (value && (allowed as readonly string[]).includes(value)) return value as T;
  } catch {
    /* ignore */
  }
  return fallback;
}

export default function App() {
  const { t } = useTranslation();
  const {
    settings,
    loading: settingsLoading,
    error: settingsError,
    updateSetting,
    resetSettings,
    reload,
  } = useSettings();
  const {
    items,
    loading: itemsLoading,
    createItem,
    updateItem,
    patchItem,
    deleteItem,
  } = useItems();

  // ---- chrome state --------------------------------------------------------
  const [view, setView] = useState<AppView>(() =>
    readStored(VIEW_STORAGE_KEY, ['workspace', 'settings'] as const, 'workspace'),
  );
  const [layout, setLayout] = useState<LayoutMode>(() =>
    readStored(LAYOUT_STORAGE_KEY, ['list', 'grid'] as const, 'list'),
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [appInfo, setAppInfo] = useState<AppInfo | null>(null);

  // ---- query state ---------------------------------------------------------
  const [scope, setScope] = useState<ItemScope>('all');
  const [tag, setTag] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // ---- dialogs -------------------------------------------------------------
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

  useEffect(() => {
    try {
      localStorage.setItem(VIEW_STORAGE_KEY, view);
      localStorage.setItem(LAYOUT_STORAGE_KEY, layout);
    } catch {
      /* ignore */
    }
  }, [view, layout]);

  useEffect(() => {
    let cancelled = false;
    api.app
      .info()
      .then((info) => {
        if (!cancelled) setAppInfo(info);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!settings) return;
    const language = normalizeLanguage(settings.general.language);
    if (i18n.resolvedLanguage !== language) void i18n.changeLanguage(language);
  }, [settings]);

  // ---- derived data --------------------------------------------------------
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return items.filter((item) => {
      if (scope === 'favorite' && !item.favorite) return false;
      if (scope === 'active' && item.status !== 'active') return false;
      if (scope === 'archived' && item.status !== 'archived') return false;
      if (scope !== 'archived' && item.status === 'archived') return false;
      if (tag && !item.tags.includes(tag)) return false;
      if (!needle) return true;
      return (
        item.title.toLowerCase().includes(needle) ||
        item.description.toLowerCase().includes(needle) ||
        item.tags.some((name) => name.toLowerCase().includes(needle))
      );
    });
  }, [items, scope, tag, query]);

  const selected = useMemo(
    () => items.find((item) => item.id === selectedId) ?? null,
    [items, selectedId],
  );

  // Drop the selection when it falls out of the current filter.
  useEffect(() => {
    if (selectedId && !filtered.some((item) => item.id === selectedId)) {
      setSelectedId(null);
    }
  }, [filtered, selectedId]);

  const scopeLabel = scope === 'all'
    ? t('sidebar.all')
    : scope === 'favorite'
      ? t('sidebar.favorites')
      : scope === 'active'
        ? t('sidebar.active')
        : t('sidebar.archived');

  const title = tag ? `#${tag}` : scopeLabel;
  const subtitle = t('workspace.count', { count: filtered.length });

  const isFiltered = Boolean(query || tag || scope !== 'all');

  const clearFilters = useCallback(() => {
    setQuery('');
    setTag(null);
    setScope('all');
  }, []);

  // ---- actions -------------------------------------------------------------
  const openCreate = useCallback(() => {
    setEditingItem(null);
    setFormOpen(true);
    setSidebarOpen(false);
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
      if (editingItem) {
        const next = await updateItem(editingItem.id, input);
        notify(t('toast.itemUpdated'));
        setSelectedId(next.id);
      } else {
        const created = await createItem(input);
        notify(t('toast.itemCreated'));
        setSelectedId(created.id);
        setView('workspace');
      }
    },
    [createItem, editingItem, notify, t, updateItem],
  );

  const handleDelete = useCallback(async () => {
    if (!deletingItem) return;
    setDeleting(true);
    try {
      await deleteItem(deletingItem.id);
      if (selectedId === deletingItem.id) setSelectedId(null);
      setDeletingItem(null);
      notify(t('toast.itemDeleted'));
    } catch (cause) {
      notify(cause instanceof Error ? cause.message : String(cause), 'error');
    } finally {
      setDeleting(false);
    }
  }, [deleteItem, deletingItem, notify, selectedId, t]);

  const handleToggleFavorite = useCallback(
    async (item: Item) => {
      try {
        await patchItem(item.id, { favorite: !item.favorite });
      } catch (cause) {
        notify(cause instanceof Error ? cause.message : String(cause), 'error');
      }
    },
    [notify, patchItem],
  );

  const handleToggleArchive = useCallback(
    async (item: Item) => {
      const nextStatus = item.status === 'archived' ? 'active' : 'archived';
      try {
        await patchItem(item.id, { status: nextStatus });
        notify(nextStatus === 'archived' ? t('toast.archived') : t('toast.restored'));
      } catch (cause) {
        notify(cause instanceof Error ? cause.message : String(cause), 'error');
      }
    },
    [notify, patchItem, t],
  );

  const changeTheme = useCallback(
    (theme: ThemePreference) => {
      if (!settings) return;
      void updateSetting('ui', { ...settings.ui, theme }).catch((cause) =>
        notify(cause instanceof Error ? cause.message : String(cause), 'error'),
      );
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

  // ---- render --------------------------------------------------------------
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

  const sidebar = (
    <AppSidebar
      items={items}
      scope={scope}
      onScope={setScope}
      tag={tag}
      onTag={setTag}
      view={view}
      onView={setView}
      onCompose={openCreate}
      appInfo={appInfo}
    />
  );

  return (
    <SurfaceProvider surface={surface}>
      <div data-surface={surface} className="relative flex h-dvh overflow-hidden">
        <GlassFilters />
        <AmbientBackground />

        {/* Sidebar — static on desktop */}
        <div className="hidden lg:flex">{sidebar}</div>

        {/* Sidebar — drawer on mobile */}
        <div
          className={cn(
            'fixed inset-0 z-[90] lg:hidden',
            sidebarOpen ? 'pointer-events-auto' : 'pointer-events-none',
          )}
          aria-hidden={!sidebarOpen}
        >
          <div
            onClick={() => setSidebarOpen(false)}
            className={cn(
              'absolute inset-0 bg-slate-950/45 backdrop-blur-sm transition-opacity',
              sidebarOpen ? 'opacity-100' : 'opacity-0',
            )}
          />
          <div
            className={cn(
              'absolute inset-y-0 left-0 shadow-2xl transition-transform duration-300 ease-out',
              sidebarOpen ? 'translate-x-0' : '-translate-x-full',
            )}
          >
            {sidebar}
          </div>
        </div>

        {/* Main pane */}
        <div className="flex min-w-0 flex-1 flex-col">
          {view === 'workspace' ? (
            <>
              <WorkspaceToolbar
                title={title}
                subtitle={subtitle}
                query={query}
                onQuery={setQuery}
                layout={layout}
                onLayout={setLayout}
                onCompose={openCreate}
                onOpenSidebar={() => setSidebarOpen(true)}
              />

              <main className="min-h-0 flex-1 overflow-y-auto">
                <WorkspaceView
                  items={filtered}
                  loading={itemsLoading}
                  layout={layout}
                  selectedId={selectedId}
                  filtered={isFiltered}
                  onSelect={setSelectedId}
                  onToggleFavorite={handleToggleFavorite}
                  onCompose={openCreate}
                  onClearFilters={clearFilters}
                />
              </main>
            </>
          ) : (
            <SettingsView
              settings={settings}
              appInfo={appInfo}
              onUpdate={changeSettings}
              onReset={handleResetSettings}
              onClose={() => setView('workspace')}
              themeToggle={<ThemeToggle theme={settings.ui.theme} onChange={changeTheme} bare />}
            />
          )}
        </div>

        {/* Inspector — desktop column */}
        {view === 'workspace' && selected && (
          <div className="hidden lg:flex">
            <InspectorPanel
              item={selected}
              onClose={() => setSelectedId(null)}
              onEdit={openEdit}
              onDelete={setDeletingItem}
              onToggleFavorite={handleToggleFavorite}
              onToggleArchive={handleToggleArchive}
            />
          </div>
        )}

        {/* Inspector — mobile sheet */}
        {view === 'workspace' && selected && (
          <div className="fixed inset-0 z-[95] lg:hidden">
            <div
              className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm"
              onClick={() => setSelectedId(null)}
            />
            <div className="absolute inset-y-0 right-0 w-full max-w-md animate-slide-up shadow-2xl">
              <InspectorPanel
                item={selected}
                onClose={() => setSelectedId(null)}
                onEdit={openEdit}
                onDelete={setDeletingItem}
                onToggleFavorite={handleToggleFavorite}
                onToggleArchive={handleToggleArchive}
              />
            </div>
          </div>
        )}

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
  action?: React.ReactNode;
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