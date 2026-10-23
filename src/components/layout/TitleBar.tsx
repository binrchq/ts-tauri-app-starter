import { useCallback, useEffect, useState } from 'react';
import { MinusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { isTauri } from '@/api';
import { cn } from '@/lib/utils';

/**
 * Custom window chrome for a borderless window (`decorations: false`).
 *
 * Drag is handled by `data-tauri-drag-region` rather than JS: the OS moves the
 * window natively, which avoids the lag you get from pointer-move handlers.
 * Interactive children must opt out of the drag region, otherwise the OS
 * swallows their clicks.
 *
 * Only rendered on desktop — mobile has no window controls.
 */
export function TitleBar({ title }: { title: string }) {
  const [maximized, setMaximized] = useState(false);
  const [available, setAvailable] = useState(false);

  // Keep local state in sync: the window can also be maximised by the OS
  // (snap, double-click, Win+Up), not just by our buttons.
  useEffect(() => {
    if (!isTauri()) return;

    let unlisten: (() => void) | undefined;
    let cancelled = false;

    (async () => {
      try {
        const { getCurrentWindow } = await import('@tauri-apps/api/window');
        const win = getCurrentWindow();
        if (cancelled) return;

        setAvailable(true);
        setMaximized(await win.isMaximized());

        const un = await win.onResized(async () => {
          setMaximized(await win.isMaximized());
        });
        if (cancelled) un();
        else unlisten = un;
      } catch (error) {
        console.warn('Window controls unavailable:', error);
      }
    })();

    return () => {
      cancelled = true;
      unlisten?.();
    };
  }, []);

  const withWindow = useCallback(
    (action: (win: Awaited<ReturnType<typeof getWindow>>) => Promise<unknown>) => async () => {
      try {
        const win = await getWindow();
        await action(win);
      } catch (error) {
        console.warn('Window action failed:', error);
      }
    },
    [],
  );

  // In a browser (no Tauri) there is no window to control, so render nothing
  // rather than dead buttons.
  if (!available) return null;

  const button =
    'inline-flex h-8 w-11 items-center justify-center text-slate-500 transition-colors hover:bg-slate-900/8 dark:text-slate-400 dark:hover:bg-white/10';

  return (
    <div
      data-tauri-drag-region
      className="flex h-9 shrink-0 select-none items-center justify-between pl-3"
    >
      <span
        data-tauri-drag-region
        className="pointer-events-none truncate text-[11px] font-semibold tracking-wide text-slate-400 dark:text-slate-500"
      >
        {title}
      </span>

      {/* Controls must sit outside the drag region or the OS eats the clicks. */}
      <div className="flex items-center">
        <button
          type="button"
          aria-label="Minimize"
          onClick={withWindow((win) => win.minimize())}
          className={cn(button, 'rounded-tr-none')}
        >
          <MinusIcon className="h-4 w-4" />
        </button>

        <button
          type="button"
          aria-label={maximized ? 'Restore' : 'Maximize'}
          onClick={withWindow((win) => win.toggleMaximize())}
          className={button}
        >
          {maximized ? <RestoreGlyph /> : <MaximizeGlyph />}
        </button>

        <button
          type="button"
          aria-label="Close"
          onClick={withWindow((win) => win.close())}
          className={cn(button, 'hover:bg-red-600 hover:text-white')}
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

async function getWindow() {
  const { getCurrentWindow } = await import('@tauri-apps/api/window');
  return getCurrentWindow();
}

function MaximizeGlyph() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.4">
      <rect x="3.2" y="3.2" width="9.6" height="9.6" rx="1.6" />
    </svg>
  );
}

function RestoreGlyph() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.4">
      <rect x="2.6" y="5.4" width="8" height="8" rx="1.5" />
      <path d="M5.4 5.4V4a1.5 1.5 0 0 1 1.5-1.5h5.6A1.5 1.5 0 0 1 14 4v5.6a1.5 1.5 0 0 1-1.5 1.5h-1.4" />
    </svg>
  );
}
