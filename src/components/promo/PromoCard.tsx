import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import type { Promo } from '@/lib/promos'
import { formatDate, formatRupiahFull, pickL10n, unitLabelKey } from '@/lib/format'
import { waLink } from '@/lib/whatsapp'
import { clsx } from '@/lib/clsx'
import { Icon } from '@/components/ui/Icon'

type Props = {
  promo: Promo
  locale: Locale
  /** Admin 1 — the general-enquiry inbox behind the promo CTA. */
  waNumber: string
}

/**
 * Poster on the left when artwork exists, offer details on the right. Without
 * a poster the detail column simply spans the full width, so the card never
 * looks half-finished while the image is still being produced.
 */
export async function PromoCard({ promo, locale, waNumber }: Props) {
  const t = await getTranslations('promo')
  const tServices = await getTranslations('services')

  const title = pickL10n(promo.title, locale)
  const message =
    locale === 'id'
      ? `Halo Menara Office, saya ingin mengambil ${title}.`
      : `Hello Menara Office, I'd like to claim the ${title}.`

  return (
    <article
      className={clsx(
        'grid overflow-hidden rounded-[var(--radius-lg)] border border-[var(--accent-100)] bg-white shadow-[var(--shadow-lift)]',
        promo.poster && 'md:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)] md:items-center',
      )}
    >
      {promo.poster ? (
        // Dirender pada rasio aslinya, bukan `fill` + object-cover: memotong
        // poster berarti memotong logo atau tanggal berlakunya.
        <Image
          src={promo.poster}
          alt={title}
          width={1080}
          height={1350}
          sizes="(max-width: 768px) 100vw, 40vw"
          className="h-auto w-full"
        />
      ) : null}

      <div className="relative p-7 md:p-10">
        {/* Poster sudah memuat stempel diskonnya sendiri; menampilkan pita
            kedua tepat di sebelahnya hanya jadi pengulangan. */}
        {promo.poster ? null : (
          <span className="absolute right-0 top-7 rounded-l-[var(--radius-pill)] bg-[var(--accent-500)] px-5 py-1.5 text-sm font-extrabold uppercase tracking-wider text-[var(--brand-950)]">
            {t('discountBadge', { value: promo.discountLabel })}
          </span>
        )}

        <h3 className="max-w-[16ch] text-3xl font-extrabold tracking-tight text-[var(--brand-900)] md:text-4xl">
          {title}
        </h3>
        <p className="mt-3 max-w-prose text-sm leading-relaxed text-[var(--color-text-muted)]">
          {pickL10n(promo.subtitle, locale)}
        </p>

        <div className="mt-7 flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <p className="text-sm text-[var(--color-text-muted)]">
            {t('priceBefore')}{' '}
            <s className="font-semibold">{formatRupiahFull(promo.priceBefore)}</s>
          </p>
          <p className="flex items-baseline gap-1">
            <span className="text-4xl font-extrabold tracking-tight text-[var(--brand-700)] md:text-5xl">
              {formatRupiahFull(promo.priceAfter)}
            </span>
            <span className="text-sm font-semibold text-[var(--color-text-muted)]">
              {tServices(unitLabelKey(promo.unit))}
            </span>
          </p>
        </div>

        <p className="mt-7 text-xs font-bold uppercase tracking-wider text-[var(--brand-600)]">
          {t('benefitsTitle')}
        </p>
        <ul className="mt-3 space-y-2.5">
          {promo.benefits.map((benefit, index) => (
            <li key={index} className="flex items-start gap-2.5 text-sm text-[var(--color-text)]">
              <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-success)]" />
              {pickL10n(benefit, locale)}
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <a
            href={waLink(waNumber, message)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] bg-[var(--wa-600)] px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--wa-700)]"
          >
            <Icon name="whatsapp" className="h-5 w-5" />
            {t('cta')}
          </a>
          <Link
            href={`/${promo.ctaService}`}
            className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--brand-200)] px-6 py-3.5 text-sm font-semibold text-[var(--brand-800)] transition-colors hover:border-[var(--brand-500)] hover:text-[var(--brand-600)]"
          >
            {tServices('viewDetail')}
            <Icon name="arrow-right" className="h-4 w-4" />
          </Link>
        </div>

        <p className="mt-5 flex items-center gap-2 text-xs font-semibold text-[var(--color-text-muted)]">
          <Icon name="calendar" className="h-4 w-4 text-[var(--accent-500)]" />
          {t('validUntil', { date: formatDate(promo.validUntil, locale) })}
        </p>
      </div>
    </article>
  )
}
