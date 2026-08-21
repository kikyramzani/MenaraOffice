import type { L10n, PricingTier } from '@/lib/data/types'

export type Promo = {
  id: string
  title: L10n
  subtitle: L10n
  /**
   * Path to the poster image under /public. Optional on purpose: the card is
   * built entirely from HTML, so a promo still renders complete while its
   * artwork is being prepared.
   */
  poster?: string
  /** Rendered as-is inside the badge, e.g. '50%'. */
  discountLabel: string
  priceBefore: number
  priceAfter: number
  unit: PricingTier['unit']
  benefits: L10n[]
  /** Inclusive ISO date; the promo disappears the day after. */
  validUntil: string
  /** Slug of the service this promo applies to, used for the CTA link. */
  ctaService: string
}

const l = (id: string, en: string): L10n => ({ id, en })

export const promos: Promo[] = [
  {
    id: 'promo-merdeka',
    title: l('Promo Merdeka', 'Merdeka Promo'),
    subtitle: l(
      'Diskon 50% Virtual Office untuk merayakan kemerdekaan Republik Indonesia.',
      'Fifty percent off Virtual Office to celebrate Indonesian Independence Day.',
    ),
    poster: '/images/promo/promo-merdeka.webp',
    discountLabel: '50%',
    priceBefore: 4_000_000,
    priceAfter: 2_000_000,
    unit: 'year',
    benefits: [
      l('Zonasi perkantoran resmi', 'Officially zoned commercial address'),
      l('Domisili PT, CV, dan Yayasan', 'Domicile for PT, CV, and Yayasan'),
      l(
        'Notifikasi surat via WhatsApp & email real-time',
        'Real-time mail notifications by WhatsApp and email',
      ),
    ],
    validUntil: '2026-08-31',
    ctaService: 'virtual-office',
  },
]

/**
 * Promos still running on the given day, soonest expiry first. Filtering by
 * date means an expired promo drops off the site on its own, with no code edit.
 *
 * @param today ISO date in Asia/Jakarta — see `todayInJakarta()`.
 */
export function activePromos(today: string): Promo[] {
  return promos
    .filter((promo) => promo.validUntil >= today)
    .sort((a, b) => a.validUntil.localeCompare(b.validUntil))
}
