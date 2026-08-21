import { PrintPage } from './PrintPage'
import { printPhoto } from './photos'
import { CLOSING_LINE, COVER_BLURB, DOC_BRAND, DOC_TITLE } from './copy'

/**
 * Front cover: navy field carrying the wordmark and title, with the Menara
 * Karya reception photograph bled to the bottom edge.
 */
export function CoverPage() {
  return (
    <PrintPage className="flex flex-col">
      <div className="wash-navy flex h-[63%] flex-col justify-between p-[16mm]">
        <img
          src="/images/logo-white.png"
          alt="Menara Office"
          width={640}
          height={246}
          className="w-[44mm]"
        />

        <div>
          <p className="text-[9pt] font-bold tracking-[0.22em] text-brand-300 uppercase">
            {DOC_BRAND}
          </p>
          <h1 className="mt-[4mm] text-[42pt] leading-[1.02] font-extrabold tracking-[-0.03em] text-white">
            {DOC_TITLE}
          </h1>
          <div className="mt-[6mm] h-[1.4mm] w-[24mm] rounded-full bg-accent" />
          <p className="mt-[6mm] max-w-[125mm] text-[10.5pt] leading-[1.6] text-brand-200">
            {COVER_BLURB}
          </p>
        </div>

        <p className="text-[8.5pt] font-semibold tracking-[0.16em] text-brand-300 uppercase">
          {CLOSING_LINE} · Sejak 2013
        </p>
      </div>

      <div className="flex-1">
        <img
          src={printPhoto('/images/home/hero.webp')}
          alt=""
          width={1600}
          height={1200}
          className="print-img"
        />
      </div>
    </PrintPage>
  )
}
