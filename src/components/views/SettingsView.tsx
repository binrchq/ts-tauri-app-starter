import { useState, type ComponentType, type ReactNode } from 'react';
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  ComputerDesktopIcon,
  CubeTransparentIcon,
  GlobeAltIcon,
  InformationCircleIcon,
  MoonIcon,
  PaintBrushIcon,
  SparklesIcon,
  SquaresPlusIcon,
  SunIcon,
} from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import i18n, { LANG_EXPLICIT_KEY, normalizeLanguage } from '@/i18n';
import type { AppInfo, AppSettings, SurfaceStyle, ThemePreference } from '@/types';
import { cn } from '@/lib/utils';

export interface SettingsViewProps {
  settings: AppSettings;
  appInfo: AppInfo | null;
  onUpdate: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => Promise<AppSettings>;
  onReset: () => Promise<AppSettings>;
  onClose: () => void;
  themeToggle?: ReactNode;
}

const themeOptions: Array<{ value: ThemePreference; icon: ComponentType<{ className?: string }> }> = [
  { value: 'light', icon: SunIcon },
  { value: 'dark', icon: MoonIcon },
  { value: 'system', icon: ComputerDesktopIcon },
];

const surfaceOptions: Array<{ value: SurfaceStyle; icon: ComponentType<{ className?: string }> }> = [
  { value: 'solid', icon: SquaresPlusIcon },
  { value: 'glass', icon: CubeTransparentIcon },
];

