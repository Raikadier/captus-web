import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'

import { cn } from '../lib/utils'

/**
 * Button — Captus Design System v2
 *
 * Upgrades vs v1:
 *   - Primary: gradient fill (brand-500 → brand-600) + brand shadow
 *   - Press feedback: scale(0.97) + opacity(0.90) — design-system spring
 *   - Consistent border-radius: rounded-xl (12px) matching mobile
 *   - Size tokens aligned with design system (h-11 = 44px standard, h-13 = 52px lg)
 *   - focus-visible: 2px brand ring with offset
 */
const buttonVariants = cva(
  // Base: font, flex, transition, a11y
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap',
    'font-semibold text-sm tracking-[0] transition-all',
    'disabled:pointer-events-none disabled:opacity-40',
    'outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    // Press feedback via CSS (complements JS interactions)
    'active:scale-[0.97] active:opacity-90',
    '[&_svg]:pointer-events-none [&_svg:not([class*="size-"])]:size-4 shrink-0 [&_svg]:shrink-0',
    'aria-invalid:ring-destructive/20 aria-invalid:border-destructive',
    // Smooth transition for all states
    'duration-[var(--duration-instant)] ease-[var(--ease-exit)]',
  ].join(' '),
  {
    variants: {
      variant: {
        // Primary: brand gradient + brand shadow on hover
        default: [
          'bg-gradient-to-br from-brand-500 to-brand-600',
          'text-primary-foreground',
          'hover:brightness-105',
          'hover:shadow-brand-sm',
          'active:brightness-95',
        ].join(' '),

        // Destructive: solid red
        destructive: [
          'bg-destructive text-white',
          'hover:bg-destructive/90',
          'shadow-xs hover:shadow-sm',
          'focus-visible:ring-destructive/20',
        ].join(' '),

        // Outlined: border + brand color
        outline: [
          'border-[1.5px] border-primary bg-transparent',
          'text-primary',
          'hover:bg-brand-50 dark:hover:bg-brand-900/20',
        ].join(' '),

        // Secondary: soft brand tint
        secondary: [
          'bg-brand-50 text-brand-700',
          'hover:bg-brand-100',
          'dark:bg-brand-900/20 dark:text-brand-400',
        ].join(' '),

        // Ghost: no background, text only
        ghost: [
          'bg-transparent text-foreground',
          'hover:bg-accent hover:text-accent-foreground',
          'dark:hover:bg-accent/50',
        ].join(' '),

        // Muted: slate-tinted neutral button
        muted: [
          'bg-muted text-muted-foreground',
          'hover:bg-slate-200 dark:hover:bg-slate-700',
        ].join(' '),

        // Link: text only with underline
        link: 'text-primary underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        // Design system: buttonHeight = 44px, buttonHeightLg = 52px
        sm:      'h-9  rounded-lg  px-3 text-xs gap-1.5 has-[>svg]:px-2.5',
        default: 'h-11 rounded-xl  px-4      has-[>svg]:px-3',  /* 44px */
        lg:      'h-13 rounded-xl  px-6      has-[>svg]:px-4',  /* 52px */
        icon:    'size-10 rounded-xl',
        'icon-sm': 'size-8 rounded-lg',
        'icon-lg': 'size-12 rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

const Button = React.forwardRef(({
  className,
  variant,
  size,
  asChild = false,
  ...props
}, ref) => {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = 'Button'

export { Button, buttonVariants }
