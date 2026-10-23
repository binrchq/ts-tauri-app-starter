import {
  Cog6ToothIcon as Cog6ToothOutline,
  HomeIcon as HomeOutline,
  RectangleStackIcon as RectangleStackOutline,
} from '@heroicons/react/24/outline';
import {
  Cog6ToothIcon as Cog6ToothSolid,
  HomeIcon as HomeSolid,
  RectangleStackIcon as RectangleStackSolid,
} from '@heroicons/react/24/solid';
import { useTranslation } from 'react-i18next';
import { useIsGlass } from '@/components/theme/SurfaceContext';
import type { AppView } from '@/types';
import { cn } from '@/lib/utils';

export interface MobileBottomNavProps {
  view: AppView;
  onNavigate: (view: AppView) => void;
}

const navItems = [
  { value: 'dashboard' as const, labelKey: 'nav.dashboard', icon: HomeOutline, activeIcon: HomeSolid },
  { value: 'items' as const, labelKey: 'nav.items', icon: RectangleStackOutline, activeIcon: RectangleStackSolid },
  { value: 'settings' as const, labelKey: 'nav.settings', icon: Cog6ToothOutline, activeIcon: Cog6ToothSolid },
];

/** Floating mobile dock — mirrors the desktop NavDock. */
export function MobileBottomNav({ view, onNavigate }: MobileBottomNavProps) {
  const { t } = useTranslation();
  const isGlass = useIsGlass();

  return (
    <nav
      className={cn(
        'mobile-only fixed inset-x-3 bottom-3 z-50 flex items-center gap-1 rounded-[24px] p-1.5',
        'pb-[max(0.375rem,env(safe-area-inset-bottom))]',
        isGlass
          ? 'glass-surface glass-chrome'
          : 'border border-slate-200/70 bg-white/90 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/90',
      )}
    >
      {navItems.map((item) => {
        const active = view === item.value;
        const Icon = active ? item.activeIcon : item.icon;
        return (
          <button
            key={item.value}
            type="button"
            onClick={() => onNavigate(item.value)}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-1 rounded-[16px] py-2 transition-all active:scale-95',
              active
                ? 'bg-brand-600 text-white shadow-[0_6px_18px_-6px_rgb(79_70_229/0.9)]'
                : 'text-slate-500 dark:text-slate-400',
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="text-[10px] font-semibold leading-none">{t(item.labelKey)}</span>
          </button>
        );
      })}
    </nav>
  );
}