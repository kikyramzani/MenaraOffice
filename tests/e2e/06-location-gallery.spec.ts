import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { gotoHydrated } from './helpers'

const EPIWALK = '/id/lokasi/epiwalk-kuningan'

test.describe('Galeri foto lokasi', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' } })

  test('menampilkan thumbnail galeri di halaman detail lokasi', async ({ page }) => {
    await gotoHydrated(page, EPIWALK)
    await expect(page.getByRole('heading', { name: 'Galeri Foto' })).toBeVisible()
    await expect(page.getByRole('button', { name: /^Buka foto/ })).toHaveCount(8)
  })

  test('lokasi tanpa foto tidak menampilkan section galeri', async ({ page }) => {
    // Bandung MTC has no photos in the source archive; the section must be
    // absent entirely rather than rendering an empty heading.
    await gotoHydrated(page, '/id/lokasi/mtc-bandung')
    await expect(page.getByRole('heading', { name: 'Galeri Foto' })).toHaveCount(0)
  })

  test('lightbox: buka, navigasi panah, tutup dengan Escape', async ({ page }) => {
    await gotoHydrated(page, EPIWALK)

    await page.getByRole('button', { name: 'Buka foto 1 dari 8' }).click()
    const dialog = page.getByRole('dialog', { name: 'Galeri Foto' })
    await expect(dialog).toBeVisible()
    await expect(dialog.getByText('Foto 1 dari 8')).toBeVisible()

    // Focus lands on Close so the dialog is operable without a pointer.
    await expect(page.getByRole('button', { name: 'Tutup galeri' })).toBeFocused()

    await page.keyboard.press('ArrowRight')
    await expect(dialog.getByText('Foto 2 dari 8')).toBeVisible()

    // Wrapping backwards from the first photo lands on the last.
    await page.keyboard.press('ArrowLeft')
    await page.keyboard.press('ArrowLeft')
    await expect(dialog.getByText('Foto 8 dari 8')).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    // Focus returns to the thumbnail that opened it, not the top of the page.
    await expect(page.getByRole('button', { name: 'Buka foto 8 dari 8' })).toBeFocused()
  })

  test('lightbox menahan fokus di dalam dialog', async ({ page }) => {
    await gotoHydrated(page, EPIWALK)
    await page.getByRole('button', { name: 'Buka foto 3 dari 8' }).click()

    const dialog = page.getByRole('dialog', { name: 'Galeri Foto' })
    for (let i = 0; i < 6; i += 1) {
      await page.keyboard.press('Tab')
      await expect(dialog.locator(':focus')).toHaveCount(1)
    }
  })

  test('tanpa pelanggaran axe critical/serious saat lightbox terbuka', async ({ page }) => {
    await gotoHydrated(page, EPIWALK)
    await page.getByRole('button', { name: 'Buka foto 1 dari 8' }).click()
    await expect(page.getByRole('dialog', { name: 'Galeri Foto' })).toBeVisible()

    const results = await new AxeBuilder({ page }).analyze()
    const severe = results.violations.filter(
      (violation) => violation.impact === 'critical' || violation.impact === 'serious',
    )
    expect(severe.map((violation) => `${violation.id}: ${violation.help}`)).toEqual([])
  })
})
