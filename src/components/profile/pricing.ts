import type { Service } from '@/lib/data/types'
import { formatRupiahFull, unitSuffixId } from '@/lib/format'

/**
 * "Mulai dari" figure for a service: its cheapest tier, formatted the way the
 * pricing cards on the website do it. One-off fees carry a word instead of a
 * slash suffix, so "Rp 6.000.000" never reads as a recurring charge.
 */
export function startingPriceLabel(service: Service): string | null {
  // Zero is the "on request" sentinel, not a real figure — including it would
  // advertise the service as "Rp 0". Services priced entirely on request
  // return null and the caller falls back to a contact prompt.
  const [first, ...rest] = service.tiers.filter((tier) => tier.price > 0)
  if (!first) return null

  const cheapest = rest.reduce((min, tier) => (tier.price < min.price ? tier : min), first)
  const amount = formatRupiahFull(cheapest.price)

  return cheapest.unit === 'once' ? `${amount} sekali bayar` : `${amount}${unitSuffixId(cheapest.unit)}`
}
