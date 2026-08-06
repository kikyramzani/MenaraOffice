'use client'

import { useTranslations } from 'next-intl'
import { waLink, WA_NUMBER } from '@/lib/whatsapp'
import { Icon } from '@/components/ui/Icon'

/** Floating WhatsApp bubble — replaces the legacy site's "Speak to us" widget. */
export function WhatsAppFloat() {
  const t = useTranslations('wa')

  return (
    <a
      href={waLink(WA_NUMBER, t('defaultMessage'))}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t('float')}
      className="group fixed bottom-5 right-5 z-40 flex items-center gap-0 rounded-[var(--radius-pill)] bg-[var(--wa-600)] p-3.5 text-white shadow-[var(--shadow-lift)] transition-transform hover:scale-105 md:bottom-7 md:right-7"
    >
      <Icon name="whatsapp" className="h-6 w-6" />
      <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-semibold opacity-0 transition-[max-width,opacity,padding] duration-[var(--duration-normal)] group-hover:max-w-40 group-hover:pl-2 group-hover:opacity-100 group-focus-visible:max-w-40 group-focus-visible:pl-2 group-focus-visible:opacity-100">
        {t('float')}
      </span>
    </a>
  )
}
