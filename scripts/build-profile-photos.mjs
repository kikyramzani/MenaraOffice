/**
 * Print derivatives for the company-profile PDF.
 *
 * Chromium's PDF writer cannot pass a WebP through, so it re-encodes every
 * source photo as a lossless Flate stream: the site's 5.8 MB of branch photos
 * became a 46 MB document. JPEG is embedded as-is (DCTDecode), so this script
 * emits right-sized JPEGs and the profile pages point at those instead.
 *
 * Output mirrors the source tree: `/images/locations/x.webp` becomes
 * `/images/print/locations/x.jpg` — the same rule `printPhoto()` applies in
 * `src/components/profile/photos.ts`.
 */
import { mkdir, readdir, writeFile } from 'node:fs/promises'
import { dirname, join, parse } from 'node:path'

import sharp from 'sharp'

const PUBLIC_IMAGES = 'public/images'
const OUT_ROOT = join(PUBLIC_IMAGES, 'print')
const QUALITY = 80

/**
 * Widths are set from the largest printed size of each group, at roughly
 * 200 dpi: the cover photo spans the full 210 mm sheet, service banners run
 * 178 mm, and branch photos never exceed 120 mm.
 */
const GROUPS = [
  { dir: 'home', width: 1500 },
  { dir: 'services', width: 1400 },
  { dir: 'locations', width: 1100 },
]

async function convertGroup({ dir, width }) {
  const sourceDir = join(PUBLIC_IMAGES, dir)
  const files = (await readdir(sourceDir)).filter((file) => /\.(webp|jpe?g|png)$/i.test(file))

  await mkdir(join(OUT_ROOT, dir), { recursive: true })

  let bytes = 0
  for (const file of files) {
    const target = join(OUT_ROOT, dir, `${parse(file).name}.jpg`)
    const buffer = await sharp(join(sourceDir, file))
      .resize({ width, withoutEnlargement: true })
      .flatten({ background: '#ffffff' })
      .jpeg({ quality: QUALITY, mozjpeg: true })
      .toBuffer()

    await mkdir(dirname(target), { recursive: true })
    await writeFile(target, buffer)
    bytes += buffer.byteLength
  }

  console.log(`${dir}: ${files.length} foto → ${(bytes / 1e6).toFixed(1)} MB`)
}

for (const group of GROUPS) {
  await convertGroup(group)
}
