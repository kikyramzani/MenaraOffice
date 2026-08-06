import { test, expect } from '@playwright/test'
import { futureDate, gotoHydrated } from './helpers'

/**
 * Booking flow — runs serially: the second test depends on the slot created
 * by the first to prove the anti-double-booking guarantee end-to-end.
 */
test.describe.serial('Booking meeting room', () => {
  const targetDate = futureDate(3)
  const targetDay = Number(targetDate.split('-')[2])

  async function fillBookingUpToSlot(page: import('@playwright/test').Page) {
    await gotoHydrated(page, '/id/booking')

    // Step 1: lokasi pertama + ruangan pertama sudah terpilih default.
    await expect(page.getByLabel('Lokasi')).toBeVisible()
    await expect(page.getByLabel('Ruangan')).toBeVisible()

    // Step 2: pilih tanggal (maju bulan bila tanggal jatuh di bulan depan).
    const dayButton = page.getByRole('button', { name: String(targetDay), exact: true })
    if (!(await dayButton.isVisible().catch(() => false)) || !(await dayButton.isEnabled().catch(() => false))) {
      await page.getByRole('button', { name: 'Bulan berikutnya' }).click()
    }
    await page.getByRole('button', { name: String(targetDay), exact: true }).click()

    // Step 3: tunggu slot availability dimuat.
    await expect(page.getByRole('button', { name: '09:00' })).toBeVisible()
  }

  test('booking lengkap: kalender → slot → form → sukses', async ({ page }) => {
    await fillBookingUpToSlot(page)

    await page.getByRole('button', { name: '09:00' }).click()
    await page.getByLabel('Durasi').selectOption('2')

    await page.getByLabel('Nama lengkap').fill('Budi E2E')
    await page.getByLabel('Nomor WhatsApp').fill('081298765432')
    await page.getByLabel('Email', { exact: true }).fill('budi@example.com')
    await page.getByLabel(/Catatan/).fill('Booking dari automated test')

    // Estimasi biaya tampil sebelum submit.
    await expect(page.getByText('Estimasi biaya')).toBeVisible()

    await page.getByRole('button', { name: /Kirim Permintaan Booking/ }).click()
    await expect(page.getByText('Permintaan booking terkirim!')).toBeVisible()
    await expect(page.getByRole('link', { name: /Lanjutkan ke WhatsApp/ })).toBeVisible()
  })

  test('slot yang sudah dibooking tampil terisi dan tidak bisa dipilih', async ({ page }) => {
    await fillBookingUpToSlot(page)

    // 09:00 dan 10:00 kini terisi oleh booking test sebelumnya (pending ikut memblokir).
    await expect(page.getByRole('button', { name: '09:00' })).toBeDisabled()
    await expect(page.getByRole('button', { name: '10:00' })).toBeDisabled()
    await expect(page.getByRole('button', { name: '11:00' })).toBeEnabled()
  })

  test('API menolak booking yang tumpang tindih (409)', async ({ request }) => {
    const response = await request.post('/api/bookings', {
      data: {
        roomId: 'room-mk-a',
        date: targetDate,
        startHour: 9,
        endHour: 10,
        name: 'Penyusup Jadwal',
        phone: '081211112222',
        email: 'overlap@example.com',
        notes: '',
      },
    })
    expect(response.status()).toBe(409)
    const body = await response.json()
    expect(body.error).toBe('conflict')
  })

  test('API menolak tanggal lampau dan jam di luar operasional', async ({ request }) => {
    const past = await request.post('/api/bookings', {
      data: {
        roomId: 'room-mk-a',
        date: '2020-01-01',
        startHour: 9,
        endHour: 10,
        name: 'Masa Lalu',
        phone: '081211112222',
        email: 'past@example.com',
        notes: '',
      },
    })
    expect(past.status()).toBe(400)

    const outside = await request.post('/api/bookings', {
      data: {
        roomId: 'room-mk-a',
        date: futureDate(5),
        startHour: 22,
        endHour: 24,
        name: 'Lembur Malam',
        phone: '081211112222',
        email: 'late@example.com',
        notes: '',
      },
    })
    expect(outside.status()).toBe(400)
  })

  test('endpoint availability mengembalikan slot terisi', async ({ request }) => {
    const response = await request.get(`/api/availability?roomId=room-mk-a&date=${targetDate}`)
    expect(response.ok()).toBeTruthy()
    const body = await response.json()
    expect(body.booked).toEqual(
      expect.arrayContaining([expect.objectContaining({ startHour: 9, endHour: 11 })]),
    )
  })
})