export function SettingsView({
  settings,
  appInfo,
  onUpdate,
  onReset,
  onClose,
  themeToggle,
}: SettingsViewProps) {
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const run = async (action: () => Promise<unknown>) => {
    try {
      setError(null);
      await action();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    }
  };

  const setTheme = (theme: ThemePreference) =>
    run(() => onUpdate('ui', { ...settings.ui, theme }));

  const setSurface = (surface: SurfaceStyle) =>
    run(() => onUpdate('ui', { ...settings.ui, surface }));

  const setCompact = (compact: boolean) =>
    run(() => onUpdate('ui', { ...settings.ui, compact }));

  const setPageSize = (pageSize: number) =>
    run(() => onUpdate('ui', { ...settings.ui, pageSize }));

  const setLanguage = (language: string) =>
    run(async () => {
      await onUpdate('general', { ...settings.general, language });
      localStorage.setItem(LANG_EXPLICIT_KEY, '1');
      await i18n.changeLanguage(normalizeLanguage(language));
    });

  const handleReset = async () => {
    setBusy(true);
    await run(async () => {
      const next = await onReset();
      await i18n.changeLanguage(normalizeLanguage(next.general.language));
      setResetOpen(false);
    });
    setBusy(false);
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex h-16 shrink-0 items-center gap-3 border-b border-slate-200/70 bg-white/60 px-4 backdrop-blur-xl dark:border-white/8 dark:bg-slate-950/50 lg:px-6">
        <button
          type="button"
          onClick={onClose}
          aria-label={t('common.back')}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-900/6 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/8 dark:hover:text-white"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-base font-bold tracking-tight">{t('settings.title')}</h1>
          <p className="truncate text-xs text-slate-500 dark:text-slate-400">
            {t('settings.subtitle')}
          </p>
        </div>
        {themeToggle}
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl animate-fade-in space-y-5 px-5 py-6 lg:px-8">

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
            {error}
          </div>
        )}

        <SettingsSection
          icon={PaintBrushIcon}
          title={t('settings.appearance.title')}
          description={t('settings.appearance.description')}
        >
          <div className="space-y-5">
            <div className="space-y-2.5">
              <Label>{t('settings.appearance.theme')}</Label>
              <div className="grid grid-cols-3 gap-2">
                {themeOptions.map((option) => {
                  const Icon = option.icon;
                  const active = settings.ui.theme === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setTheme(option.value)}
                      className={cn(
                        'flex flex-col items-center gap-2 rounded-xl border px-3 py-3.5 text-xs font-semibold transition-all',
                        active
                          ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-sm dark:bg-brand-500/15 dark:text-brand-300'
                          : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400',
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      {t(`settings.themeOptions.${option.value}`)}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2.5">
              <Label>{t('settings.appearance.surface')}</Label>
              <div className="grid grid-cols-2 gap-2">
                {surfaceOptions.map((option) => {
                  const Icon = option.icon;
                  const active = settings.ui.surface === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setSurface(option.value)}
                      className={cn(
                        'flex items-start gap-3 rounded-xl border px-3.5 py-3 text-left transition-all',
                        active
                          ? 'border-brand-500 bg-brand-50 shadow-sm dark:bg-brand-500/15'
                          : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900',
                      )}
                    >
                      <Icon
                        className={cn(
                          'mt-0.5 h-5 w-5 shrink-0',
                          active
                            ? 'text-brand-600 dark:text-brand-300'
                            : 'text-slate-400 dark:text-slate-500',
                        )}
                      />
                      <span className="min-w-0">
                        <span
                          className={cn(
                            'block text-sm font-semibold',
                            active
                              ? 'text-brand-700 dark:text-brand-300'
                              : 'text-slate-700 dark:text-slate-300',
                          )}
                        >
                          {t(`settings.surfaceOptions.${option.value}.label`)}
                        </span>
                        <span className="mt-0.5 block text-xs text-slate-400 dark:text-slate-500">
                          {t(`settings.surfaceOptions.${option.value}.description`)}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                {t('settings.appearance.surfaceHint')}
              </p>
            </div>

            <ToggleRow
              label={t('settings.appearance.compact')}
              description={t('settings.appearance.compactDescription')}
              checked={settings.ui.compact}
              onChange={setCompact}
            />
          </div>
        </SettingsSection>

        <SettingsSection
          icon={GlobeAltIcon}
          title={t('settings.language.title')}
          description={t('settings.language.description')}
        >
          <div className="space-y-2">
            <Label htmlFor="language-select">{t('settings.language.label')}</Label>
            <Select
              value={settings.general.language}
              onValueChange={setLanguage}
              options={[
                { value: 'en', label: t('languages.en') },
                { value: 'zh-CN', label: t('languages.zhCN') },
              ]}
            />
          </div>
        </SettingsSection>

        <SettingsSection
          icon={SparklesIcon}
          title={t('settings.list.title')}
          description={t('settings.list.description')}
        >
          <div className="space-y-2">
            <Label>{t('settings.list.pageSize')}</Label>
            <Select
              value={String(settings.ui.pageSize)}
              onValueChange={(value) => setPageSize(Number(value))}
              options={[6, 12, 24, 48].map((size) => ({
                value: String(size),
                label: t('settings.list.pageSizeOption', { count: size }),
              }))}
            />
            <p className="text-xs text-slate-400 dark:text-slate-500">
              {t('settings.list.pageSizeDescription')}
            </p>
          </div>
        </SettingsSection>

        <SettingsSection
          icon={InformationCircleIcon}
          title={t('settings.about.title')}
          description={t('settings.about.description')}
        >
          <dl className="divide-y divide-slate-100 text-sm dark:divide-slate-800">
            <InfoRow label={t('settings.about.version')} value={appInfo?.version ?? '0.1.0'} />
            <InfoRow label={t('settings.about.platform')} value={appInfo?.platform ?? 'web'} />
            <InfoRow label={t('settings.about.stack')} value="Tauri 2 · React · TypeScript" />
          </dl>

          <button
            type="button"
            onClick={() => setResetOpen(true)}
            className="btn-secondary mt-5 w-full sm:w-auto"
          >
            <ArrowPathIcon className="h-4 w-4" />
            {t('settings.reset.action')}
          </button>
          <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
            {t('settings.reset.description')}
          </p>
        </SettingsSection>
        </div>
      </div>

      <ConfirmDialog
        open={resetOpen}
        title={t('settings.reset.confirmTitle')}
        description={t('settings.reset.confirmDescription')}
        confirmLabel={t('settings.reset.action')}
        busy={busy}
        onConfirm={handleReset}
        onClose={() => setResetOpen(false)}
      />
    </div>
  );
}

interface SettingsSectionProps {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
  children: ReactNode;
}

function SettingsSection({ icon: Icon, title, description, children }: SettingsSectionProps) {
  return (
    <section className="panel p-6 sm:p-7">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50">{title}</h2>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

interface ToggleRowProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function ToggleRow({ label, description, checked, onChange }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</div>
        <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-6 w-11 shrink-0 rounded-full transition-colors',
          checked ? 'bg-brand-600' : 'bg-slate-200 dark:bg-slate-700',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
            checked ? 'translate-x-[22px]' : 'translate-x-0.5',
          )}
        />
      </button>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <dt className="text-slate-500 dark:text-slate-400">{label}</dt>
      <dd className="font-medium text-slate-800 dark:text-slate-200">{value}</dd>
    </div>
  );
}