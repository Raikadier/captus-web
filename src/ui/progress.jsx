'use client'

import * as React from 'react'
import * as ProgressPrimitive from '@radix-ui/react-progress'

import { cn } from '../lib/utils'

/**
 * Progress — Captus Design System v2
 *
 * Upgrades vs v1:
 *   - h-1.5 (6px) default — matches mobile linearMinHeight token
 *   - rounded-full track — consistent with design system
 *   - Indicator uses brand color with smooth easing transition
 *   - Size variants: xs (4px), sm (6px default), md (8px), lg (12px)
 *   - Color variants: brand (default), violet, amber (streak)
 */
function Progress({ className, value, variant = 'brand', size = 'sm', ...props }) {
  const trackColor = {
    brand:  'bg-brand-100  dark:bg-brand-900/30',
    violet: 'bg-violet-100 dark:bg-violet-900/30',
    amber:  'bg-amber-100  dark:bg-amber-900/30',
    muted:  'bg-muted',
  }[variant] ?? 'bg-brand-100'

  const fillColor = {
    brand:  'bg-gradient-to-r from-brand-500 to-brand-600',
    violet: 'bg-gradient-to-r from-violet-500 to-violet-600',
    amber:  'bg-gradient-to-r from-amber-400 to-amber-500',
    muted:  'bg-muted-foreground',
  }[variant] ?? 'bg-brand-500'

  const heightClass = {
    xs: 'h-1',     /*  4px */
    sm: 'h-1.5',   /*  6px — default */
    md: 'h-2',     /*  8px */
    lg: 'h-3',     /* 12px */
  }[size] ?? 'h-1.5'

  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        trackColor,
        heightClass,
        'relative w-full overflow-hidden rounded-full',
        className,
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn(
          fillColor,
          'h-full w-full flex-1 rounded-full',
          'transition-transform duration-[var(--duration-deliberate)] ease-[var(--ease-standard)]',
        )}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }
