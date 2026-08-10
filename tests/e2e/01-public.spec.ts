import { test, expect } from '@playwright/test'
import { gotoHydrated } from './helpers'

test.describe('Halaman publik', () => {
  test('beranda memuat hero, harga baru, dan navigasi', async ({ page }) => {
    await page.goto('/id')
    await expect(page.locator('h1')).toBeVisible()
    // Harga revisi: Virtual Office start from Rp 4 Juta di kartu hero.
    await expect(page.getByText('Rp 4 Juta').first()).toBeVisible()
    await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible()
  })

  test('beranda menampilkan marquee Our Partner tanpa celah kosong', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1000 })
    await page.goto('/id')
    await expect(page.getByText('Our Partner')).toBeVisible()

    const track = page.locator('.marquee-track')
    const logos = track.locator('img')
    // With only 3 partners the lap repeats until it clears the min-item floor,
    // then doubles for the seamless CSS loop — must stay wider than any
    // realistic viewport so the loop never shows a blank gap.
    await expect(logos.first()).toBeVisible()
    const logoCount = await logos.count()
    expect(logoCount).toBeGreaterThanOrEqual(28)
    await expect(logos.first()).toHaveAttribute('alt', /RAH & Partners|Mangatur Nainggolan Law Firm|KJI/)

    const trackWidth = await track.evaluate((el) => el.scrollWidth)
    const viewportWidth = await page.evaluate(() => window.innerWidth)
    // Half the track (one lap) must exceed the viewport, otherwise the
    // translateX(-50%) loop reaches blank space before wrapping around.
    expect(trackWidth / 2).toBeGreaterThan(viewportWidth)
  })

  test('redirect / ke locale default id', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/id$/)
  })

  test('halaman virtual office menampilkan paket Basic 4 Juta dan Business 6 Juta', async ({ page }) => {
    await page.goto('/id/virtual-office')
    await expect(page.locator('h1')).toContainText('Virtual Office')
    await expect(page.locator('#pricing')).toContainText('4 Juta')
    await expect(page.locator('#pricing')).toContainText('Basic')
    await expect(page.locator('#pricing')).toContainText('6 Juta')
    await expect(page.locator('#pricing')).toContainText('Business')
    await expect(page.locator('#pricing')).toContainText('Meeting Room Semua Cabang')
    await expect(page.locator('#pricing').getByRole('link', { name: 'Pilih Paket' })).toHaveCount(2)
  })

  test('halaman pendirian PT menampilkan satu paket PT 6 Juta', async ({ page }) => {
    await page.goto('/id/pendirian-pt')
    await expect(page.locator('#pricing')).toContainText('6 Juta')
    await expect(page.locator('#pricing').getByRole('link', { name: 'Pilih Paket' })).toHaveCount(1)
  })

  test('halaman serviced office menampilkan harga 4 Juta dan kapasitas per lokasi', async ({ page }) => {
    await page.goto('/id/serviced-office')
    await expect(page.locator('#pricing')).toContainText('4 Juta')

    const capacity = page.locator('section[aria-labelledby="capacity-heading"]')
    await expect(capacity.getByText('Kapasitas Tersedia per Lokasi')).toBeVisible()
    // Menara Karya: 2, 3, 4 pax — Epiwalk & Pejaten: 4 pax — Bekasi: 3 & 4 pax.
    const menaraKarya = capacity.locator('div', { hasText: 'Menara Karya Tower' }).last()
    await expect(menaraKarya.getByText('2 pax')).toBeVisible()
    await expect(menaraKarya.getByText('3 pax')).toBeVisible()
    await expect(menaraKarya.getByText('4 pax')).toBeVisible()
    // Cempaka Mas & Bandung have no serviced-office capacity data, so they must not appear here.
    await expect(capacity.getByText('Ruko Mega Grosir Cempaka Mas')).toHaveCount(0)
  })

  test('halaman meeting room hanya 1 paket 100rb/jam, link booking, dan kapasitas per lokasi', async ({ page }) => {
    await page.goto('/id/meeting-room')
    await expect(page.locator('#pricing')).toContainText('100rb')
    await expect(page.locator('#pricing').getByRole('link', { name: 'Pilih Paket' })).toHaveCount(1)
    await expect(page.getByRole('link', { name: /Booking Meeting Room|Booking Ruang Rapat/ }).first()).toBeVisible()

    const capacity = page.locator('section[aria-labelledby="capacity-heading"]')
    await expect(capacity.getByText('Ruang Rapat Tersedia per Lokasi')).toBeVisible()
    // 6 pax: Menara Karya, Epiwalk, Cempaka Mas — 8 pax: Pejaten (Wisma Perkasa), Bekasi.
    await expect(capacity.locator('div', { hasText: 'Menara Karya Tower' }).last().getByText('6 pax')).toBeVisible()
    await expect(capacity.locator('div', { hasText: 'Epiwalk Rasuna Epicentrum' }).last().getByText('6 pax')).toBeVisible()
    await expect(capacity.locator('div', { hasText: 'Ruko Mega Grosir Cempaka Mas' }).last().getByText('6 pax')).toBeVisible()
    await expect(capacity.locator('div', { hasText: 'Wisma Perkasa' }).last().getByText('8 pax')).toBeVisible()
    await expect(capacity.locator('div', { hasText: 'Ruko Celebration Boulevard' }).last().getByText('8 pax')).toBeVisible()
  })

  test('ganti bahasa ke English mengubah konten', async ({ page }) => {
    await gotoHydrated(page, '/id')
    await page.getByRole('button', { name: 'English' }).click()
    await expect(page).toHaveURL(/\/en$/)
    await expect(page.locator('h1')).toContainText('professional office')
  })

  test('halaman lokasi menampilkan 6 lokasi', async ({ page }) => {
    await page.goto('/id/lokasi')
    const cards = page.locator('article')
    await expect(cards).toHaveCount(6)
    await expect(page.getByText('Menara Karya Tower').first()).toBeVisible()
  })

  test('detail lokasi menampilkan peta dan fasilitas', async ({ page }) => {
    await page.goto('/id/lokasi/menara-karya-kuningan')
    await expect(page.locator('h1')).toContainText('Menara Karya')
    await expect(page.locator('iframe[title^="Peta"]')).toBeVisible()
  })

  test('blog tips bisnis: daftar dan detail artikel', async ({ page }) => {
    await page.goto('/id/tips-bisnis')
    const firstArticle = page.locator('article h2 a').first()
    await expect(firstArticle).toBeVisible()
    await firstArticle.click()
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('.prose-mo')).toBeVisible()
  })

  test('halaman 404 untuk slug tidak dikenal', async ({ page }) => {
    const response = await page.goto('/id/layanan-tidak-ada')
    expect(response?.status()).toBe(404)
    await expect(page.getByText('404')).toBeVisible()
  })

  test('form kontak: validasi lalu submit sukses', async ({ page }) => {
    await gotoHydrated(page, '/id/kontak')

    // Submit kosong → error validasi client-side muncul, tidak ada request.
    await page.getByRole('button', { name: /Kirim Pesan/ }).click()
    await expect(page.getByRole('alert').first()).toBeVisible()

    await page.getByLabel('Nama lengkap').fill('Tester E2E')
    await page.getByLabel('Nomor WhatsApp').fill('081234567890')
    await page.getByLabel('Email', { exact: true }).fill('tester@example.com')
    await page.getByLabel('Layanan yang diminati').selectOption({ index: 1 })
    await page.getByLabel('Pesan').fill('Saya ingin bertanya tentang paket virtual office.')
    await page.getByRole('button', { name: /Kirim Pesan/ }).click()

    await expect(page.getByText('Pesan terkirim!')).toBeVisible()
  })

  test('footer newsletter tersimpan sebagai lead', async ({ page }) => {
    await gotoHydrated(page, '/id')
    const email = `news-${Date.now()}@example.com`
    await page.getByPlaceholder('Alamat email Anda').fill(email)
    await page.getByRole('button', { name: 'Berlangganan' }).click()
    await expect(page.getByText('Terima kasih! Anda sudah terdaftar.')).toBeVisible()
  })
})
