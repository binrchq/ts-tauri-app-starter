import {
  ArchiveBoxIcon,
  ArrowUturnLeftIcon,
  CalendarDaysIcon,
  ClockIcon,
  HashtagIcon,
  PencilSquareIcon,
  StarIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { useTranslation } from 'react-i18next';
import { useIsGlass } from '@/components/theme/SurfaceContext';
import type { Item } from '@/types';
import { cn, formatDate } from '@/lib/utils';

export interface InspectorPanelProps {
  item: Item;
  onClose: () => void;
  onEdit: (item: Item) => void;
  onDelete: (item: Item) => void;
  onToggleFavorite: (item: Item) => void;
  onToggleArchive: (item: Item) => void;
}

/**
 * Detail pane for the current selection.
 *
 * Desktop: fixed right column. Mobile: full-height sheet (see App).
 */
export function InspectorPanel({
  item,
  onClose,
  onEdit,
  onDelete,
  onToggleFavorite,
  onToggleArchive,
}: InspectorPanelProps) {
  const { t, i18n } = useTranslation();
  const isGlass = useIsGlass();
  const language = i18n.resolvedLanguage ?? 'en';
  const archived = item.status === 'archived';

  const actionBtn =
    'inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-900/6 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/8 dark:hover:text-white';

  return (
    <aside
      className={cn(
        'flex h-full w-full flex-col border-l lg:w-[352px] lg:shrink-0',
        isGlass
          ? 'border-white/50 bg-white/55 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/40'
          : 'border-slate-200/70 bg-white/80 dark:border-white/8 dark:bg-slate-900/60',
      )}
    >
      <header className="flex shrink-0 items-start gap-2 border-b border-slate-200/70 p-4 dark:border-white/8">
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-bold leading-snug tracking-tight break-words">
            {item.title}
          </h2>
          <p className="mt-0.5 text-[11px] font-medium text-slate-400 dark:text-slate-500">
            {archived ? t('sidebar.archived') : t('sidebar.active')}
          </p>
        </div>

        <button type="button" onClick={() => onToggleFavorite(item)} className={actionBtn} aria-label="Favorite">
          {item.favorite ? (
            <StarSolid className="h-[18px] w-[18px] text-amber-400" />
          ) : (
            <StarIcon className="h-[18px] w-[18px]" />
          )}
        </button>
        <button type="button" onClick={onClose} className={actionBtn} aria-label={t('common.close')}>
          <XMarkIcon className="h-[18px] w-[18px]" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4">
        {/* Description */}
        <section>
          <h3 className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
            {t('items.form.description')}
          </h3>
          {item.description ? (
            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700 dark:text-slate-300">
              {item.description}
            </p>
          ) : (
            <p className="mt-2 text-sm italic text-slate-400 dark:text-slate-600">
              {t('inspector.noDescription')}
            </p>
          )}
        </section>

        {/* Tags */}
        <section className="mt-6">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
            {t('items.form.tags')}
          </h3>
          {item.tags.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-full bg-brand-500/12 px-2.5 py-1 text-xs font-medium text-brand-700 dark:text-brand-300"
                >
                  <HashtagIcon className="h-3 w-3" />
                  {tag}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm italic text-slate-400 dark:text-slate-600">
              {t('inspector.noTags')}
            </p>
          )}
        </section>

        {/* Metadata */}
        <section className="mt-6 space-y-3">
          <MetaRow icon={CalendarDaysIcon} label={t('inspector.created')} value={formatDate(item.createdAt, language)} />
          <MetaRow icon={ClockIcon} label={t('inspector.updated')} value={formatDate(item.updatedAt, language)} />
          <MetaRow
            icon={ArchiveBoxIcon}
            label={t('inspector.status')}
            value={archived ? t('sidebar.archived') : t('sidebar.active')}
          />
          <div className="flex items-center gap-2 text-xs">
            <span className="w-20 shrink-0 text-slate-400 dark:text-slate-500">ID</span>
            <code className="truncate rounded bg-slate-900/6 px-1.5 py-0.5 font-mono text-[11px] text-slate-600 dark:bg-white/8 dark:text-slate-400">
              {item.id}
            </code>
          </div>
        </section>
      </div>

      {/* Actions */}
      <footer className="shrink-0 space-y-2 border-t border-slate-200/70 p-4 dark:border-white/8">
        <button type="button" onClick={() => onEdit(item)} className="btn-secondary h-10 w-full">
          <PencilSquareIcon className="h-4 w-4" />
          {t('common.edit')}
        </button>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onToggleArchive(item)}
            className="btn-secondary h-10 flex-1 px-2 text-xs"
          >
            {archived ? (
              <>
                <ArrowUturnLeftIcon className="h-4 w-4" />
                {t('inspector.restore')}
              </>
            ) : (
              <>
                <ArchiveBoxIcon className="h-4 w-4" />
                {t('inspector.archive')}
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => onDelete(item)}
            className="btn-secondary h-10 flex-1 border-red-200/70 px-2 text-xs text-red-600 hover:bg-red-50 dark:border-red-500/25 dark:text-red-400 dark:hover:bg-red-500/10"
          >
            <TrashIcon className="h-4 w-4" />
            {t('common.delete')}
          </button>
        </div>
      </footer>
    </aside>
  );
}

function MetaRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof ClockIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <Icon className="h-3.5 w-3.5 shrink-0 text-slate-400 dark:text-slate-500" />
      <span className="w-16 shrink-0 text-slate-400 dark:text-slate-500">{label}</span>
      <span className="truncate font-medium text-slate-700 dark:text-slate-300">{value}</span>
    </div>
  );
}