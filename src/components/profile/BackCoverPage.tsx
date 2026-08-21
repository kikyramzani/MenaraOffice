import type { SiteSettings } from '@/lib/data/types'

import { PrintPage } from './PrintPage'
import { CLOSING_LINE, WEBSITE, site } from './copy'

type BackCoverPageProps = {
  settings: SiteSettings
}

export function BackCoverPage({ settings }: BackCoverPageProps) {
  /*
   * The navy field has to sit on an inner element: `.print-page` paints the
   * white paper background from an unlayered rule that would otherwise win
   * over `.wash-navy`, leaving white text on a white sheet.
   */
  return (
    <PrintPage>
      <div className="wash-navy flex h-full flex-col justify-between p-[16mm]">
        <img
          src="/images/logo-white.png"
          alt="Menara Office"
          width={640}
          height={246}
          className="w-[44mm]"
        />

        <div>
          <p className="text-[26pt] leading-[1.15] font-extrabold tracking-[-0.02em] text-white">
            {CLOSING_LINE}
          </p>
          <div className="mt-[5mm] h-[1.4mm] w-[24mm] rounded-full bg-accent" />
          <p className="mt-[6mm] max-w-[130mm] text-[10.5pt] leading-[1.7] text-brand-200">
            {site.footer.rights}
          </p>
        </div>

        <div className="border-t border-white/20 pt-[6mm] text-[9.5pt] leading-[1.8] text-brand-200">
          <p className="font-bold text-white">{WEBSITE}</p>
          <p>{settings.headOffice}</p>
          <p>
            {settings.email} · @{settings.instagram}
          </p>
        </div>
      </div>
    </PrintPage>
  )
}
