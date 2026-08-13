import type { APIRequestContext, Page } from '@playwright/test'

export const ADMIN_EMAIL = 'admin@menaraoffice.id'
export const ADMIN_PASSWORD = 'MenaraOffice2026!'

/**
 * goto + wait for the JS bundles to finish loading. Interactive components
 * (forms, calendar, drawers) need React hydration before clicks register;
 * plain page.goto() resolves on `load` and can race it.
 */
export async function gotoHydrated(page: Page, path: string): Promise<void> {
  await page.goto(path)
  await page.waitForLoadState('networkidle')
}

export async function adminLogin(page: Page): Promise<void> {
  await gotoHydrated(page, '/admin/login')
  await page.getByLabel('Email').fill(ADMIN_EMAIL)
  await page.getByLabel('Password').fill(ADMIN_PASSWORD)
  await page.getByRole('button', { name: 'Masuk' }).click()
  await page.waitForURL('**/admin')
}

/** ISO date N days from now — booking tests always target the future. */
export function futureDate(daysAhead: number): string {
  const date = new Date()
  date.setDate(date.getDate() + daysAhead)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

/**
 * First date at least `minDaysAhead` out that the SERVER says is bookable and
 * still free.
 *
 * Asking the app rather than reimplementing the weekend + holiday rules here
 * means the suite can never drift from the seeded block list. Requiring an
 * empty `booked` array also makes reruns idempotent against a persisted
 * .data/db.json instead of 409-ing on the leftover 09:00 slot.
 */
export async function firstBookableDate(
  request: APIRequestContext,
  roomId: string,
  minDaysAhead = 3,
): Promise<string> {
  for (let offset = minDaysAhead; offset < minDaysAhead + 60; offset += 1) {
    const date = futureDate(offset)
    const response = await request.get(`/api/availability?roomId=${roomId}&date=${date}`)
    const body = (await response.json()) as {
      ok: boolean
      blockedReason: string | null
      booked: unknown[]
    }
    if (body.ok && body.blockedReason === null && body.booked.length === 0) return date
  }
  throw new Error(`no bookable, unbooked date found for ${roomId}`)
}

/** Next Saturday as YYYY-MM-DD — always blocked while weekends are closed. */
export function nextSaturday(): string {
  for (let offset = 1; offset <= 7; offset += 1) {
    const date = new Date()
    date.setDate(date.getDate() + offset)
    if (date.getDay() === 6) return futureDate(offset)
  }
  throw new Error('unreachable: a Saturday occurs within any 7-day window')
}

/**
 * First upcoming date the server blocks for the given reason, or null within
 * the scan window. Probing the live API keeps holiday assertions from rotting
 * the moment a seeded date slips into the past.
 */
export async function firstDateWithBlockReason(
  request: APIRequestContext,
  roomId: string,
  reason: 'weekend' | 'holiday' | 'event',
  scanDays = 400,
): Promise<string | null> {
  for (let offset = 1; offset <= scanDays; offset += 1) {
    const date = futureDate(offset)
    const response = await request.get(`/api/availability?roomId=${roomId}&date=${date}`)
    const body = (await response.json()) as { ok: boolean; blockedReason: string | null }
    if (body.ok && body.blockedReason === reason) return date
  }
  return null
}
