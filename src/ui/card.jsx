import * as React from 'react'
import { cn } from '../lib/utils'

/**
 * Card — Captus Design System v2
 *
 * Upgrades vs v1:
 *   - AppShadows.sm equivalent: subtle two-layer shadow for depth
 *   - Slate border (1px) — warm-blue tint instead of neutral gray
 *   - rounded-xl (16px) — matches design system card radius
 *   - Press feedback on interactive cards via data-interactive attribute
 *   - Gap refined: gap-0 default, children control their own spacing
 */
function Card({ className, interactive = false, ...props }) {
  return (
    <div
      data-slot="card"
      data-interactive={interactive || undefined}
      className={cn(
        // Base surface
        'bg-card text-card-foreground',
        'flex flex-col',
        'rounded-xl',
        'border border-border',
        // Shadow: two-layer sm (matches AppShadows.sm)
        'shadow-[0_1px_3px_oklch(0.160_0.030_246_/_0.08),0_1px_2px_oklch(0.160_0.030_246_/_0.04)]',
        // Smooth transition for hover
        'transition-[box-shadow,transform]',
        'duration-[var(--duration-standard)] ease-[var(--ease-standard)]',
        // Interactive variant: hover lift + press feedback
        interactive && [
          'cursor-pointer',
          'hover:shadow-[0_4px_6px_oklch(0.160_0.030_246_/_0.07),0_2px_4px_oklch(0.160_0.030_246_/_0.04)]',
          'hover:-translate-y-px',
          'active:scale-[0.99] active:shadow-[0_1px_3px_oklch(0.160_0.030_246_/_0.08)]',
        ],
        className,
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        '@container/card-header grid auto-rows-min grid-rows-[auto_auto]',
        'items-start gap-1.5',
        'px-5 pt-5',
        'has-data-[slot=card-action]:grid-cols-[1fr_auto]',
        className,
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        'leading-tight font-semibold text-[0.9375rem]',  /* 15px — titleLarge */
        'tracking-[-0.01em]',
        className,
      )}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }) {
  return (
    <div
      data-slot="card-description"
      className={cn(
        'text-muted-foreground text-sm leading-relaxed',
        className,
      )}
      {...props}
    />
  )
}

function CardAction({ className, ...props }) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        'col-start-2 row-span-2 row-start-1 self-start justify-self-end',
        className,
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }) {
  return (
    <div
      data-slot="card-content"
      className={cn('px-5 pb-5', className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        'flex items-center px-5 pb-5 pt-0 gap-3',
        '[.border-t]:pt-4',
        className,
      )}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
