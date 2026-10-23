import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

const sizeClasses = {
  sm: 'sm:max-w-md',
  md: 'sm:max-w-xl',
  lg: 'sm:max-w-3xl',
};

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: keyof typeof sizeClasses;
}

/**
 * Responsive modal: bottom sheet on phones, centered dialog on desktop.
 * Mobile-specific overrides live in `styles/mobile.css`.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
}: ModalProps) {
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div className="mobile-sheet-parent fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Close dialog"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default bg-slate-950/45 backdrop-blur-sm"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          'mobile-sheet relative z-10 flex max-h-[92dvh] w-full animate-sheet-up flex-col overflow-hidden rounded-t-[1.6rem] border border-slate-200/80 bg-white shadow-2xl dark:border-white/10 dark:bg-slate-900 sm:animate-fade-in sm:rounded-[1.6rem]',
          sizeClasses[size],
        )}
      >
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-100 p-5 dark:border-slate-800">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">{title}</h2>
            {description && (
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label="Close"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-5">{children}</div>

        {footer && (
          <footer className="shrink-0 border-t border-slate-100 p-4 dark:border-slate-800">
            {footer}
          </footer>
        )}
      </div>
    </div>,
    document.body,
  );
}