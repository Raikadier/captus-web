import * as React from 'react'
import { cn } from '../lib/utils'

/**
 * Input — Captus Design System v2
 *
 * Upgrades vs v1:
 *   - h-12 (48px) — matches mobile inputHeight token
 *   - rounded-md (6px) — intentionally less curved than buttons (visual distinction)
 *   - Slate-100 rest bg (--input) — not transparent
 *   - Slate-200 border at rest, 2px brand border on focus
 *   - Smooth border-width transition for satisfying focus feel
 *   - Error state: red border + red ring
 */
function Input({ className, type, ...props }) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Layout & sizing
        'h-12 w-full min-w-0',          /* 48px — design system inputHeight */
        'px-4 py-2',
        'text-sm',
        'rounded-md',                    /* 6px — smaller than buttons (12px) */

        // Surface & colors
        'bg-input',                      /* slate-100 rest */
        'text-foreground',
        'border border-border',          /* 1px slate-200 at rest */
        'placeholder:text-muted-foreground/60',
        'selection:bg-primary selection:text-primary-foreground',

        // Transition — smooth border changes
        'transition-[border-color,box-shadow,background-color]',
        'duration-[var(--duration-fast)] ease-[var(--ease-standard)]',

        // Focus: 2px brand border + subtle ring
        'focus:outline-none',
        'focus:border-primary focus:border-2',
        'focus:bg-card',                 /* white on focus */
        'focus:ring-4 focus:ring-primary/10',

        // Error state
        'aria-invalid:border-destructive aria-invalid:border-2',
        'aria-invalid:ring-4 aria-invalid:ring-destructive/10',

        // File input
        'file:text-foreground file:border-0 file:bg-transparent',
        'file:text-sm file:font-medium',
        'file:inline-flex file:h-7',

        // Dark mode
        'dark:bg-input dark:border-slate-700',
        'dark:focus:bg-slate-800 dark:focus:border-primary',

        // Disabled
        'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-40',

        className,
      )}
      {...props}
    />
  )
}

export { Input }
