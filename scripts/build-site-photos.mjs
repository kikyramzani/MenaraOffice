/**
 * Turns the curated Google Drive branch photos in `assets/drive/` into the
 * optimised WebP files the site serves from `public/images/`.
 *
 * Run `npm run fetch:drive` first.
 *
 * Selection is explicit rather than glob-everything: of the ~230 photos
 * downloaded, many are near-duplicate frames of the same empty room, so both
 * which photos ship and the order they appear in are editorial decisions.
 *
 * Encoding matches scripts/scrape-assets.mjs (webp q82, max width 1600) so
 * every photo on the site is produced the same way.
 *
 * Usage: npm run build:photos
 */
import { mkdir, writeFile, access } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const ROOT = process.cwd()
const SRC_DIR = path.join(ROOT, 'assets', 'drive')
const OUT_ROOT = path.join(ROOT, 'public', 'images')
const DOC = 'MO/Dokumentasi'

const WIDTH = 1600
const QUALITY = 82

/**
 * Hero images are cropped to a fixed ratio here rather than left to CSS.
 * Most sources are square or portrait phone shots, and `object-cover` on a
 * 3:4 source in a 4:3 box throws away the top and bottom blind; cropping at
 * build time keeps the framing decision visible and reviewable.
 */
const RATIO_4_3 = { width: 1600, height: 1200 }
const RATIO_16_9 = { width: 1600, height: 900 }

const branch = {
  mk: `${DOC}/Foto Tiap Cabang/MO - Menara Karya`,
  pejaten: `${DOC}/Foto Tiap Cabang/MO - Pejaten`,
  cempaka: `${DOC}/Foto Tiap Cabang/MO - Cempaka`,
  epiwalk: `${DOC}/Foto Tiap Cabang/MO - Epiwalk`,
  epiEdit: `${DOC}/konten epiwalk/Edit`,
  epiFoto: `${DOC}/konten epiwalk/foto`,
  bekasi: `${DOC}/Cabang MO/Cabang Bekasi/Edited`,
  grandwis: `${DOC}/Foto Tiap Cabang/MO - Grand Wisata`,
}

/**
 * Per-location hero + gallery. Gallery images keep their native aspect ratio:
 * the thumbnail grid crops them with CSS, but the lightbox shows them whole
 * with `object-contain`, so a build-time crop would lose real content there.
 *
 * `bandung-mtc` is absent on purpose — neither Drive folder contains a single
 * photo of that branch, so its existing image stays untouched.
 */
const LOCATIONS = [
  {
    stem: 'menara-karya',
    hero: `${branch.mk}/60676.png`,
    gallery: [
      `${branch.mk}/60677.png`,
      `${branch.mk}/60680.png`,
      `${branch.mk}/60679.png`,
      `${branch.mk}/60681.png`,
      `${branch.mk}/60678.png`,
      `${branch.mk}/60682.png`,
    ],
  },
  {
    stem: 'wisma-perkasa',
    hero: `${branch.pejaten}/edited - ABY05394.png`,
    gallery: [
      `${branch.pejaten}/edited - ABY05458.png`,
      `${branch.pejaten}/edited - ABY05439.png`,
      `${branch.pejaten}/edited - ABY05387.png`,
      `${branch.pejaten}/edited - ABY05379.png`,
      `${branch.pejaten}/edited - ABY05399.png`,
      `${branch.pejaten}/edited - ABY05478.png`,
      `${branch.pejaten}/edited - ABY05426.png`,
      `${branch.pejaten}/edited - ABY05429.png`,
    ],
  },
  {
    stem: 'epiwalk',
    hero: `${branch.epiwalk}/65467.png`,
    gallery: [
      `${branch.epiwalk}/65469.png`,
      `${branch.epiwalk}/65463.png`,
      `${branch.epiwalk}/65468.png`,
      `${branch.epiwalk}/65460.png`,
      `${branch.epiwalk}/65470.png`,
      `${branch.epiEdit}/MNR06373.png`,
      `${branch.epiEdit}/MNR06402.png`,
      `${branch.epiEdit}/IMG_4163.png`,
    ],
  },
  {
    stem: 'cempaka-mas',
    hero: `${branch.cempaka}/MO_Cempaka-front office2.png`,
    gallery: [
      `${branch.cempaka}/MO_Cempaka-front office.png`,
      `${branch.cempaka}/MO_Cempaka-room meeting.png`,
      `${branch.cempaka}/MO_Cempaka-room meeting2.png`,
      `${branch.cempaka}/MO_Cempaka-room office.png`,
      `${branch.cempaka}/MO_Cempaka-room sharing.png`,
      `${branch.cempaka}/MO_Cempaka-private room.png`,
    ],
  },
  {
    stem: 'bekasi',
    hero: `${branch.bekasi}/MNR09880.jpg`,
    gallery: [
      `${branch.bekasi}/MNR09850.jpg`,
      `${branch.bekasi}/MNR09893.jpg`,
      `${branch.bekasi}/MNR09898.jpg`,
      `${branch.bekasi}/MNR09866.jpg`,
      `${branch.bekasi}/MNR09868.jpg`,
      `${branch.bekasi}/MNR09845.jpg`,
      `${branch.grandwis}/MO - Grandwis - room meeting.png`,
    ],
  },
]

