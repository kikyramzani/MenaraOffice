import type { Service } from '@/lib/data/types'

import { PageHeading, PrintPage } from './PrintPage'
import { printPhoto } from './photos'
import { SECTION, site } from './copy'
import { startingPriceLabel } from './pricing'

type ServicesOverviewPageProps = {
  number: number
  services: Service[]
  /** Sheet each service's own page sits on, keyed by slug. */
  pageBySlug: Record<string, number>
}

/**
 * Bento summary: the flagship service takes a full-width band, the rest sit in
 * a two-column grid beneath it.
 */
export function ServicesOverviewPage({
  number,
  services,
  pageBySlug,
}: ServicesOverviewPageProps) {
  const [lead, ...others] = services

  return (
    <PrintPage number={number}>
      <PageHeading
        eyebrow={SECTION.services}
        title={site.services.title}
        lead={site.services.subtitle}
      />

      {lead ? (
        <article className="mt-[8mm] flex items-stretch gap-[5mm] overflow-hidden rounded-[3mm] bg-brand-900 p-[6mm] text-white">
          <div className="flex-1">
            <p className="text-[7.5pt] font-bold tracking-[0.14em] text-brand-300 uppercase">
              Halaman {String(pageBySlug[lead.slug] ?? 0).padStart(2, '0')}
            </p>
            <h3 className="mt-[2mm] text-[16pt] font-extrabold">{lead.name.id}</h3>
            <p className="mt-[2mm] max-w-[95mm] text-[9.5pt] leading-[1.6] text-brand-200">
              {lead.tagline.id}
            </p>
            <PriceLine label={startingPriceLabel(lead)} tone="dark" />
          </div>
          <div className="h-[34mm] w-[52mm] shrink-0 overflow-hidden rounded-[2mm]">
            <img src={printPhoto(lead.heroImage)} alt="" width={1200} height={800} className="print-img" />
          </div>
        </article>
      ) : null}

      {/* `auto-rows-fr` splits the leftover height evenly however many cards there are. */}
      <div className="mt-[5mm] grid flex-1 auto-rows-fr grid-cols-2 gap-[5mm]">
        {others.map((service) => (
          <article key={service.id} className="surface-soft flex flex-col p-[5mm]">
            <p className="text-[7.5pt] font-bold tracking-[0.14em] text-brand-500 uppercase">
              Halaman {String(pageBySlug[service.slug] ?? 0).padStart(2, '0')}
            </p>
            <h3 className="mt-[2mm] text-[12pt] leading-[1.25] font-extrabold text-brand-900">
              {service.name.id}
            </h3>
            <p className="mt-[2mm] flex-1 text-[9pt] leading-[1.6] text-ink-muted">
              {service.tagline.id}
            </p>
            <PriceLine label={startingPriceLabel(service)} tone="light" />
          </article>
        ))}
      </div>
    </PrintPage>
  )
}

function PriceLine({ label, tone }: { label: string | null; tone: 'dark' | 'light' }) {
  if (!label) return null

  return (
    <p className="mt-[4mm] flex flex-wrap items-baseline gap-x-[2mm] gap-y-[1.5mm]">
      <span
        className={
          tone === 'dark'
            ? 'text-[8pt] font-semibold tracking-[0.1em] whitespace-nowrap text-brand-300 uppercase'
            : 'text-[8pt] font-semibold tracking-[0.1em] whitespace-nowrap text-ink-muted uppercase'
        }
      >
        {site.services.startFrom}
      </span>
      <span className="price-chip text-[10.5pt]">{label}</span>
    </p>
  )
}
