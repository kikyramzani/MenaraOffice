import { chromium } from '@playwright/test'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const axePath = require.resolve('axe-core/axe.min.js')

const browser = await chromium.launch()
const page = await browser.newPage()
await page.goto('http://localhost:3000/id')
await page.addScriptTag({ path: axePath })
const results = await page.evaluate(async () => await window.axe.run())
for (const v of results.violations.filter(v => ['critical','serious'].includes(v.impact))) {
  console.log('VIOLATION:', v.id, v.impact)
  for (const n of v.nodes.slice(0, 10)) {
    console.log('  target:', n.target.join(' '), '\n  summary:', n.failureSummary?.split('\n').slice(0,3).join(' '))
  }
}

// admin overflow debug at 320px
const page2 = await browser.newPage({ viewport: { width: 320, height: 800 } })
await page2.goto('http://localhost:3000/admin/login')
await page2.fill('#admin-email', 'admin@menaraoffice.id')
await page2.fill('#admin-password', 'MenaraOffice2026!')
await page2.click('button[type=submit]')
await page2.waitForURL('**/admin')
const wide = await page2.evaluate(() => {
  const out = []
  const docW = document.documentElement.clientWidth
  document.querySelectorAll('*').forEach(el => {
    const r = el.getBoundingClientRect()
    if (r.right > docW + 1 || r.width > docW + 1) out.push(`${el.tagName}.${String(el.className).slice(0,80)} w=${Math.round(r.width)} right=${Math.round(r.right)}`)
  })
  return out.slice(0, 15)
})
console.log('OVERFLOW ELEMENTS @320 /admin:')
wide.forEach(w => console.log(' ', w))
await browser.close()