/**
 * Service heroes get their own files instead of borrowing a location photo:
 * three of the five services previously shared one image, and pointing them at
 * a location's gallery file would break silently whenever that gallery is
 * re-curated.
 */
const SERVICES = [
  { slug: 'virtual-office', src: `${branch.cempaka}/MO_Cempaka-front office.png` },
  { slug: 'serviced-office', src: `${branch.mk}/60680.png` },
  { slug: 'meeting-room', src: `${branch.cempaka}/MO_Cempaka-room meeting2.png` },
  { slug: 'pendirian-pt', src: `${branch.pejaten}/edited - ABY05458.png` },
  { slug: 'legal-consultant', src: `${branch.mk}/60681.png` },
]

/** Blog cards and detail pages both render 16:9. */
const POSTS = [
  { slug: 'virtual-office-untuk-legalitas-pt', src: `${branch.pejaten}/edited - ABY05394.png` },
  { slug: 'tips-meeting-produktif', src: `${branch.cempaka}/MO_Cempaka-room meeting.png` },
  { slug: 'memilih-lokasi-kantor-pertama', src: `${branch.pejaten}/edited - ABY05478.png` },
]

/** Homepage hero and the default OpenGraph card. */
const HOME = [{ name: 'hero.webp', src: `${branch.mk}/60677.png`, ratio: RATIO_4_3 }]

async function exists(file) {
  try {
    await access(file)
    return true
  } catch {
    return false
  }
}

/**
 * Largest box with `ratio`'s aspect that fits inside the source, capped at the
 * requested size. Computing this by hand rather than passing
 * `withoutEnlargement` to a `fit: 'cover'` resize matters: that flag makes
 * sharp shrink the *requested box* to fit the source, which silently abandons
 * the crop — a 1080x1080 source asked for 1600x1200 came back square.
 */
function fitRatio(ratio, srcWidth, srcHeight) {
  const aspect = ratio.width / ratio.height
  const width = Math.round(Math.min(ratio.width, srcWidth, srcHeight * aspect))
  return { width, height: Math.round(width / aspect) }
}

/** `ratio` null keeps the source aspect and only caps the width. */
async function encode(relSrc, outRel, ratio) {
  const srcPath = path.join(SRC_DIR, relSrc)
  if (!(await exists(srcPath))) {
    console.warn(`  MISSING  ${relSrc}`)
    return false
  }

  const pipeline = sharp(srcPath)
  let resized
  if (ratio) {
    const source = await pipeline.metadata()
    const box = fitRatio(ratio, source.width, source.height)
    resized = pipeline.resize({ ...box, fit: 'cover', position: 'centre' })
  } else {
    resized = pipeline.resize({ width: WIDTH, withoutEnlargement: true })
  }

  const output = await resized.webp({ quality: QUALITY }).toBuffer()
  const outPath = path.join(OUT_ROOT, outRel)
  await mkdir(path.dirname(outPath), { recursive: true })
  await writeFile(outPath, output)

  const meta = await sharp(output).metadata()
  console.log(
    `  ${outRel.padEnd(38)} ${`${meta.width}x${meta.height}`.padEnd(10)} ${String(Math.round(output.length / 1024)).padStart(4)}kb`,
  )
  return true
}

async function main() {
  let written = 0
  let missing = 0
  const tally = async (promise) => {
    ;(await promise) ? (written += 1) : (missing += 1)
  }

  for (const location of LOCATIONS) {
    console.log(`locations/${location.stem}:`)
    await tally(encode(location.hero, `locations/${location.stem}.webp`, RATIO_4_3))
    for (let i = 0; i < location.gallery.length; i += 1) {
      const outRel = `locations/${location.stem}-${String(i + 1).padStart(2, '0')}.webp`
      await tally(encode(location.gallery[i], outRel, null))
    }
  }

  console.log('services:')
  for (const service of SERVICES) {
    await tally(encode(service.src, `services/${service.slug}.webp`, RATIO_4_3))
  }

  console.log('blog:')
  for (const post of POSTS) {
    await tally(encode(post.src, `blog/${post.slug}.webp`, RATIO_16_9))
  }

  console.log('home:')
  for (const item of HOME) {
    await tally(encode(item.src, `home/${item.name}`, item.ratio))
  }

  console.log(`\nDone. ${written} written, ${missing} missing.`)
  if (missing > 0) process.exitCode = 2
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
