import {
  ArchiveBoxIcon,
  InboxIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '@/components/common/EmptyState';
import type { LayoutMode } from '@/components/layout/WorkspaceToolbar';
import type { Item } from '@/types';
import { cn, formatDate, initials } from '@/lib/utils';

export interface WorkspaceViewProps {
  items: Item[];
  loading: boolean;
  layout: LayoutMode;
  selectedId: string | null;
  filtered: boolean;
  onSelect: (id: string) => void;
  onToggleFavorite: (item: Item) => void;
  onCompose: () => void;
  onClearFilters: () => void;
}

/** Main content pane: a dense list or a card grid over the same data. */
export function WorkspaceView({
  items,
  loading,
  layout,
  selectedId,
  filtered,
  onSelect,
  onToggleFavorite,
  onCompose,
  onClearFilters,
}: WorkspaceViewProps) {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? 'en';

  if (loading) {
    return (
      <div className="space-y-2 p-4 lg:p-6">
        {Array.from({ length: 7 }).map((_, index) => (
          <div
            key={index}
            className="h-16 animate-pulse rounded-2xl border border-slate-200/60 bg-white/50 dark:border-white/8 dark:bg-white/5"
          />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="p-4 lg:p-6">
        <EmptyState
          icon={filtered ? MagnifyingGlassIcon : InboxIcon}
          title={filtered ? t('workspace.noResults.title') : t('workspace.empty.title')}
          description={filtered ? t('workspace.noResults.description') : t('workspace.empty.description')}
          action={
            filtered ? (
              <button type="button" onClick={onClearFilters} className="btn-secondary">
                {t('workspace.noResults.action')}
              </button>
            ) : (
              <button type="button" onClick={onCompose} className="btn-primary">
                <PlusIcon className="h-4 w-4" />
                {t('workspace.empty.action')}
              </button>
            )
          }
        />
      </div>
    );
  }

  if (layout === 'grid') {
    return (
      <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3 lg:p-6">
        {items.map((item) => {
          const selected = item.id === selectedId;
          return (
            <article
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={cn(
                'group cursor-pointer rounded-2xl border p-4 transition-all',
                selected
                  ? 'border-brand-500/60 bg-brand-500/8 shadow-[0_0_0_1px_rgb(99_102_241/0.35)]'
                  : 'border-slate-200/70 bg-white/70 hover:-translate-y-0.5 hover:shadow-lg dark:border-white/8 dark:bg-white/5',
              )}
            >
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-sky-500 text-[11px] font-bold text-white">
                  {initials(item.title)}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-semibold">{item.title}</h3>
                  <p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">
                    {formatDate(item.updatedAt, language)}
                  </p>
                </div>
                <FavButton item={item} onToggle={onToggleFavorite} />
              </div>

              {item.description && (
                <p className="mt-3 line-clamp-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
                  {item.description}
                </p>
              )}

              {(item.tags.length > 0 || item.status === 'archived') && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {item.status === 'archived' && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-500/12 px-2 py-0.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                      <ArchiveBoxIcon className="h-3 w-3" />
                      {t('sidebar.archived')}
                    </span>
                  )}
                  {item.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-brand-500/12 px-2 py-0.5 text-[10px] font-medium text-brand-700 dark:text-brand-300"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </article>
          );
        })}
      </div>
    );
  }

  // Dense list
  return (
    <ul className="divide-y divide-slate-200/60 dark:divide-white/6">
      {items.map((item) => {
        const selected = item.id === selectedId;
        const archived = item.status === 'archived';
        return (
          <li key={item.id}>
            <div
              role="button"
              tabIndex={0}
              onClick={() => onSelect(item.id)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onSelect(item.id);
                }
              }}
              className={cn(
                'group flex cursor-pointer items-start gap-3 px-4 py-3 transition-colors lg:px-6',
                selected ? 'bg-brand-500/10' : 'hover:bg-slate-900/4 dark:hover:bg-white/5',
                selected && 'shadow-[inset_2px_0_0_rgb(99_102_241)]',
              )}
            >
              <FavButton item={item} onToggle={onToggleFavorite} />

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3
                    className={cn(
                      'truncate text-sm',
                      item.favorite ? 'font-semibold' : 'font-medium',
                      archived && 'text-slate-400 line-through dark:text-slate-500',
                    )}
                  >
                    {item.title}
                  </h3>
                  {archived && (
                    <ArchiveBoxIcon className="h-3.5 w-3.5 shrink-0 text-slate-400 dark:text-slate-500" />
                  )}
                </div>

                {item.description && (
                  <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                    {item.description}
                  </p>
                )}

                {item.tags.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {item.tags.slice(0, 4).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md bg-slate-900/6 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 dark:bg-white/8 dark:text-slate-400"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <time className="shrink-0 pt-0.5 text-[11px] tabular-nums text-slate-400 dark:text-slate-500">
                {formatDate(item.updatedAt, language)}
              </time>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function FavButton({ item, onToggle }: { item: Item; onToggle: (item: Item) => void }) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onToggle(item);
      }}
      className={cn(
        'mt-0.5 shrink-0 rounded-lg p-1 transition-colors',
        item.favorite
          ? 'text-amber-400'
          : 'text-slate-300 opacity-0 hover:text-amber-400 group-hover:opacity-100 dark:text-slate-600 dark:group-hover:opacity-100',
      )}
      aria-label="Toggle favorite"
    >
      {item.favorite ? <StarSolid className="h-4 w-4" /> : <StarIcon className="h-4 w-4" />}
    </button>
  );
}