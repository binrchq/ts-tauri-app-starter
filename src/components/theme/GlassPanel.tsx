import { Suspense, lazy, type CSSProperties, type ReactNode } from 'react';
import { useIsGlass } from '@/components/theme/SurfaceContext';
import { useMobile } from '@/hooks/useMobile';
import { cn } from '@/lib/utils';

// Optional: the npm implementation of Liquid Glass. The built-in CSS lens
// (GlassFilters.tsx) covers the same ground with no bundle cost, so this is
// only pulled in when a panel explicitly asks for `engine="react"`.
const LiquidGlass = lazy(() => import('liquid-glass-react'));

export interface GlassPanelProps {
  children: ReactNode;
  className?: string;
  cornerRadius?: number;
  /** `css` = built-in SVG lens (default). `react` = liquid-glass-react. */
  engine?: 'css' | 'react';
  /** Use the stronger chrome lens instead of the panel lens. */
  chrome?: boolean;
  displacementScale?: number;
  elasticity?: number;
  style?: CSSProperties;
}

/**
 * Surface-aware glass panel.
 *
 * | surface | engine  | result                                            |
 * |---------|---------|---------------------------------------------------|
 * | glass   | css     | `.glass-surface` + SVG edge-lensing filter        |
 * | glass   | react   | liquid-glass-react (mouse-reactive, desktop only) |
 * | solid   | –       | `.panel` opaque card                              |
 */
export function GlassPanel({
  children,
  className,
  cornerRadius = 24,
  engine = 'css',
  chrome = false,
  displacementScale = 56,
  elasticity = 0.2,
  style,
}: GlassPanelProps) {
  const isGlass = useIsGlass();
  const { isMobile } = useMobile();

  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const useReactEngine = isGlass && engine === 'react' && !isMobile && !reducedMotion;

  if (!useReactEngine) {
    return (
      <div
        className={cn(isGlass ? 'glass-surface' : 'panel', chrome && 'glass-chrome', className)}
        style={{ borderRadius: cornerRadius, ...style }}
      >
        {children}
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div
          className={cn('glass-surface', chrome && 'glass-chrome', className)}
          style={{ borderRadius: cornerRadius, ...style }}
        >
          {children}
        </div>
      }
    >
      <LiquidGlass
        mode="standard"
        cornerRadius={cornerRadius}
        displacementScale={displacementScale}
        blurAmount={0.04}
        saturation={170}
        aberrationIntensity={2}
        elasticity={elasticity}
        padding="0px"
        className={cn('liquid-panel', className)}
        style={style}
      >
        {children}
      </LiquidGlass>
    </Suspense>
  );
}