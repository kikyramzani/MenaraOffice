/**
 * Renders /company-profile to an A4 portrait PDF.
 *
 * The document is a real page in the app, so it reads live data from the store
 * and self-hosts Plus Jakarta Sans — no network, no font substitution. Run the
 * site first (`npm run start` or `npm run dev`), then `npm run profile:pdf`.
 */
import { mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

import { chromium } from '@playwright/test'

const BASE_URL = process.env.PROFILE_BASE_URL ?? 'http://localhost:3000'
const PAGE_URL = `${BASE_URL}/company-profile`
const OUT_PATH = resolve('assets/company-profile/Menara-Office-Company-Profile-ID.pdf')

async function assertServerIsUp() {
  try {
    const response = await fetch(PAGE_URL, { method: 'HEAD' })
    if (response.ok) return
    throw new Error(`HTTP ${response.status}`)
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error)
    throw new Error(
      `Tidak bisa membuka ${PAGE_URL} (${reason}).\n` +
        'Jalankan servernya dulu: `npm run build && npm run start` (atau `npm run dev`).',
    )
  }
}

/**
 * A missing photo prints as a blank frame rather than an error, so the run is
 * failed here instead. The usual cause is `next start` having cached the
 * `public/` listing before the print derivatives were written.
 */
async function assertEveryPhotoLoaded(page) {
  const broken = await page.evaluate(() =>
    Array.from(document.images)
      .filter((image) => image.naturalWidth === 0)
      .map((image) => image.getAttribute('src') ?? '(tanpa src)'),
  )

  if (!broken.length) return

  const unique = [...new Set(broken)]
  throw new Error(
    `${broken.length} gambar gagal dimuat:\n  ${unique.join('\n  ')}\n\n` +
      'Jalankan `npm run profile:photos` lalu RESTART servernya — `next start` ' +
      'membaca daftar isi public/ sekali saat start, jadi file yang dibuat ' +
      'setelahnya tidak ikut terlayani.',
  )
}

/**
 * Overflow on a fixed-size sheet is silent: the text simply prints on top of
 * the running footer or the next element. Each sheet is measured against its
 * own footer so a layout change can never quietly ship a damaged page.
 */
async function assertNothingOverflows(page) {
  const collisions = await page.evaluate(() => {
    const found = []

    document.querySelectorAll('.print-page').forEach((sheet, index) => {
      const sheetBox = sheet.getBoundingClientRect()
      const foot = sheet.querySelector('.page-foot')
      const limit = foot ? foot.getBoundingClientRect().top : sheetBox.bottom

      sheet.querySelectorAll('.page-body *').forEach((element) => {
        const box = element.getBoundingClientRect()
        if (box.height === 0) return
        if (box.bottom > limit + 0.5 || box.right > sheetBox.right + 0.5) {
          found.push(`halaman ${index + 1}: "${(element.textContent ?? '').trim().slice(0, 50)}"`)
        }
      })
    })

    return [...new Set(found)]
  })

  if (!collisions.length) return

  throw new Error(`Konten meluber dari halaman:\n  ${collisions.join('\n  ')}`)
}

async function main() {
  await assertServerIsUp()
  await mkdir(dirname(OUT_PATH), { recursive: true })

  const browser = await chromium.launch()

  try {
    const page = await browser.newPage()
    await page.goto(PAGE_URL, { waitUntil: 'networkidle' })

    // Every photo must be decoded before printing, otherwise Chromium prints
    // the frame while the image is still blank.
    await page.evaluate(() =>
      Promise.all(
        Array.from(document.images)
          .filter((image) => !image.complete)
          .map((image) => image.decode().catch(() => undefined)),
      ),
    )
    await page.evaluate(() => document.fonts.ready)

    await assertEveryPhotoLoaded(page)
    await assertNothingOverflows(page)
    await page.emulateMedia({ media: 'print' })

    await page.pdf({
      path: OUT_PATH,
      format: 'A4',
      landscape: false,
      printBackground: true,
      preferCSSPageSize: true,
    })

    const sheets = await page.locator('.print-page').count()
    console.log(`PDF tersimpan: ${OUT_PATH} (${sheets} halaman A4 portrait)`)
  } finally {
    await browser.close()
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
