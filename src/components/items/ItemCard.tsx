import { ClockIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import type { Item } from '@/types';
import { cn, formatDate, initials } from '@/lib/utils';

const palettes = [
  'from-indigo-500 to-sky-500',
  'from-rose-500 to-orange-400',
  'from-emerald-500 to-teal-400',
  'from-violet-500 to-fuchsia-500',
  'from-amber-500 to-yellow-400',
  'from-cyan-500 to-blue-500',
];

function paletteFor(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return palettes[hash % palettes.length];
}

export interface ItemCardProps {
  item: Item;
  onEdit: (item: Item) => void;
  onDelete: (item: Item) => void;
  compact?: boolean;
}

export function ItemCard({ item, onEdit, onDelete, compact = false }: ItemCardProps) {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? i18n.language;

  return (
    <article
      className={cn(
        'panel group flex flex-col transition-all hover:-translate-y-0.5 hover:shadow-lg',
        compact ? 'gap-3 p-4' : 'gap-4 p-5',
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-sm font-bold text-white shadow-sm',
            compact ? 'h-10 w-10' : 'h-12 w-12 text-base',
            paletteFor(item.title),
          )}
        >
          {initials(item.title)}
        </div>

        <div className="min-w-0 flex-1">
          <h3
            className={cn(
              'truncate font-semibold text-slate-900 dark:text-slate-50',
              compact ? 'text-sm' : 'text-base',
            )}
          >
            {item.title}
          </h3>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
            <ClockIcon className="h-3.5 w-3.5" />
            <span className="truncate">{formatDate(item.updatedAt, language)}</span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
          <button
            type="button"
            onClick={() => onEdit(item)}
            aria-label={t('common.edit')}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-brand-600 dark:hover:bg-slate-800 dark:hover:text-brand-300"
          >
            <PencilSquareIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(item)}
            aria-label={t('common.delete')}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-300"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {item.description && (
        <p
          className={cn(
            'whitespace-pre-line text-sm leading-6 text-slate-500 dark:text-slate-400',
            compact ? 'line-clamp-2' : 'line-clamp-3',
          )}
        >
          {item.description}
        </p>
      )}

      {item.tags.length > 0 && (
        <div className="mt-auto flex flex-wrap gap-1.5">
          {item.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              #{tag}
            </Badge>
          ))}
        </div>
      )}
    </article>
  );
}