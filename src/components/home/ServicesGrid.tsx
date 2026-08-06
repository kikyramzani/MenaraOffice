import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import type { Service } from '@/lib/data/types'
import { formatRupiahShort, pickL10n } from '@/lib/format'
import { Icon } from '@/components/ui/Icon'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { RevealOnScroll } from '@/components/ui/RevealOnScroll'

type Props = { services: Service[]; locale: Locale }

function unitLabel(unit: 'month' | 'hour' | 'once', t: (key: string) => string): string {
  if (unit === 'month') return t('perMonth')
  if (unit === 'hour') return t('perHour')
  return ` ${t('once')}`
}

export async function ServicesGrid({ services, locale }: Props) {
  const t = await getTranslations('services')

  return (
    <section className="section" aria-labelledby="services-heading">
      <div className="container-site">
        <SectionHeading eyebrow={t('eyebrow')} title={<span id="services-heading">{t('title')}</span>} subtitle={t('subtitle')} />

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => {
            const cheapest = [...service.tiers].sort((a, b) => a.price - b.price)[0]
            // The first two services get the large "feature" treatment — an
            // intentional hierarchy break instead of a uniform card grid.
            const isFeature = index < 2

            return (
              <RevealOnScroll
                key={service.id}
                delay={index * 60}
                className={isFeature ? 'sm:col-span-1 lg:row-span-1' : ''}
              >
                <Link
                  href={`/${service.slug}`}
                  className="group flex h-full flex-col rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-[var(--space-card)] shadow-[var(--shadow-card)] transition-[transform,box-shadow,border-color] duration-[var(--duration-normal)] hover:-translate-y-1 hover:border-[var(--brand-300)] hover:shadow-[var(--shadow-lift)]"
                >
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-[var(--radius-md)] bg-[var(--brand-100)] text-[var(--brand-700)] transition-colors group-hover:bg-[var(--brand-700)] group-hover:text-white">
                    <Icon name={service.icon} className="h-6 w-6" />
                  </span>
                  <h3 className="mt-5 text-xl font-bold text-[var(--brand-900)]">
                    {pickL10n(service.name, locale)}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--color-text-muted)]">
                    {pickL10n(service.tagline, locale)}
                  </p>
                  {cheapest ? (
                    <p className="mt-5 border-t border-[var(--color-border)] pt-4 text-sm text-[var(--color-text-muted)]">
                      {t('startFrom')}{' '}
                      <span className="text-lg font-extrabold text-[var(--brand-700)]">
                        Rp {formatRupiahShort(cheapest.price, locale)}
                      </span>
                      <span className="text-xs">{unitLabel(cheapest.unit, t)}</span>
                    </p>
                  ) : null}
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--brand-600)]">
                    {t('viewDetail')}
                    <Icon
                      name="arrow-right"
                      className="h-4 w-4 transition-transform group-hover:translate-x-1"
                    />
                  </span>
                </Link>
              </RevealOnScroll>
            )
          })}
        </div>
      </div>
    </section>
  )
}
