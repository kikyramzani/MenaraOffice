import { test, expect } from '@playwright/test'
import { adminLogin, ADMIN_EMAIL, firstBookableDate, gotoHydrated } from './helpers'

test.describe.serial('Panel admin', () => {
  test('halaman admin tanpa sesi diarahkan ke login', async ({ page }) => {
    await page.goto('/admin')
    await expect(page).toHaveURL(/\/admin\/login/)
  })

  test('login gagal menampilkan pesan error', async ({ page }) => {
    await page.goto('/admin/login')
    await page.getByLabel('Email').fill(ADMIN_EMAIL)
    await page.getByLabel('Password').fill('password-salah')
    await page.getByRole('button', { name: 'Masuk' }).click()
    await expect(page.getByText('Email atau password salah.')).toBeVisible()
  })

  test('login sukses menuju dashboard dengan statistik', async ({ page }) => {
    await adminLogin(page)
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
    await expect(page.getByText('Leads baru')).toBeVisible()
    await expect(page.getByText('Booking menunggu')).toBeVisible()
  })

  test('leads dari form kontak tampil dan bisa diubah statusnya', async ({ page }) => {
    await adminLogin(page)
    await page.goto('/admin/leads')
    // Lead "Tester E2E" dibuat oleh public.spec.ts yang berjalan lebih dulu.
    const row = page.locator('tr', { hasText: 'Tester E2E' }).first()
    await expect(row).toBeVisible()
    await row.getByRole('button', { name: 'Tandai dihubungi' }).click()
    await expect(page.locator('tr', { hasText: 'Tester E2E' }).first().getByText('Dihubungi')).toBeVisible()
  })

  test('booking bisa dikonfirmasi dari panel', async ({ page }) => {
    await adminLogin(page)
    await page.goto('/admin/booking')
    const row = page.locator('tr', { hasText: 'Budi E2E' }).first()
    await expect(row).toBeVisible()
    await row.getByRole('button', { name: 'Konfirmasi' }).click()
    await expect(page.locator('tr', { hasText: 'Budi E2E' }).first().getByText('Terkonfirmasi')).toBeVisible()
  })

  test('edit harga layanan langsung tampil di halaman publik', async ({ page }) => {
    await adminLogin(page)
    await page.goto('/admin/layanan')
    await page.locator('div', { hasText: 'Virtual Office' }).getByRole('link', { name: 'Edit' }).first().click()
    await expect(page.getByRole('heading', { name: /Edit: Virtual Office/ })).toBeVisible()

    const priceInput = page.locator('input[name="tier_0_price"]')
    await priceInput.fill('4500000')
    await page.getByRole('button', { name: 'Simpan Perubahan' }).click()
    await page.waitForURL('**/admin/layanan')

    // Verifikasi di halaman publik.
    await page.goto('/id/virtual-office')
    await expect(page.locator('#pricing')).toContainText('4.5 Juta')

    // Kembalikan ke Rp 4 Juta agar konsisten dengan konten produksi.
    await page.goto('/admin/layanan')
    await page.locator('div', { hasText: 'Virtual Office' }).getByRole('link', { name: 'Edit' }).first().click()
    await page.locator('input[name="tier_0_price"]').fill('4000000')
    await page.getByRole('button', { name: 'Simpan Perubahan' }).click()
    await page.waitForURL('**/admin/layanan')
    await page.goto('/id/virtual-office')
    await expect(page.locator('#pricing')).toContainText('4 Juta')
  })

  test('tambah testimoni lalu tampil di beranda', async ({ page }) => {
    await adminLogin(page)
    await page.goto('/admin/testimoni')
    await page.getByLabel('Nama klien').fill('Klien Uji')
    await page.getByLabel('Jabatan / usaha').fill('Founder, Usaha Uji')
    await page.getByLabel('Kutipan (Indonesia)').fill('Pelayanan Menara Office sangat membantu bisnis kami.')
    await page.getByRole('button', { name: 'Tambah' }).click()
    await expect(page.getByText('Klien Uji')).toBeVisible()

    await page.goto('/id')
    await expect(page.getByText('Pelayanan Menara Office sangat membantu')).toBeVisible()

    // Bersihkan: hapus testimoni uji.
    await page.goto('/admin/testimoni')
    await page
      .locator('div', { hasText: 'Klien Uji' })
      .getByRole('button', { name: 'Hapus' })
      .first()
      .click()
  })

  test('tambah partner lalu tampil di marquee beranda', async ({ page }) => {
    await adminLogin(page)
    await page.goto('/admin/partner')
    await page.getByLabel('Nama partner').fill('Partner Uji')
    await page.getByLabel('URL logo').fill('/images/partners/kji.webp')
    await page.getByRole('button', { name: 'Tambah' }).click()
    await expect(page.getByText('Partner Uji')).toBeVisible()

    await page.goto('/id')
    const logos = page.locator('section[aria-labelledby="partners-heading"] img[alt="Partner Uji"]')
    await expect(logos.first()).toBeVisible()

    // Bersihkan: hapus partner uji agar marquee produksi kembali ke 3 logo asli.
    await page.goto('/admin/partner')
    await page
      .locator('div', { hasText: 'Partner Uji' })
      .getByRole('button', { name: 'Hapus' })
      .first()
      .click()
  })

  test('halaman pengaturan, ruangan, lokasi, blog dapat diakses', async ({ page }) => {
    await adminLogin(page)
    for (const path of [
      '/admin/pengaturan',
      '/admin/ruangan',
      '/admin/lokasi',
      '/admin/blog',
      '/admin/partner',
      '/admin/tanggal-libur',
    ]) {
      await page.goto(path)
      await expect(page.locator('h1')).toBeVisible()
    }
  })

  test('logout mengakhiri sesi', async ({ page }) => {
    await adminLogin(page)
    await page.getByRole('button', { name: 'Keluar' }).click()
    await page.waitForURL('**/admin/login')
    await page.goto('/admin')
    await expect(page).toHaveURL(/\/admin\/login/)
  })

  test('admin memblokir tanggal dan kalender publik langsung menonaktifkannya', async ({
    page,
    request,
  }) => {
    // minDaysAhead jauh di depan agar tidak bertabrakan dengan tanggal yang
    // dipakai suite booking (02-*), yang berjalan lebih dulu.
    const target = await firstBookableDate(request, 'room-mk-a', 40)
    const targetDay = Number(target.split('-')[2])

    await adminLogin(page)
    await page.goto('/admin/tanggal-libur')
    await page.getByLabel('Tanggal', { exact: true }).fill(target)
    await page.getByLabel('Keterangan (Indonesia)').fill('Acara internal E2E')
    await page.getByRole('button', { name: 'Tambah' }).click()
    await expect(page.getByText('Acara internal E2E')).toBeVisible()

    // Server sekarang harus menolaknya.
    const response = await request.get(`/api/availability?roomId=room-mk-a&date=${target}`)
    expect((await response.json()).blockedReason).toBe('event')

    await gotoHydrated(page, '/id/booking')
    await expect(page.getByRole('button', { name: String(targetDay), exact: true })).toBeDisabled()

    // Bersihkan agar run berikutnya kembali dari kondisi yang sama.
    await page.goto('/admin/tanggal-libur')
    await page
      .locator('div', { hasText: 'Acara internal E2E' })
      .getByRole('button', { name: 'Hapus' })
      .last()
      .click()
  })
})
