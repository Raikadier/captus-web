import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'

import { cn } from '../lib/utils'

/**
 * Badge — Captus Design System v2
 *
 * Upgrades vs v1:
 *   - rounded-full (pill shape) — matches design system chip spec
 *   - Semantic color variants using design system tokens
 *   - Status variants: success, warning, info, streak
 *   - Proper padding: px-2.5 py-0.5 (chipPadding = 8px h, 4px v)
 */
const badgeVariants = cva(
  [
    'inline-flex items-center justify-center gap-1',
    'rounded-full',                      /* pill — StadiumBorder */
    'border px-2.5 py-0.5',
    'text-xs font-semibold tracking-[0.02em]',
    'w-fit whitespace-nowrap shrink-0',
    '[&>svg]:size-3 [&>svg]:pointer-events-none',
    'transition-colors duration-[var(--duration-fast)]',
    'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
    'aria-invalid:ring-destructive/20 aria-invalid:border-destructive',
    'overflow-hidden',
  ].join(' '),
  {
    variants: {
      variant: {
        // Primary / brand
        default:
          'border-transparent bg-primary text-primary-foreground [a&]:hover:brightness-105',

        // Soft brand (most common for status chips)
        brand:
          'border-transparent bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-400',

        // Secondary (light green tint)
        secondary:
          'border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90',

        // Destructive / error
        destructive:
          'border-transparent bg-destructive/10 text-destructive dark:bg-destructive/20',

        // Success
        success:
          'border-transparent bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-400',

        // Warning
        warning:
          'border-transparent bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',

        // Info
        info:
          'border-transparent bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',

        // Streak (amber gamification)
        streak:
          'border-transparent bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400',

        // Outline
        outline:
          'border-border bg-transparent text-foreground [a&]:hover:bg-accent',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function Badge({ className, variant, asChild = false, ...props }) {
  const Comp = asChild ? Slot : 'span'

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
