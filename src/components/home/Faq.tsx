import { getTranslations } from 'next-intl/server'
import { Icon } from '@/components/ui/Icon'
import { SectionHeading } from '@/components/ui/SectionHeading'

/**
 * Native details/summary accordion — keyboard accessible for free, no JS.
 */
export async function Faq() {
  const t = await getTranslations('faq')
  const items = [1, 2, 3, 4, 5] as const

  return (
    <section className="section bg-[var(--color-surface-alt)]" aria-labelledby="faq-heading">
      <div className="container-site max-w-3xl">
        <SectionHeading eyebrow={t('eyebrow')} title={<span id="faq-heading">{t('title')}</span>} />
        <div className="mt-12 space-y-3">
          {items.map((index) => (
            <details
              key={index}
              className="group rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white shadow-[var(--shadow-card)] open:border-[var(--brand-300)]"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 text-left font-bold text-[var(--brand-900)] [&::-webkit-details-marker]:hidden">
                {t(`q${index}`)}
                <Icon
                  name="chevron-down"
                  className="h-5 w-5 shrink-0 text-[var(--brand-500)] transition-transform group-open:rotate-180"
                />
              </summary>
              <p className="px-6 pb-5 text-sm leading-relaxed text-[var(--color-text-muted)]">
                {t(`a${index}`)}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
