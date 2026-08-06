/**
 * Downloads image assets from the legacy WordPress site (menaraoffice.id),
 * optimises them with sharp, and maps the key ones onto the canonical
 * filenames the new site references.
 *
 * Usage: npm run scrape:assets
 */
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const ORIGIN = 'https://menaraoffice.id'
const OUT_DIR = path.join(process.cwd(), 'public', 'images')
const UA = 'Mozilla/5.0 (compatible; MenaraOfficeMigration/1.0)'

/** Canonical targets: first regex that matches a scraped filename wins. */
const CANONICAL = [
  { pattern: /logo-mo/i, out: 'logo.png', type: 'png', width: 640 },
  { pattern: /mo-white/i, out: 'logo-white.png', type: 'png', width: 640 },
  { pattern: /menara-karya/i, out: 'locations/menara-karya.webp', type: 'webp', width: 1600 },
  { pattern: /perkasa/i, out: 'locations/wisma-perkasa.webp', type: 'webp', width: 1600 },
  { pattern: /epiwalk/i, out: 'locations/epiwalk.webp', type: 'webp', width: 1600 },
  { pattern: /cempaka/i, out: 'locations/cempaka-mas.webp', type: 'webp', width: 1600 },
  { pattern: /bekasi/i, out: 'locations/bekasi.webp', type: 'webp', width: 1600 },
  { pattern: /bandung/i, out: 'locations/bandung-mtc.webp', type: 'webp', width: 1600 },
]

async function fetchText(url) {
  const res = await fetch(url, { headers: { 'user-agent': UA } })
  if (!res.ok) throw new Error(`GET ${url} → ${res.status}`)
  return res.text()
}

async function fetchBuffer(url) {
  const res = await fetch(url, { headers: { 'user-agent': UA } })
  if (!res.ok) throw new Error(`GET ${url} → ${res.status}`)
  return Buffer.from(await res.arrayBuffer())
}

function extractImageUrls(html) {
  const urls = new Set()
  const attrRe = /(?:src|href|data-src|data-bg)=["']([^"']+wp-content\/uploads[^"'\s]+)["']/gi
  const srcsetRe = /srcset=["']([^"']+)["']/gi

  for (const match of html.matchAll(attrRe)) urls.add(match[1])
  for (const match of html.matchAll(srcsetRe)) {
    for (const part of match[1].split(',')) {
      const url = part.trim().split(/\s+/)[0]
      if (url && url.includes('wp-content/uploads')) urls.add(url)
    }
  }

  return [...urls]
    .map((u) => (u.startsWith('http') ? u : `${ORIGIN}${u.startsWith('/') ? '' : '/'}${u}`))
    .filter((u) => /\.(png|jpe?g|webp|gif|svg)(\?|$)/i.test(u))
}

/** Strip WP size suffix (…-1024x393.png) so we can prefer originals. */
function baseName(url) {
  return path
    .basename(new URL(url).pathname)
    .replace(/-\d+x\d+(?=\.\w+$)/, '')
    .toLowerCase()
}

async function main() {
  console.log('Fetching pages from', ORIGIN)
  const pages = ['/', '/about-us/', '/virtual-office/', '/contact-us/']
  const htmls = []
  for (const page of pages) {
    try {
      htmls.push(await fetchText(`${ORIGIN}${page}`))
      console.log('  ok', page)
    } catch (error) {
      console.warn('  skip', page, String(error))
    }
  }

  const all = new Set(htmls.flatMap(extractImageUrls))
  console.log(`Found ${all.size} image URLs`)

  // Prefer the largest variant per base name (original beats -WxH thumbnails).
  const byBase = new Map()
  for (const url of all) {
    const base = baseName(url)
    const existing = byBase.get(base)
    // Original files (no -WxH suffix in the raw path) win over thumbnails.
    const isOriginal = !/-\d+x\d+\.\w+$/i.test(new URL(url).pathname)
    if (!existing || (isOriginal && !existing.isOriginal)) {
      byBase.set(base, { url, isOriginal })
    }
  }

  await mkdir(path.join(OUT_DIR, 'locations'), { recursive: true })
  await mkdir(path.join(OUT_DIR, 'scraped'), { recursive: true })

  const done = new Set()
  let scrapedCount = 0

  for (const [base, { url }] of byBase) {
    let buffer
    try {
      buffer = await fetchBuffer(url)
    } catch (error) {
      console.warn('  failed', url, String(error))
      continue
    }

    const canonical = CANONICAL.find((c) => c.pattern.test(base) && !done.has(c.out))
    try {
      if (canonical) {
        const outPath = path.join(OUT_DIR, canonical.out)
        const pipeline = sharp(buffer).resize({ width: canonical.width, withoutEnlargement: true })
        const output =
          canonical.type === 'png'
            ? await pipeline.png({ compressionLevel: 9 }).toBuffer()
            : await pipeline.webp({ quality: 82 }).toBuffer()
        await writeFile(outPath, output)
        done.add(canonical.out)
        console.log('  canonical', canonical.out, `(${Math.round(output.length / 1024)}kb)`)
      } else if (/\.(png|jpe?g|webp)$/i.test(base)) {
        const outPath = path.join(OUT_DIR, 'scraped', base.replace(/\.(jpe?g|png)$/i, '.webp'))
        const output = await sharp(buffer)
          .resize({ width: 1600, withoutEnlargement: true })
          .webp({ quality: 82 })
          .toBuffer()
        await writeFile(outPath, output)
        scrapedCount += 1
      }
    } catch (error) {
      console.warn('  sharp failed for', base, String(error))
    }
  }

  console.log(`Done. Canonical: ${done.size}/${CANONICAL.length}, extra scraped: ${scrapedCount}`)
  const missing = CANONICAL.filter((c) => !done.has(c.out))
  if (missing.length > 0) {
    console.warn('Missing canonical assets:', missing.map((m) => m.out).join(', '))
    process.exitCode = 2
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
