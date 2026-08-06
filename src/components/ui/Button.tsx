import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'
import { clsx } from '@/lib/clsx'

type Variant = 'primary' | 'secondary' | 'ghost' | 'whatsapp'
type Size = 'md' | 'lg'

const base =
  'inline-flex items-center justify-center gap-2 font-semibold rounded-[var(--radius-pill)] transition-[background-color,border-color,color,transform,box-shadow] duration-[var(--duration-fast)] active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none'

const variants: Record<Variant, string> = {
  primary:
    'bg-[var(--brand-700)] text-white hover:bg-[var(--brand-800)] shadow-[0_8px_20px_-8px_rgb(23_93_141/0.65)] hover:shadow-[0_10px_24px_-8px_rgb(23_93_141/0.75)]',
  secondary:
    'bg-white text-[var(--brand-800)] border border-[var(--brand-200)] hover:border-[var(--brand-500)] hover:text-[var(--brand-600)]',
  ghost: 'text-[var(--brand-700)] hover:bg-[var(--brand-50)]',
  whatsapp:
    'bg-[var(--wa-600)] text-white hover:bg-[var(--wa-700)] shadow-[0_8px_20px_-8px_rgb(37_211_102/0.6)]',
}

const sizes: Record<Size, string> = {
  md: 'text-sm px-5 py-2.5',
  lg: 'text-base px-7 py-3.5',
}

type CommonProps = {
  variant?: Variant
  size?: Size
  className?: string
  children: ReactNode
}

type ButtonAsButton = CommonProps & ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined }
type ButtonAsLink = CommonProps & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }

export function Button(props: ButtonAsButton | ButtonAsLink) {
  const { variant = 'primary', size = 'md', className, children, ...rest } = props
  const classes = clsx(base, variants[variant], sizes[size], className)

  if ('href' in rest && typeof rest.href === 'string') {
    return (
      <a className={classes} {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {children}
      </a>
    )
  }

  return (
    <button className={classes} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  )
}
