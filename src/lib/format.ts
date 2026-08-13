import type { L10n, PricingTier } from '@/lib/data/types'
import type { Locale } from '@/i18n/routing'

/**
 * Compact rupiah display in the style of the brand's price cards:
 * 4_000_000 → "4 Juta", 100_000 → "100rb", 450_000 → "450rb".
 */
export function formatRupiahShort(amount: number, locale: Locale): string {
  if (amount >= 1_000_000) {
    const millions = amount / 1_000_000
    const value = Number.isInteger(millions) ? millions.toString() : millions.toFixed(1)
    return locale === 'id' ? `${value} Juta` : `${value}M`
  }
  if (amount >= 1_000) {
    const thousands = Math.round(amount / 1_000)
    return locale === 'id' ? `${thousands}rb` : `${thousands}k`
  }
  return amount.toString()
}

/** Full thousands-separated rupiah, e.g. "Rp 4.000.000". */
export function formatRupiahFull(amount: number): string {
  return `Rp ${new Intl.NumberFormat('id-ID').format(amount)}`
}

export type PriceUnit = PricingTier['unit']

/**
 * Translation key for a price unit, e.g. 'year' → 'perYear'.
 *
 * Centralised because four call sites used to repeat the same ternary chain,
 * and two of them had a catch-all `else` that would silently mislabel any new
 * unit instead of failing the build.
 */
export function unitLabelKey(unit: PriceUnit): 'perMonth' | 'perYear' | 'perHour' | 'once' {
  if (unit === 'month') return 'perMonth'
  if (unit === 'year') return 'perYear'
  if (unit === 'hour') return 'perHour'
  return 'once'
}

/** Indonesian-only unit noun for the admin panel, which is not translated. */
export function unitLabelId(unit: PriceUnit): string {
  if (unit === 'month') return 'bulan'
  if (unit === 'year') return 'tahun'
  if (unit === 'hour') return 'jam'
  return 'paket'
}

/** Compact suffix for admin list rows, e.g. '/bln'. */
export function unitSuffixId(unit: PriceUnit): string {
  if (unit === 'month') return '/bln'
  if (unit === 'year') return '/thn'
  if (unit === 'hour') return '/jam'
  return ''
}

export function pickL10n(text: L10n, locale: Locale): string {
  return locale === 'en' ? text.en : text.id
}

export function formatDate(isoDate: string, locale: Locale): string {
  const date = new Date(`${isoDate.slice(0, 10)}T00:00:00`)
  return new Intl.DateTimeFormat(locale === 'id' ? 'id-ID' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export function formatHour(hour: number): string {
  return `${hour.toString().padStart(2, '0')}:00`
}
