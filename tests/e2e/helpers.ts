import type { Page } from '@playwright/test'

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
