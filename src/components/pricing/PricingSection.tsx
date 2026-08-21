import { getTranslations } from 'next-intl/server'
import type { Locale } from '@/i18n/routing'
import type { Service } from '@/lib/data/types'
import { formatRupiahShort, pickL10n, unitLabelKey, type PriceUnit } from '@/lib/format'
import { waLink } from '@/lib/whatsapp'
import { clsx } from '@/lib/clsx'
import { Icon } from '@/components/ui/Icon'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { RevealOnScroll } from '@/components/ui/RevealOnScroll'

type Props = {
  service: Service
  locale: Locale
  /** Admin 1 — the general-enquiry inbox behind every plan CTA. */
  waNumber: string
}

/**
 * Hostinger-style tier cards: the popular plan is elevated, badge-tagged and
 * rendered in brand navy so the hierarchy is unmistakable.
 */
export async function PricingSection({ service, locale, waNumber }: Props) {
  const t = await getTranslations('services')
  const tiers = [...service.tiers].sort((a, b) => a.order - b.order)
  const serviceName = pickL10n(service.name, locale)

  // perMonth/perYear/perHour already lead with a slash; `once` is a standalone
  // noun so it needs the separating space.
  const unitLabel = (unit: PriceUnit) =>
    unit === 'once' ? ` ${t('once')}` : t(unitLabelKey(unit))

  const consultMessage =
    locale === 'id'
      ? `Halo Menara Office, saya ingin konsultasi mengenai ${serviceName}.`
      : `Hello Menara Office, I'd like a consultation about ${serviceName}.`

  return (
    <section className="section bg-[var(--color-surface-alt)]" aria-labelledby="pricing-heading" id="pricing">
      <div className="container-site">
        <SectionHeading
          eyebrow={t('eyebrow')}
          title={<span id="pricing-heading">{t('pricingTitle', { service: serviceName })}</span>}
          subtitle={t('pricingSubtitle')}
        />

        {tiers.length === 0 ? (
          // Layanan yang harganya selalu dihitung per kasus tidak punya kartu
          // sama sekali; grid kosong akan tampak seperti bug, jadi ganti
          // dengan satu blok ajakan konsultasi.
          <div className="mx-auto mt-14 max-w-2xl rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-9 text-center shadow-[var(--shadow-card)]">
            <h3 className="text-xl font-bold text-[var(--brand-900)]">{t('customQuoteTitle')}</h3>
            <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-muted)]">
              {t('customQuoteBody')}
            </p>
            <a
              href={waLink(waNumber, consultMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-7 inline-flex items-center justify-center gap-2 rounded-[var(--radius-pill)] bg-[var(--wa-600)] px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--wa-700)]"
            >
              <Icon name="whatsapp" className="h-5 w-5" />
              {t('consultWhatsApp')}
            </a>
          </div>
        ) : (
        <div
          className={clsx(
            'mx-auto mt-14 grid max-w-5xl gap-6',
            tiers.length >= 3 ? 'lg:grid-cols-3' : tiers.length === 2 ? 'md:grid-cols-2' : 'max-w-md',
          )}
        >
          {tiers.map((tier, index) => {
            const isPopular = tier.isPopular
            const message =
              locale === 'id'
                ? `Halo Menara Office, saya tertarik dengan paket ${serviceName} ${tier.name}. Boleh minta info lebih lanjut?`
                : `Hello Menara Office, I'm interested in the ${serviceName} ${tier.name} plan. Could I get more details?`

            return (
              <RevealOnScroll key={tier.id} delay={index * 70} className={clsx(isPopular && 'lg:-mt-4')}>
                <div
                  className={clsx(
                    'relative flex h-full flex-col rounded-[var(--radius-lg)] p-7 transition-transform duration-[var(--duration-normal)] hover:-translate-y-1',
                    isPopular
                      ? 'wash-navy text-white shadow-[var(--shadow-lift)]'
                      : 'border border-[var(--color-border)] bg-white shadow-[var(--shadow-card)]',
                  )}
                >
                  {isPopular ? (
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-[var(--radius-pill)] bg-[var(--accent-500)] px-4 py-1 text-xs font-bold uppercase tracking-wider text-[var(--brand-950)]">
                      {t('popular')}
                    </span>
                  ) : null}

                  <h3 className={clsx('text-lg font-bold', isPopular ? 'text-white' : 'text-[var(--brand-900)]')}>
                    {tier.name}
                  </h3>
                  <p className={clsx('mt-1 text-xs font-semibold uppercase tracking-wider', isPopular ? 'text-[var(--brand-300)]' : 'text-[var(--brand-600)]')}>
                    {pickL10n(tier.priceNote, locale)}
                  </p>

                  {/* `price: 0` adalah penanda "harga atas permintaan" —
                      menampilkan angkanya berarti mengiklankan Rp 0. */}
                  {tier.price > 0 ? (
                    <p className="mt-5 flex items-baseline gap-1">
                      <span className={clsx('text-sm font-semibold', isPopular ? 'text-[var(--brand-300)]' : 'text-[var(--color-text-muted)]')}>
                        Rp
                      </span>
                      <span className={clsx('text-4xl font-extrabold tracking-tight', isPopular ? 'text-white' : 'text-[var(--brand-900)]')}>
                        {formatRupiahShort(tier.price, locale)}
                      </span>
                      <span className={clsx('text-sm', isPopular ? 'text-[var(--brand-300)]' : 'text-[var(--color-text-muted)]')}>
                        {unitLabel(tier.unit)}
                      </span>
                    </p>
                  ) : (
                    <p className={clsx('mt-5 text-3xl font-extrabold tracking-tight', isPopular ? 'text-white' : 'text-[var(--brand-900)]')}>
                      {t('onRequest')}
                    </p>
                  )}

                  <ul className="mt-6 flex-1 space-y-3">
                    {tier.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-2.5 text-sm">
                        <Icon
                          name="check"
                          className={clsx('mt-0.5 h-4 w-4 shrink-0', isPopular ? 'text-[var(--brand-300)]' : 'text-[var(--color-success)]')}
                        />
                        <span className={isPopular ? 'text-[var(--brand-100)]' : 'text-[var(--color-text)]'}>
                          {pickL10n(feature, locale)}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <a
                    href={waLink(waNumber, message)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={clsx(
                      'mt-7 inline-flex w-full items-center justify-center gap-2 rounded-[var(--radius-pill)] px-6 py-3 text-sm font-semibold transition-colors',
                      isPopular
                        ? 'bg-white text-[var(--brand-800)] hover:bg-[var(--brand-100)]'
                        : 'bg-[var(--brand-700)] text-white hover:bg-[var(--brand-800)]',
                    )}
                  >
                    {tier.price > 0 ? t('choosePlan') : t('consultWhatsApp')}
                    <Icon name={tier.price > 0 ? 'arrow-right' : 'whatsapp'} className="h-4 w-4" />
                  </a>
                </div>
              </RevealOnScroll>
            )
          })}
        </div>
        )}
      </div>
    </section>
  )
}
