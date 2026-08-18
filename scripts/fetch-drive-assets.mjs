/**
 * Downloads the branch photo documentation from the shared Google Drive folders
 * into `assets/drive/`, mirroring the Drive folder structure.
 *
 * The inventory (`scripts/drive-inventory.tsv`) is a crawl of the two shared
 * folders, so the download is reproducible without re-scraping Drive.
 * Columns: KIND \t fileId \t mime \t path
 *
 * Skipped on purpose:
 *  - the top-level `Cabang MO/` tree — byte-for-byte the same 294 paths as
 *    `MO/Dokumentasi/Cabang MO/`, so downloading it would double the transfer
 *  - `image/arw` (Sony RAW) — unusable on the web, and the same frames already
 *    exist as edited JPEGs
 *  - every video/* mime — out of scope for the website
 *
 * Usage: npm run fetch:drive
 */
import { mkdir, writeFile, readFile, stat } from 'node:fs/promises'
import path from 'node:path'

const ROOT = process.cwd()
const INVENTORY = path.join(ROOT, 'scripts', 'drive-inventory.tsv')
const OUT_DIR = path.join(ROOT, 'assets', 'drive')
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'

const CONCURRENCY = 6
const RETRIES = 3

/** Drive's `uc?export=download` returns the original bytes for public files. */
function downloadUrl(fileId) {
  return `https://drive.google.com/uc?export=download&id=${fileId}`
}

function wanted(row) {
  if (row.kind !== 'FILE') return false
  if (!row.mime.startsWith('image/')) return false
  if (row.mime === 'image/arw') return false
  if (row.path.startsWith('Cabang MO/')) return false
  return true
}

async function parseInventory() {
  const raw = await readFile(INVENTORY, 'utf8')
  return raw
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const [kind, fileId, mime, ...rest] = line.split('\t')
      return { kind, fileId, mime, path: rest.join('\t') }
    })
    .filter(wanted)
}

async function alreadyDone(outPath) {
  try {
    const info = await stat(outPath)
    // A zero-byte file is a previous failed run, not a finished download.
    return info.size > 0
  } catch {
    return false
  }
}

async function fetchOne(row) {
  const outPath = path.join(OUT_DIR, row.path)
  if (await alreadyDone(outPath)) return { status: 'skip', path: row.path }

  for (let attempt = 1; attempt <= RETRIES; attempt += 1) {
    try {
      const res = await fetch(downloadUrl(row.fileId), { headers: { 'user-agent': UA } })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const buffer = Buffer.from(await res.arrayBuffer())
      // Drive serves an HTML interstitial instead of bytes when it throttles;
      // writing that as a .jpg would fail much later, in the sharp pipeline.
      if (buffer.length < 1024 && buffer.subarray(0, 64).toString().includes('<')) {
        throw new Error('got HTML interstitial, not image bytes')
      }
      await mkdir(path.dirname(outPath), { recursive: true })
      await writeFile(outPath, buffer)
      return { status: 'ok', path: row.path, bytes: buffer.length }
    } catch (error) {
      if (attempt === RETRIES) return { status: 'fail', path: row.path, error: String(error) }
      await new Promise((resolve) => setTimeout(resolve, 500 * attempt))
    }
  }
  return { status: 'fail', path: row.path, error: 'unreachable' }
}

async function main() {
  const rows = await parseInventory()
  console.log(`Inventory: ${rows.length} image files to fetch → assets/drive/`)

  const counts = { ok: 0, skip: 0, fail: 0 }
  let bytes = 0
  let cursor = 0
  const failures = []

  async function worker() {
    while (cursor < rows.length) {
      const row = rows[cursor]
      cursor += 1
      const result = await fetchOne(row)
      counts[result.status] += 1
      if (result.bytes) bytes += result.bytes
      if (result.status === 'fail') failures.push(result)
      const done = counts.ok + counts.skip + counts.fail
      if (done % 20 === 0 || done === rows.length) {
        console.log(`  ${done}/${rows.length}  ok=${counts.ok} skip=${counts.skip} fail=${counts.fail}`)
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker))

  console.log(
    `Done. ok=${counts.ok} skip=${counts.skip} fail=${counts.fail}, ${Math.round(bytes / 1024 / 1024)} MB downloaded`,
  )
  if (failures.length > 0) {
    console.warn('Failures:')
    for (const failure of failures) console.warn(`  ${failure.path} — ${failure.error}`)
    process.exitCode = 2
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
