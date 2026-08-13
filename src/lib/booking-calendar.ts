import type { BlockedDate, L10n } from '@/lib/data/types'

/**
 * Single source of truth for "can this calendar date be booked?", shared by the
 * calendar widget, /api/availability and the /api/bookings guard. Three copies
 * of this rule would drift the first time the client changes it.
 *
 * Deliberately not under lib/data/ — every module there is `server-only`, and
 * this one has to run in the visitor's browser too.
 */

export type BlockReason = 'weekend' | 'holiday' | 'event'

/** The subset of a BlockedDate the decision actually needs. */
export type DateBlockRule = Pick<BlockedDate, 'date' | 'label' | 'locationIds' | 'source'>

/** Label is null for a weekend, which has no per-row name. */
export type DateBlock = { reason: BlockReason; label: L10n | null }

/** Sat + Sun, used wherever a persisted record predates the weekend policy. */
export const DEFAULT_CLOSED_WEEKDAYS = [0, 6]

/**
 * Weekday of a plain calendar date, 0 = Sunday … 6 = Saturday.
 *
 * `new Date('2026-08-15').getDay()` is parsed as UTC midnight, so in any
 * negative-offset timezone it reports the *previous* day — under
 * TZ=Pacific/Honolulu that expression returns 5 (Friday) for a Saturday. The
 * widget runs in the visitor's browser, so that would shift the weekend block
 * one cell to the left for anyone west of Greenwich. A calendar date carries no
 * timezone, so read the components back out in UTC: the answer is then
 * identical on the Vercel lambda, in Jakarta, and in any browser on earth.
 */
export function weekdayOfIsoDate(iso: string): number {
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(Date.UTC(year ?? 0, (month ?? 1) - 1, day ?? 1)).getUTCDay()
}

/** Drops rows the admin switched off; every layer must filter identically. */
export function toDateBlockRules(blocked: BlockedDate[]): DateBlockRule[] {
  return blocked
    .filter((entry) => entry.active)
    .map((entry) => ({
      date: entry.date,
      label: entry.label,
      locationIds: entry.locationIds,
      source: entry.source,
    }))
}

/**
 * Why the date is unbookable, or null when it is bookable. Returning the reason
 * rather than a boolean lets the tooltip, the API error payload and the admin
 * preview all read one call.
 *
 * Not a validator: a malformed `iso` yields NaN and reads as bookable. Both
 * routes regex-check the date before calling this, and that ordering matters.
 */
export function findDateBlock(
  iso: string,
  locationId: string,
  rules: DateBlockRule[],
  closedWeekdays: number[] | undefined,
): DateBlock | null {
  // `?? DEFAULT` guards records written before the weekend policy existed;
  // without it every calendar render throws on `undefined.includes`.
  if ((closedWeekdays ?? DEFAULT_CLOSED_WEEKDAYS).includes(weekdayOfIsoDate(iso))) {
    return { reason: 'weekend', label: null }
  }

  const rule = rules.find(
    (candidate) =>
      candidate.date === iso &&
      // Empty locationIds is the all-locations scope — see BlockedDate.
      (candidate.locationIds.length === 0 || candidate.locationIds.includes(locationId)),
  )
  if (!rule) return null

  return { reason: rule.source === 'holiday' ? 'holiday' : 'event', label: rule.label }
}
