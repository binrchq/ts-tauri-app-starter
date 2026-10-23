import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  GlobeAltIcon,
  PaintBrushIcon,
  PlusIcon,
  RectangleStackIcon,
  SparklesIcon,
  TagIcon,
} from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import type { AppInfo, AppSettings, AppView, Item } from '@/types';
import { cn, formatDate, initials } from '@/lib/utils';

export interface DashboardProps {
  items: Item[];
  settings: AppSettings;
  appInfo: AppInfo | null;
  onNavigate: (view: AppView) => void;
  onCreate: () => void;
  onEdit: (item: Item) => void;
}

export function Dashboard({
  items,
  settings,
  appInfo,
  onNavigate,
  onCreate,
  onEdit,
}: DashboardProps) {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? 'en';

  const themeLabel = t(`settings.themeOptions.${settings.ui.theme}`);
  const languageLabel = t(`languages.${settings.general.language === 'zh-CN' ? 'zhCN' : 'en'}`);
  const tagCount = new Set(items.flatMap((item) => item.tags)).size;
  const recent = items.slice(0, 4);

  return (
    <div className="h-full overflow-y-auto">
      <div className="page-shell page-pad animate-fade-in">
        {/* Hero */}
        <section className="panel overflow-hidden">
          <div className="relative grid gap-8 p-7 lg:grid-cols-[1.4fr_1fr] lg:p-10">
            <div className="relative z-10">
              <span className="eyebrow">{t('dashboard.eyebrow')}</span>
              <h1 className="mt-3 text-4xl font-bold leading-[1.1] tracking-tight lg:text-5xl">
                <span className="text-gradient">{t('dashboard.title')}</span>
              </h1>
              <p className="mt-4 max-w-md text-[15px] leading-relaxed text-slate-600 dark:text-slate-300">
                {t('dashboard.welcome.description')}
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <button type="button" onClick={onCreate} className="btn-primary">
                  <PlusIcon className="h-4 w-4" />
                  {t('dashboard.welcome.cta')}
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('items')}
                  className="btn-secondary"
                >
                  {t('dashboard.count.cta')}
                  <ArrowRightIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Stat block */}
            <div className="relative z-10 grid grid-cols-2 gap-3 self-center lg:gap-4">
              <Stat
                value={items.length}
                label={t('dashboard.count.title')}
                icon={RectangleStackIcon}
                accent="from-brand-500 to-indigo-500"
                className="col-span-2"
                onClick={() => onNavigate('items')}
              />
              <Stat value={tagCount} label={t('dashboard.tags.title')} icon={TagIcon} accent="from-emerald-500 to-teal-500" />
              <Stat
                value={appInfo?.version ?? '0.1.0'}
                label={t('settings.about.version')}
                icon={SparklesIcon}
                accent="from-fuchsia-500 to-pink-500"
                small
              />
            </div>
          </div>
        </section>

        {/* Recent + quick settings */}
        <div className="mt-5 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <section className="panel p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-bold tracking-tight">{t('dashboard.recent.title')}</h2>
              <button
                type="button"
                onClick={() => onNavigate('items')}
                className="inline-flex items-center gap-1 text-[13px] font-semibold text-brand-600 hover:underline dark:text-brand-300"
              >
                {t('dashboard.recent.viewAll')}
                <ArrowUpRightIcon className="h-3.5 w-3.5" />
              </button>
            </div>

            {recent.length === 0 ? (
              <button
                type="button"
                onClick={onCreate}
                className="flex w-full flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-300 py-12 text-center transition-colors hover:border-brand-400 hover:bg-brand-50/40 dark:border-white/15 dark:hover:border-brand-400/60 dark:hover:bg-white/5"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
                  <PlusIcon className="h-5 w-5" />
                </span>
                <span className="text-sm font-semibold">{t('items.empty.action')}</span>
              </button>
            ) : (
              <ul className="space-y-1.5">
                {recent.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => onEdit(item)}
                      className="group flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors hover:bg-slate-900/4 dark:hover:bg-white/6"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-sky-500 text-xs font-bold text-white">
                        {initials(item.title)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">{item.title}</span>
                        <span className="block truncate text-xs text-slate-400 dark:text-slate-500">
                          {formatDate(item.updatedAt, language)}
                        </span>
                      </span>
                      <ArrowRightIcon className="h-4 w-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-500" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="space-y-5">
            <QuickCard
              icon={PaintBrushIcon}
              title={t('dashboard.appearance.title')}
              value={themeLabel}
              accent="from-rose-500 to-orange-400"
              onClick={() => onNavigate('settings')}
            />
            <QuickCard
              icon={GlobeAltIcon}
              title={t('dashboard.language.title')}
              value={languageLabel}
              accent="from-violet-500 to-fuchsia-500"
              onClick={() => onNavigate('settings')}
            />
          </section>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400 dark:text-slate-600">
          {t('dashboard.platformLine', {
            platform: appInfo?.platform ?? 'web',
            version: appInfo?.version ?? '0.1.0',
          })}
        </p>
      </div>
    </div>
  );
}

interface StatProps {
  value: number | string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  className?: string;
  small?: boolean;
  onClick?: () => void;
}

function Stat({ value, label, icon: Icon, accent, className, small, onClick }: StatProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        'panel group relative overflow-hidden p-4 text-left transition-all',
        onClick && 'hover:-translate-y-0.5 hover:shadow-lg',
        className,
      )}
    >
      <span
        className={cn(
          'mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm',
          accent,
        )}
      >
        <Icon className="h-[18px] w-[18px]" />
      </span>
      <div className={cn('font-bold tracking-tight', small ? 'text-xl' : 'text-3xl')}>{value}</div>
      <div className="mt-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">{label}</div>
    </button>
  );
}

interface QuickCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string;
  accent: string;
  onClick: () => void;
}

function QuickCard({ icon: Icon, title, value, accent, onClick }: QuickCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="panel group flex w-full items-center gap-4 p-5 text-left transition-all hover:-translate-y-0.5 hover:shadow-lg"
    >
      <span
        className={cn(
          'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-sm',
          accent,
        )}
      >
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold tracking-tight">{title}</span>
        <span className="block truncate text-xs text-slate-500 dark:text-slate-400">{value}</span>
      </span>
      <ArrowRightIcon className="h-4 w-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-500" />
    </button>
  );
}