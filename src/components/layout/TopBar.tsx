import { Cog6ToothIcon, HomeIcon, RectangleStackIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { GlassPanel } from '@/components/theme/GlassPanel';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { useIsGlass } from '@/components/theme/SurfaceContext';
import type { AppView, ThemePreference } from '@/types';
import { cn } from '@/lib/utils';

export interface TopBarProps {
  view: AppView;
  onNavigate: (view: AppView) => void;
  theme: ThemePreference;
  onThemeChange: (theme: ThemePreference) => void;
}

const navItems = [
  { value: 'dashboard' as const, labelKey: 'nav.dashboard', icon: HomeIcon },
  { value: 'items' as const, labelKey: 'nav.items', icon: RectangleStackIcon },
  { value: 'settings' as const, labelKey: 'nav.settings', icon: Cog6ToothIcon },
];

/**
 * Floating desktop chrome: brand on the left, nav dock + theme on the right.
 *
 * Everything floats *above* the scrolling content rather than sitting in the
 * document flow — that is what gives the glass something to refract.
 */
export function TopBar({ view, onNavigate, theme, onThemeChange }: TopBarProps) {
  const { t } = useTranslation();
  const isGlass = useIsGlass();

  const chip = cn(
    'pointer-events-auto flex items-center',
    isGlass
      ? 'glass-surface glass-chrome rounded-[22px]'
      : 'rounded-[22px] border border-slate-200/70 bg-white/88 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/88',
  );

  return (
    <div className="desktop-only pointer-events-none fixed inset-x-0 top-4 z-50">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-6">
        <button
          type="button"
          onClick={() => onNavigate('dashboard')}
          className={cn(chip, 'gap-2.5 py-2 pl-2 pr-4 transition-transform active:scale-[0.98]')}
        >
          <img src="/logo.svg" alt="" className="h-8 w-8 shrink-0 rounded-[10px]" />
          <span className="whitespace-nowrap text-[15px] font-bold tracking-tight text-slate-900 dark:text-white">
            {t('app.name')}
          </span>
        </button>

        <div className="pointer-events-none flex items-center gap-3">
          <GlassPanel chrome cornerRadius={22}>
            <nav className="pointer-events-auto flex items-center gap-1 p-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = view === item.value;
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => onNavigate(item.value)}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'inline-flex items-center gap-2 rounded-[14px] px-3.5 py-2 text-sm font-semibold transition-all duration-200',
                      active
                        ? 'bg-brand-600 text-white shadow-[0_6px_18px_-6px_rgb(79_70_229/0.9)]'
                        : 'text-slate-600 hover:bg-slate-900/8 dark:text-slate-300 dark:hover:bg-white/12',
                    )}
                  >
                    <Icon className="h-[18px] w-[18px]" />
                    {t(item.labelKey)}
                  </button>
                );
              })}
            </nav>
          </GlassPanel>

          <div className={cn(chip, 'p-1.5')}>
            <ThemeToggle theme={theme} onChange={onThemeChange} bare />
          </div>
        </div>
      </div>
    </div>
  );
}