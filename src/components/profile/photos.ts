/**
 * Maps a site photo to its print derivative, e.g.
 * `/images/locations/epiwalk.webp` → `/images/print/locations/epiwalk.jpg`.
 *
 * The JPEGs are produced by `scripts/build-profile-photos.mjs`, which applies
 * the same rule; keep the two in step. Paths outside `/images/` — and logos,
 * which need their transparency — are returned untouched.
 */
export function printPhoto(src: string): string {
  const match = /^\/images\/(home|services|locations)\/([^/]+)\.\w+$/.exec(src)
  if (!match) return src

  const [, group, name] = match
  return `/images/print/${group}/${name}.jpg`
}
