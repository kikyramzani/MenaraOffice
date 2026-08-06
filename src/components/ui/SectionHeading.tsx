import type { ReactNode } from 'react'
import { clsx } from '@/lib/clsx'

type Props = {
  eyebrow?: string
  title: ReactNode
  subtitle?: ReactNode
  align?: 'left' | 'center'
  tone?: 'light' | 'dark'
  as?: 'h1' | 'h2'
  className?: string
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  tone = 'light',
  as: Heading = 'h2',
  className,
}: Props) {
  return (
    <div
      className={clsx(
        'max-w-2xl',
        align === 'center' && 'mx-auto text-center',
        className,
      )}
    >
      {eyebrow ? (
        <p
          className={clsx(
            'mb-3 text-xs font-bold uppercase tracking-[0.18em]',
            tone === 'light' ? 'text-[var(--brand-600)]' : 'text-[var(--brand-300)]',
          )}
        >
          {eyebrow}
        </p>
      ) : null}
      <Heading
        className={clsx(
          'text-[length:var(--text-2xl)] font-extrabold leading-tight tracking-tight',
          tone === 'light' ? 'text-[var(--brand-900)]' : 'text-white',
        )}
      >
        {title}
      </Heading>
      {subtitle ? (
        <p
          className={clsx(
            'mt-4 text-[length:var(--text-lg)] leading-relaxed',
            tone === 'light' ? 'text-[var(--color-text-muted)]' : 'text-[var(--brand-200)]',
          )}
        >
          {subtitle}
        </p>
      ) : null}
    </div>
  )
}
