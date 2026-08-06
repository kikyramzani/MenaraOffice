import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { adminLogin } from './helpers'

const PUBLIC_PAGES = ['/id', '/id/virtual-office', '/id/booking', '/id/kontak', '/id/lokasi']

test.describe('Aksesibilitas (axe-core)', () => {
  // Reveal animations mid-transition make contrast checks non-deterministic;
  // reduced motion renders everything in its final state immediately.
  test.use({ contextOptions: { reducedMotion: 'reduce' } })

  for (const path of PUBLIC_PAGES) {
    test(`tanpa pelanggaran critical/serious: ${path}`, async ({ page }) => {
      await page.goto(path)
      await page.waitForLoadState('networkidle')
      const results = await new AxeBuilder({ page }).analyze()
      const severe = results.violations.filter(
        (violation) => violation.impact === 'critical' || violation.impact === 'serious',
      )
      expect(
        severe.map((violation) => `${violation.id}: ${violation.help}`),
      ).toEqual([])
    })
  }

  test('tanpa pelanggaran critical/serious: admin dashboard', async ({ page }) => {
    await adminLogin(page)
    const results = await new AxeBuilder({ page }).analyze()
    const severe = results.violations.filter(
      (violation) => violation.impact === 'critical' || violation.impact === 'serious',
    )
    expect(severe.map((violation) => `${violation.id}: ${violation.help}`)).toEqual([])
  })

  test('navigasi keyboard: skip link dan menu utama', async ({ page }) => {
    await page.goto('/id')
    await page.keyboard.press('Tab')
    await expect(page.getByRole('link', { name: 'Lewati ke konten' })).toBeFocused()
  })
})
