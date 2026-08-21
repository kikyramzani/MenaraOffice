import { printPhoto } from './photos'

type PhotoStripProps = {
  /** Branch photo slugs from `public/images/locations`, e.g. `epiwalk-01`. */
  photos: string[]
}

/**
 * Three-up band of branch photography that absorbs whatever vertical space the
 * page has left, so pages with short copy do not end in a block of white.
 *
 * `flex-1` does the absorbing and `grid-rows-1` gives the row a definite
 * height — without it the wrappers size to the photos' natural height and the
 * band overflows the sheet. The cap keeps the photos from turning into a
 * poster on the emptiest pages.
 */
export function PhotoStrip({ photos }: PhotoStripProps) {
  return (
    <div className="mt-[10mm] grid max-h-[104mm] min-h-[54mm] flex-1 grid-cols-3 grid-rows-1 gap-[3mm]">
      {photos.map((photo) => (
        <div key={photo} className="overflow-hidden rounded-[3mm]">
          <img
            src={printPhoto(`/images/locations/${photo}.webp`)}
            alt=""
            width={1100}
            height={825}
            className="print-img"
          />
        </div>
      ))}
    </div>
  )
}
