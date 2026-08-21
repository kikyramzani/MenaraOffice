import type { Service } from '@/lib/data/types'

import { PageHeading, PrintPage } from './PrintPage'
import { printPhoto } from './photos'
import { SECTION, site } from './copy'
import { startingPriceLabel } from './pricing'

type ServiceDetailPageProps = {
  number: number
  service: Service
}

export function ServiceDetailPage({ number, service }: ServiceDetailPageProps) {
  const price = startingPriceLabel(service)

  return (
    <PrintPage number={number}>
      <div className="h-[82mm] overflow-hidden rounded-[3mm]">
        <img src={printPhoto(service.heroImage)} alt="" width={1600} height={1000} className="print-img" />
      </div>

      <div className="mt-[7mm]">
        <PageHeading eyebrow={SECTION.services} title={service.name.id} lead={service.tagline.id} />
      </div>

      <p className="mt-[6mm] text-[10.5pt] leading-[1.7] text-ink">{service.description.id}</p>

      <div className="mt-[7mm] grid grid-cols-[1fr_66mm] gap-[6mm]">
        <div>
          <h3 className="text-[9pt] font-bold tracking-[0.14em] text-brand-500 uppercase">
            {site.services.features}
          </h3>
          <ul className="mt-[3mm] space-y-[2.5mm]">
            {service.features.map((feature) => (
              <li key={feature.id} className="flex gap-[3mm] text-[10pt] leading-[1.5] text-ink">
                <span className="mt-[1.6mm] h-[1.8mm] w-[1.8mm] shrink-0 rounded-full bg-accent" />
                {feature.id}
              </li>
            ))}
          </ul>
        </div>

        <aside className="surface-soft self-start p-[5mm]">
          <p className="text-[8pt] font-semibold tracking-[0.1em] text-ink-muted uppercase">
            {site.services.startFrom}
          </p>
          {price ? (
            <p className="mt-[2mm] text-[15pt] leading-[1.2] font-extrabold text-balance text-brand-800">
              {price}
            </p>
          ) : null}

          {service.tiers.length > 1 ? (
            <p className="mt-[3mm] text-[8.5pt] leading-[1.55] text-ink-muted">
              Tersedia {service.tiers.length} pilihan paket:{' '}
              {service.tiers.map((tier) => tier.name).join(', ')}.
            </p>
          ) : null}

          <p className="mt-[4mm] border-t border-line pt-[4mm] text-[8.5pt] leading-[1.55] text-ink-muted">
            {site.services.pricingSubtitle}
          </p>
        </aside>
      </div>

      <p className="mt-auto border-t border-line pt-[6mm] text-[9.5pt] leading-[1.6] text-ink-muted">
        Tersedia di seluruh cabang Menara Office. {site.cta.subtitle}
      </p>
    </PrintPage>
  )
}
