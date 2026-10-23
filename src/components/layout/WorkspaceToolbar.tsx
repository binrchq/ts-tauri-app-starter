import {
  Bars3Icon,
  MagnifyingGlassIcon,
  PlusIcon,
  Squares2X2Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { ListBulletIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

export type LayoutMode = 'list' | 'grid';

export interface WorkspaceToolbarProps {
  title: string;
  subtitle: string;
  query: string;
  onQuery: (value: string) => void;
  layout: LayoutMode;
  onLayout: (layout: LayoutMode) => void;
  onCompose: () => void;
  onOpenSidebar: () => void;
}

/** Sticky header for the main pane: identity, search, view mode, primary action. */
export function WorkspaceToolbar({
  title,
  subtitle,
  query,
  onQuery,
  layout,
  onLayout,
  onCompose,
  onOpenSidebar,
}: WorkspaceToolbarProps) {
  const { t } = useTranslation();

  const iconBtn =
    'inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-900/6 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/8 dark:hover:text-white';

  return (
    <header className="shrink-0 border-b border-slate-200/70 bg-white/60 backdrop-blur-xl dark:border-white/8 dark:bg-slate-950/50">
      <div className="flex h-16 items-center gap-3 px-4 lg:px-6">
        <button type="button" onClick={onOpenSidebar} className={cn(iconBtn, 'lg:hidden')} aria-label="Menu">
          <Bars3Icon className="h-5 w-5" />
        </button>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-base font-bold tracking-tight">{title}</h1>
          <p className="truncate text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
        </div>

        <div className="relative hidden sm:block">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(event) => onQuery(event.target.value)}
            placeholder={t('workspace.searchPlaceholder')}
            aria-label={t('workspace.searchPlaceholder')}
            className="h-9 w-56 rounded-xl border border-slate-200 bg-white/70 pl-9 pr-8 text-sm transition-all placeholder:text-slate-400 focus:w-72 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 dark:border-white/10 dark:bg-white/6"
          />
          {query && (
            <button
              type="button"
              onClick={() => onQuery('')}
              aria-label={t('workspace.clearSearch')}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white"
            >
              <XMarkIcon className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="hidden items-center rounded-xl border border-slate-200 bg-white/70 p-0.5 sm:flex dark:border-white/10 dark:bg-white/6">
          {([
            ['list', ListBulletIcon],
            ['grid', Squares2X2Icon],
          ] as const).map(([mode, Icon]) => (
            <button
              key={mode}
              type="button"
              onClick={() => onLayout(mode)}
              aria-label={t(`workspace.layout.${mode}`)}
              aria-pressed={layout === mode}
              className={cn(
                'inline-flex h-8 w-8 items-center justify-center rounded-[9px] transition-colors',
                layout === mode
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-white/15 dark:text-white'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200',
              )}
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>

        <button type="button" onClick={onCompose} className="btn-primary h-9 px-3">
          <PlusIcon className="h-4 w-4" />
          <span className="hidden sm:inline">{t('workspace.new')}</span>
        </button>
      </div>
    </header>
  );
}