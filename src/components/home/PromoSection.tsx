import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { activePromos } from '@/lib/promos'
import { todayInJakarta } from '@/lib/request-guards'
import { Icon } from '@/components/ui/Icon'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { RevealOnScroll } from '@/components/ui/RevealOnScroll'
import { PromoCard } from '@/components/promo/PromoCard'

type Props = {
  locale: Locale
  waNumber: string
}

/**
 * Homepage promo band. Renders nothing at all once every promo has expired, so
 * the page closes back up instead of showing an empty shell.
 */
export async function PromoSection({ locale, waNumber }: Props) {
  const running = activePromos(todayInJakarta())
  if (running.length === 0) return null

  const t = await getTranslations('promo')

  return (
    <section className="section bg-[var(--brand-50)]" aria-labelledby="promo-heading">
      <div className="container-site">
        <SectionHeading
          eyebrow={t('eyebrow')}
          title={<span id="promo-heading">{t('title')}</span>}
          subtitle={t('subtitle')}
        />

        <div className="mx-auto mt-14 grid max-w-5xl gap-8">
          {running.map((promo, index) => (
            <RevealOnScroll key={promo.id} delay={index * 70}>
              <PromoCard promo={promo} locale={locale} waNumber={waNumber} />
            </RevealOnScroll>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/promo"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--brand-700)] hover:text-[var(--brand-600)]"
          >
            {t('viewAll')}
            <Icon name="arrow-right" className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
