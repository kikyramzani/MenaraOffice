'use client'

import { useLocale, useTranslations } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/navigation'
import { locales, type Locale } from '@/i18n/routing'
import { clsx } from '@/lib/clsx'

export function LanguageSwitcher() {
  const locale = useLocale()
  const t = useTranslations('langSwitch')
  const pathname = usePathname()
  const router = useRouter()

  return (
    <div
      role="group"
      aria-label={t('label')}
      className="flex items-center rounded-[var(--radius-pill)] border border-[var(--color-border)] p-0.5"
    >
      {locales.map((value) => (
        <button
          key={value}
          type="button"
          aria-label={t(value)}
          aria-pressed={locale === value}
          className={clsx(
            'rounded-[var(--radius-pill)] px-2.5 py-1 text-xs font-bold uppercase transition-colors',
            locale === value
              ? 'bg-[var(--brand-700)] text-white'
              : 'text-[var(--color-text-muted)] hover:text-[var(--brand-700)]',
          )}
          onClick={() => router.replace(pathname, { locale: value as Locale })}
        >
          {value}
        </button>
      ))}
    </div>
  )
}
