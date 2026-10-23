import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { ItemCard } from '@/components/items/ItemCard';
import { EmptyState } from '@/components/common/EmptyState';
import type { Item } from '@/types';
import { cn } from '@/lib/utils';

export interface ItemsViewProps {
  items: Item[];
  loading: boolean;
  error: string | null;
  pageSize: number;
  compact: boolean;
  onCreate: () => void;
  onEdit: (item: Item) => void;
  onDelete: (item: Item) => void;
  onReload: () => void;
}

export function ItemsView({
  items,
  loading,
  error,
  pageSize,
  compact,
  onCreate,
  onEdit,
  onDelete,
  onReload,
}: ItemsViewProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const tags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of items) {
      for (const tag of item.tags) {
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      }
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([tag]) => tag);
  }, [items]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return items.filter((item) => {
      const tagMatch = !activeTag || item.tags.includes(activeTag);
      if (!tagMatch) return false;
      if (!needle) return true;
      return (
        item.title.toLowerCase().includes(needle) ||
        item.description.toLowerCase().includes(needle) ||
        item.tags.some((tag) => tag.toLowerCase().includes(needle))
      );
    });
  }, [items, query, activeTag]);

  const size = Math.max(1, pageSize);
  const totalPages = Math.max(1, Math.ceil(filtered.length / size));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice((currentPage - 1) * size, currentPage * size);

  useEffect(() => {
    setPage(1);
  }, [query, activeTag, pageSize, items.length]);

  const clearFilters = () => {
    setQuery('');
    setActiveTag(null);
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="page-shell page-pad animate-fade-in">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 lg:text-3xl">
              {t('items.title')}
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {t('items.subtitle', { count: items.length })}
            </p>
          </div>

          <div className="flex w-full items-center gap-2 lg:w-auto">
            <div className="relative min-w-0 flex-1 lg:w-80">
              <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t('items.searchPlaceholder')}
                className="form-control pl-9 pr-9"
                aria-label={t('items.searchPlaceholder')}
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  aria-label={t('items.clearSearch')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              )}
            </div>
            <button type="button" onClick={onCreate} className="btn-primary shrink-0">
              <PlusIcon className="h-4 w-4" />
              <span className="hidden sm:inline">{t('items.add')}</span>
            </button>
          </div>
        </div>

        {tags.length > 0 && (
          <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto pb-1">
            <FilterPill active={activeTag === null} onClick={() => setActiveTag(null)}>
              {t('items.allTags')}
            </FilterPill>
            {tags.map((tag) => (
              <FilterPill
                key={tag}
                active={activeTag === tag}
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              >
                #{tag}
              </FilterPill>
            ))}
          </div>
        )}

        {error && (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
            <span>{error}</span>
            <button type="button" onClick={onReload} className="btn-secondary h-9 py-0">
              <ArrowPathIcon className="h-4 w-4" />
              {t('common.retry')}
            </button>
          </div>
        )}

        <div className="mt-5">
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="h-48 animate-pulse rounded-[1.4rem] border border-slate-200/70 bg-white/60 dark:border-white/10 dark:bg-white/5"
                />
              ))}
            </div>
          ) : items.length === 0 ? (
            <EmptyState
              title={t('items.empty.title')}
              description={t('items.empty.description')}
              action={
                <button type="button" onClick={onCreate} className="btn-primary">
                  <PlusIcon className="h-4 w-4" />
                  {t('items.empty.action')}
                </button>
              }
            />
          ) : filtered.length === 0 ? (
            <EmptyState
              title={t('items.noResults.title')}
              description={t('items.noResults.description')}
              action={
                <button type="button" onClick={clearFilters} className="btn-secondary">
                  {t('items.noResults.action')}
                </button>
              }
            />
          ) : (
            <>
              <div
                className={cn(
                  'grid gap-4',
                  compact ? 'sm:grid-cols-2 xl:grid-cols-4' : 'sm:grid-cols-2 xl:grid-cols-3',
                )}
              >
                {visible.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    compact={compact}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-center gap-3 pb-2">
                  <button
                    type="button"
                    onClick={() => setPage((value) => Math.max(1, value - 1))}
                    disabled={currentPage === 1}
                    className="btn-secondary h-10 w-10 px-0"
                    aria-label={t('items.paginationPrevious')}
                  >
                    <ChevronLeftIcon className="h-4 w-4" />
                  </button>
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    {t('items.pagination', { page: currentPage, total: totalPages })}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                    disabled={currentPage === totalPages}
                    className="btn-secondary h-10 w-10 px-0"
                    aria-label={t('items.paginationNext')}
                  >
                    <ChevronRightIcon className="h-4 w-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

interface FilterPillProps {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}

function FilterPill({ active, onClick, children }: FilterPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors',
        active
          ? 'border-brand-500 bg-brand-500 text-white shadow-sm'
          : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:text-slate-200',
      )}
    >
      {children}
    </button>
  );
}