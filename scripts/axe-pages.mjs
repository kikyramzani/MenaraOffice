import { chromium } from '@playwright/test'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const axePath = require.resolve('axe-core/axe.min.js')

const browser = await chromium.launch()
const page = await browser.newPage()
for (const path of ['/id/virtual-office', '/id/kontak', '/id/lokasi']) {
  await page.goto(`http://localhost:3000${path}`)
  await page.waitForLoadState('networkidle')
  await page.addScriptTag({ path: axePath })
  const results = await page.evaluate(async () => await window.axe.run())
  console.log(`\n===== ${path}`)
  for (const v of results.violations.filter(v => ['critical','serious'].includes(v.impact))) {
    console.log('VIOLATION:', v.id, v.impact)
    for (const n of v.nodes.slice(0, 8)) {
      console.log('  target:', n.target.join(' '))
      console.log('  ', n.failureSummary?.split('\n')[1]?.trim())
    }
  }
}
await browser.close()
