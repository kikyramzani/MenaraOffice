import { chromium } from '@playwright/test'

const browser = await chromium.launch()

// Seed a booking so admin tables have long content rows.
const ctx = await browser.newContext()
const api = ctx.request
const d = new Date(); d.setDate(d.getDate() + 4)
const date = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
await api.post('http://localhost:3000/api/bookings', { data: {
  roomId: 'room-mk-a', date, startHour: 9, endHour: 11,
  name: 'Budi Overflow Panjang Sekali', phone: '081298765432',
  email: 'overlap-very-long-email@example.com', notes: 'Catatan panjang untuk menguji overflow tabel admin di layar sempit'
}})

async function measure(page, url) {
  await page.goto(url)
  await page.waitForLoadState('networkidle')
  const res = await page.evaluate(() => {
    const docW = document.documentElement.clientWidth
    const overflow = document.documentElement.scrollWidth - docW
    const out = []
    document.querySelectorAll('*').forEach(el => {
      const r = el.getBoundingClientRect()
      if (r.right > docW + 1) out.push(`${el.tagName}.${String(el.className).slice(0,90)} w=${Math.round(r.width)} right=${Math.round(r.right)}`)
    })
    return { overflow, out: out.slice(0, 12) }
  })
  console.log(`\n=== ${url} overflow=${res.overflow}`)
  res.out.forEach(o => console.log('  ', o))
}

const page = await ctx.newPage()
await page.setViewportSize({ width: 320, height: 800 })
await measure(page, 'http://localhost:3000/id/booking')

await page.goto('http://localhost:3000/admin/login')
await page.fill('#admin-email', 'admin@menaraoffice.id')
await page.fill('#admin-password', 'MenaraOffice2026!')
await page.click('button[type=submit]')
await page.waitForURL('**/admin')
await measure(page, 'http://localhost:3000/admin/booking')
await measure(page, 'http://localhost:3000/admin')
await browser.close()
