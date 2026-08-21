import { test, expect } from '@playwright/test'
import { gotoHydrated } from './helpers'

test.describe('Halaman publik', () => {
  test('beranda memuat hero, harga baru, dan navigasi', async ({ page }) => {
    await page.goto('/id')
    await expect(page.locator('h1')).toContainText('Solusi kantor lengkap untuk bisnis Anda')
    // Harga revisi: Virtual Office start from Rp 4 Juta di kartu hero, tarif tahunan.
    await expect(page.getByText('Rp 4 Juta').first()).toBeVisible()
    await expect(page.locator('section[aria-labelledby="hero-heading"]').getByText('/thn')).toBeVisible()
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

  test('halaman virtual office: Basic 4 Juta & Business 6 Juta, keduanya per tahun', async ({ page }) => {
    await page.goto('/id/virtual-office')
    await expect(page.locator('h1')).toContainText('Virtual Office')
    await expect(page.locator('#pricing')).toContainText('4 Juta')
    await expect(page.locator('#pricing')).toContainText('Basic')
    await expect(page.locator('#pricing')).toContainText('6 Juta')
    await expect(page.locator('#pricing')).toContainText('Business')
    await expect(page.locator('#pricing')).toContainText('Free meeting room 120 jam/tahun')
    // Harga VO adalah tarif tahunan, bukan bulanan.
    await expect(page.locator('#pricing').getByText('/tahun', { exact: true })).toHaveCount(2)
    await expect(page.locator('#pricing').getByText('/bulan', { exact: true })).toHaveCount(0)
    await expect(page.locator('#pricing').getByRole('link', { name: 'Pilih Paket' })).toHaveCount(2)
  })

  test('halaman pendirian: PT/CV/Firma 6 Juta plus Yayasan tanpa harga', async ({ page }) => {
    await page.goto('/id/pendirian-pt')
    const pricing = page.locator('#pricing')
    await expect(pricing).toContainText('6 Juta')
    await expect(pricing).toContainText('PT/CV/Firma')
    await expect(pricing).toContainText('Start From')
    await expect(pricing.getByRole('link', { name: 'Pilih Paket' })).toHaveCount(1)

    // Yayasan dihitung per kasus: tidak ada angka, tombolnya mengajak konsultasi.
    await expect(pricing).toContainText('Yayasan')
    await expect(pricing).toContainText('Konsultasi Dahulu')
    await expect(pricing).toContainText('Hubungi Kami')
    await expect(pricing.getByRole('link', { name: 'Konsultasi via WhatsApp' })).toHaveCount(1)
  })

  test('halaman legal consultant tidak punya kartu harga, hanya ajakan konsultasi', async ({ page }) => {
    await page.goto('/id/legal-consultant')
    const pricing = page.locator('#pricing')
    await expect(pricing).toContainText('Biaya menyesuaikan kebutuhan Anda')
    await expect(pricing.getByRole('link', { name: 'Konsultasi via WhatsApp' })).toHaveCount(1)
    await expect(pricing.getByRole('link', { name: 'Pilih Paket' })).toHaveCount(0)
  })

  test('halaman serviced office menampilkan 3 tier per pax dan kapasitas per lokasi', async ({ page }) => {
    await page.goto('/id/serviced-office')
    const pricing = page.locator('#pricing')
    // 2 pax 4 jt, 3 pax 5 jt, 4 pax 6 jt — semuanya bulanan.
    await expect(pricing).toContainText('2 Pax')
    await expect(pricing).toContainText('3 Pax')
    await expect(pricing).toContainText('4 Pax')
    await expect(pricing).toContainText('4 Juta')
    await expect(pricing).toContainText('5 Juta')
    await expect(pricing).toContainText('6 Juta')
    await expect(pricing.getByText('/bulan', { exact: true })).toHaveCount(3)
    await expect(pricing.getByRole('link', { name: 'Pilih Paket' })).toHaveCount(3)
    // Bonus yang dijanjikan di tiap tier.
    await expect(pricing).toContainText('Free meeting room 12 jam/bulan')
    await expect(pricing).toContainText('Free pantry')

    const capacity = page.locator('section[aria-labelledby="capacity-heading"]')
    await expect(capacity.getByText('Kapasitas Tersedia per Lokasi')).toBeVisible()
    // Menara Karya & Cempaka Mas: 2, 3, 4 pax — Epiwalk & Pejaten: 4 pax — Bekasi: 3 & 4 pax.
    const menaraKarya = capacity.locator('div', { hasText: 'Menara Karya Tower' }).last()
    await expect(menaraKarya.getByText('2 pax')).toBeVisible()
    await expect(menaraKarya.getByText('3 pax')).toBeVisible()
    await expect(menaraKarya.getByText('4 pax')).toBeVisible()
    const cempaka = capacity.locator('div', { hasText: 'Ruko Mega Grosir Cempaka Mas' }).last()
    await expect(cempaka.getByText('2 pax')).toBeVisible()
    await expect(cempaka.getByText('4 pax')).toBeVisible()
  })

  test('halaman meeting room hanya 1 paket 150rb/jam, link booking, dan kapasitas per lokasi', async ({ page }) => {
    await page.goto('/id/meeting-room')
    await expect(page.locator('#pricing')).toContainText('150rb')
    await expect(page.locator('#pricing').getByRole('link', { name: 'Pilih Paket' })).toHaveCount(1)
    await expect(page.getByRole('link', { name: /Booking Meeting Room|Booking Ruang Rapat/ }).first()).toBeVisible()

    const capacity = page.locator('section[aria-labelledby="capacity-heading"]')
    await expect(capacity.getByText('Ruang Rapat Tersedia per Lokasi')).toBeVisible()
    // 6 pax: Menara Karya — 5 pax: Epiwalk — 8 pax: Cempaka Mas, Pejaten (Wisma Perkasa), Bekasi.
    await expect(capacity.locator('div', { hasText: 'Menara Karya Tower' }).last().getByText('6 pax')).toBeVisible()
    await expect(capacity.locator('div', { hasText: 'Epiwalk Rasuna Epicentrum' }).last().getByText('5 pax')).toBeVisible()
    await expect(capacity.locator('div', { hasText: 'Ruko Mega Grosir Cempaka Mas' }).last().getByText('8 pax')).toBeVisible()
    await expect(capacity.locator('div', { hasText: 'Wisma Perkasa' }).last().getByText('8 pax')).toBeVisible()
    await expect(capacity.locator('div', { hasText: 'Ruko Celebration Boulevard' }).last().getByText('8 pax')).toBeVisible()
  })

  test('ganti bahasa ke English mengubah konten', async ({ page }) => {
    await gotoHydrated(page, '/id')
    await page.getByRole('button', { name: 'English' }).click()
    await expect(page).toHaveURL(/\/en$/)
    await expect(page.locator('h1')).toContainText('Complete office solutions')
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

  test('footer hanya menampilkan email publik, bukan kotak masuk internal', async ({ page }) => {
    await page.goto('/id')
    const footer = page.locator('footer')
    await expect(footer.getByRole('link', { name: 'marketing@menaraoffice.id' })).toBeVisible()
    // Gmail adalah alamat notifikasi internal dan tidak boleh bocor ke publik.
    await expect(footer.getByText('menaraoffice.id@gmail.com')).toHaveCount(0)
    await expect(footer.getByText('info@menaraoffice.id')).toHaveCount(0)
  })

  test('chat umum memakai Admin 1, footer memuat kedua nomor berlabel', async ({ page }) => {
    await page.goto('/id')

    // Di luar footer, setiap tautan WhatsApp harus mengarah ke Admin 1.
    const outsideFooter = page.locator('a[href*="wa.me"]:not(footer a)')
    const count = await outsideFooter.count()
    expect(count).toBeGreaterThan(0)
    for (let index = 0; index < count; index += 1) {
      const href = await outsideFooter.nth(index).getAttribute('href')
      expect(href).toContain('wa.me/6282262981118')
    }

    const footer = page.locator('footer')
    await expect(footer.locator('a[href*="wa.me/6282262981118"]')).toHaveCount(1)
    await expect(footer.locator('a[href*="wa.me/6287752556600"]')).toHaveCount(1)
    await expect(footer).toContainText('(Admin 1)')
    await expect(footer).toContainText('(Admin 2)')
  })

  test('halaman kontak menampilkan dua nomor dan satu email publik', async ({ page }) => {
    await page.goto('/id/kontak')
    const main = page.locator('section').first()
    await expect(main).toContainText('+6282262981118')
    await expect(main).toContainText('+6287752556600')
    await expect(main).toContainText('marketing@menaraoffice.id')
    await expect(main.getByText('menaraoffice.id@gmail.com')).toHaveCount(0)
  })

  test('menu Promo tampil di header desktop dan drawer mobile', async ({ page }) => {
    await gotoHydrated(page, '/id')
    const desktopNav = page.getByRole('navigation', { name: 'Main navigation' })
    await expect(desktopNav.getByRole('link', { name: 'Promo' })).toHaveAttribute('href', '/id/promo')

    await page.setViewportSize({ width: 390, height: 844 })
    await page.getByRole('button', { name: 'Menu' }).click()
    const mobileNav = page.getByRole('navigation', { name: 'Mobile navigation' })
    await expect(mobileNav.getByRole('link', { name: 'Promo' })).toHaveAttribute('href', '/id/promo')
  })

  test('beranda menampilkan promo merdeka di antara hero dan partner', async ({ page }) => {
    await page.goto('/id')
    const promo = page.locator('section[aria-labelledby="promo-heading"]')
    await expect(promo).toBeVisible()
    await expect(promo).toContainText('Promo Merdeka')
    await expect(promo).toContainText('Diskon 50%')
    await expect(promo).toContainText('Rp 2.000.000')
    await expect(promo.getByText('Rp 4.000.000')).toBeVisible()
    await expect(promo).toContainText('31 Agustus 2026')

    // Urutan DOM: hero → promo → partner.
    const order = await page.evaluate(() => {
      const sections = Array.from(document.querySelectorAll('section'))
      const labelled = (id: string) => sections.findIndex((s) => s.getAttribute('aria-labelledby') === id)
      return { hero: labelled('hero-heading'), promo: labelled('promo-heading'), partners: labelled('partners-heading') }
    })
    expect(order.hero).toBeLessThan(order.promo)
    expect(order.promo).toBeLessThan(order.partners)
  })

  test('halaman promo merender kartu promo merdeka', async ({ page }) => {
    await page.goto('/id/promo')
    await expect(page.locator('h1')).toContainText('Penawaran yang sedang berjalan')
    const card = page.locator('article').first()
    await expect(card).toContainText('Promo Merdeka')
    await expect(card).toContainText('Rp 2.000.000')
    await expect(card).toContainText('Zonasi perkantoran resmi')
    await expect(card.getByRole('link', { name: 'Ambil Promo Ini' })).toHaveAttribute(
      'href',
      /wa\.me\/6282262981118/,
    )
  })
})
