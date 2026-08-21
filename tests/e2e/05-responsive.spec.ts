import { test, expect } from '@playwright/test'
import { adminLogin, gotoHydrated } from './helpers'

const BREAKPOINTS = [320, 375, 768, 1024, 1440, 1920] as const
const PAGES = ['/id', '/id/virtual-office', '/id/booking', '/id/lokasi', '/id/kontak', '/id/promo'] as const

test.describe('Responsive tanpa overflow horizontal', () => {
  for (const width of BREAKPOINTS) {
    test(`publik @ ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 })
      for (const path of PAGES) {
        await page.goto(path)
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        )
        expect(overflow, `${path} @ ${width}px meluap ${overflow}px`).toBeLessThanOrEqual(1)
      }
      await page.goto('/id')
      await page.screenshot({ path: `screenshots/public-${width}.png`, fullPage: false })
    })

    test(`admin @ ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 })
      await adminLogin(page)
      for (const path of ['/admin', '/admin/booking', '/admin/layanan']) {
        await page.goto(path)
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        )
        expect(overflow, `${path} @ ${width}px meluap ${overflow}px`).toBeLessThanOrEqual(1)
      }
      await page.screenshot({ path: `screenshots/admin-${width}.png`, fullPage: false })
    })
  }

  test('menu mobile berfungsi', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 })
    await gotoHydrated(page, '/id')
    await page.getByRole('button', { name: 'Menu' }).click()
    await expect(page.getByRole('navigation', { name: 'Mobile navigation' })).toBeVisible()
    await page.getByRole('navigation', { name: 'Mobile navigation' }).getByRole('link', { name: 'Lokasi' }).click()
    await expect(page).toHaveURL(/\/id\/lokasi/)
  })
})
