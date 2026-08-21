import { PageHeading, PrintPage } from './PrintPage'
import { PhotoStrip } from './PhotoStrip'
import { ABOUT_LEAD, BRAND_PROMISE, SECTION, site } from './copy'

type AboutPageProps = {
  number: number
  locationCount: number
  cityCount: number
  serviceCount: number
}

export function AboutPage({ number, locationCount, cityCount, serviceCount }: AboutPageProps) {
  const stats = [
    { value: String(locationCount), label: site.hero.statLocations },
    { value: String(cityCount), label: site.hero.statCities },
    { value: String(serviceCount), label: site.hero.statServices },
    { value: '2013', label: 'Melayani Sejak' },
  ]

  return (
    <PrintPage number={number}>
      <PageHeading eyebrow={site.about.eyebrow} title={SECTION.about} lead={ABOUT_LEAD} />

      <div className="mt-[8mm] space-y-[4mm] text-[10.5pt] leading-[1.7] text-ink">
        <p>{site.about.body1}</p>
        <p>{site.about.body2}</p>
      </div>

      <dl className="mt-[9mm] grid grid-cols-4 gap-[3mm]">
        {stats.map((stat) => (
          <div key={stat.label} className="surface-soft px-[4mm] py-[5mm] text-center">
            <dt className="text-[7.5pt] font-semibold tracking-[0.1em] text-ink-muted uppercase">
              {stat.label}
            </dt>
            <dd className="mt-[2mm] text-[22pt] leading-none font-extrabold text-brand-700">
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>

      <blockquote className="mt-[9mm] border-l-[1.2mm] border-accent pl-[6mm]">
        <p className="text-[15pt] leading-[1.35] font-extrabold text-brand-900 italic">
          “{site.about.title}”
        </p>
        <p className="mt-[3mm] text-[10pt] leading-[1.6] text-ink-muted">{BRAND_PROMISE}</p>
      </blockquote>

      <PhotoStrip photos={['menara-karya-01', 'epiwalk-02', 'wisma-perkasa-01']} />
    </PrintPage>
  )
}
