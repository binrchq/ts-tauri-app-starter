import {
  ArchiveBoxIcon,
  CheckCircleIcon,
  Cog6ToothIcon,
  HashtagIcon,
  InboxIcon,
  PlusIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { useTranslation } from 'react-i18next';
import { useIsGlass } from '@/components/theme/SurfaceContext';
import type { AppInfo, AppView, Item, ItemScope } from '@/types';
import { cn } from '@/lib/utils';

export interface AppSidebarProps {
  items: Item[];
  scope: ItemScope;
  onScope: (scope: ItemScope) => void;
  tag: string | null;
  onTag: (tag: string | null) => void;
  view: AppView;
  onView: (view: AppView) => void;
  onCompose: () => void;
  appInfo: AppInfo | null;
}

/**
 * Primary navigation rail.
 *
 * Static on desktop, an off-canvas drawer on mobile (the parent handles the
 * transform; this component is layout only).
 */
export function AppSidebar({
  items,
  scope,
  onScope,
  tag,
  onTag,
  view,
  onView,
  onCompose,
  appInfo,
}: AppSidebarProps) {
  const { t } = useTranslation();
  const isGlass = useIsGlass();

  const counts = {
    all: items.length,
    active: items.filter((i) => i.status === 'active').length,
    favorite: items.filter((i) => i.favorite).length,
    archived: items.filter((i) => i.status === 'archived').length,
  };

  const tags = (() => {
    const map = new Map<string, number>();
    for (const item of items) for (const name of item.tags) map.set(name, (map.get(name) ?? 0) + 1);
    return [...map.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  })();

  const scopes: Array<{ key: ItemScope; label: string; icon: typeof InboxIcon; count: number }> = [
    { key: 'all', label: t('sidebar.all'), icon: InboxIcon, count: counts.all },
    { key: 'favorite', label: t('sidebar.favorites'), icon: StarIcon, count: counts.favorite },
    { key: 'active', label: t('sidebar.active'), icon: CheckCircleIcon, count: counts.active },
    { key: 'archived', label: t('sidebar.archived'), icon: ArchiveBoxIcon, count: counts.archived },
  ];

  return (
    <aside
      className={cn(
        'flex h-full w-[264px] shrink-0 flex-col overflow-hidden rounded-[20px]',
        isGlass
          ? 'glass-surface'
          : 'border border-slate-200/70 bg-white/85 shadow-sm backdrop-blur-xl dark:border-white/8 dark:bg-slate-900/70',
      )}
    >
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-4 pb-2 pt-5">
        <img src="/logo.svg" alt="" className="h-8 w-8 shrink-0 rounded-[10px]" />
        <div className="min-w-0">
          <div className="truncate text-[15px] font-bold tracking-tight">{t('app.name')}</div>
          <div className="truncate text-[10px] font-medium text-slate-400 dark:text-slate-500">
            {t('app.tagline')}
          </div>
        </div>
      </div>

      <div className="px-4 pb-4 pt-3">
        <button
          type="button"
          onClick={onCompose}
          className="btn-primary h-10 w-full justify-start px-3"
        >
          <PlusIcon className="h-4 w-4" />
          {t('sidebar.newItem')}
        </button>
      </div>

      {/* Scopes */}
      <nav className="px-2">
        {scopes.map((entry) => {
          const Icon = entry.key === 'favorite' && scope === 'favorite' ? StarSolid : entry.icon;
          const active = view === 'workspace' && scope === entry.key && tag === null;
          return (
            <button
              key={entry.key}
              type="button"
              onClick={() => {
                onScope(entry.key);
                onTag(null);
                onView('workspace');
              }}
              className={cn(
                'flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-brand-600 text-white shadow-[0_6px_18px_-8px_rgb(79_70_229/0.9)]'
                  : 'text-slate-600 hover:bg-slate-900/6 dark:text-slate-300 dark:hover:bg-white/8',
              )}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" />
              <span className="flex-1 truncate text-left">{entry.label}</span>
              <span
                className={cn(
                  'shrink-0 rounded-full px-1.5 text-[11px] font-semibold tabular-nums',
                  active ? 'bg-white/20' : 'bg-slate-900/8 dark:bg-white/10',
                )}
              >
                {entry.count}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Tags */}
      {tags.length > 0 && (
        <>
          <div className="mt-5 px-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
              {t('sidebar.tags')}
            </span>
          </div>
          <div className="no-scrollbar mt-2 flex-1 overflow-y-auto px-2 pb-2">
            {tags.map(([name, count]) => {
              const active = tag === name;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => {
                    onTag(active ? null : name);
                    onView('workspace');
                  }}
                  className={cn(
                    'flex w-full items-center gap-2.5 rounded-xl px-3 py-1.5 text-sm transition-colors',
                    active
                      ? 'bg-brand-600/12 text-brand-700 dark:text-brand-300'
                      : 'text-slate-500 hover:bg-slate-900/6 dark:text-slate-400 dark:hover:bg-white/8',
                  )}
                >
                  <HashtagIcon className="h-3.5 w-3.5 shrink-0 opacity-70" />
                  <span className="flex-1 truncate text-left">{name}</span>
                  <span className="shrink-0 text-[11px] tabular-nums text-slate-400 dark:text-slate-500">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* Footer */}
      <div className="mt-auto border-t border-slate-900/8 p-2 dark:border-white/8">
        <button
          type="button"
          onClick={() => onView('settings')}
          className={cn(
            'flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
            view === 'settings'
              ? 'bg-brand-600 text-white'
              : 'text-slate-600 hover:bg-slate-900/6 dark:text-slate-300 dark:hover:bg-white/8',
          )}
        >
          <Cog6ToothIcon className="h-[18px] w-[18px]" />
          {t('nav.settings')}
        </button>

        <div className="px-3 py-2 text-[10px] font-medium text-slate-400 dark:text-slate-600">
          {t('sidebar.version', { version: appInfo?.version ?? '0.1.0' })}
        </div>
      </div>
    </aside>
  );
}