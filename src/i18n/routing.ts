import { defineRouting } from 'next-intl/routing'

export const locales = ['id', 'en'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'id'

/**
 * `localePrefix: 'always'` keeps every page reachable at exactly one canonical
 * URL per language (`/id/...`, `/en/...`) so the hreflang pairs stay stable.
 * The bare `/` redirects to Indonesian, the primary market.
 */
export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: 'always',
  // The primary market is Indonesian; `/` must always land on /id instead of
  // following the browser's Accept-Language header.
  localeDetection: false,
})

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value)
}
