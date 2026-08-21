import { PageHeading, PrintPage } from './PrintPage'
import { PhotoStrip } from './PhotoStrip'
import { SECTION, site } from './copy'

type WhyUsPageProps = {
  number: number
  locationCount: number
  cityCount: number
  openHour: string
  closeHour: string
}

export function WhyUsPage({
  number,
  locationCount,
  cityCount,
  openHour,
  closeHour,
}: WhyUsPageProps) {
  const pillars = [
    { title: site.about.mission1Title, body: site.about.mission1Body },
    { title: site.about.mission2Title, body: site.about.mission2Body },
    { title: site.about.mission3Title, body: site.about.mission3Body },
  ]

  const facts = [
    {
      label: 'Jangkauan',
      value: `${locationCount} lokasi · ${cityCount} kota`,
      note: 'Jakarta, Bekasi, dan Bandung.',
    },
    {
      label: 'Booking online',
      value: `${openHour}–${closeHour}`,
      note: 'Ketersediaan ruang rapat tampil langsung dari sistem kami, Senin–Jumat.',
    },
    {
      label: 'Satu pintu',
      value: 'Kantor + legalitas',
      note: 'Alamat, ruang kerja, pendirian badan usaha, dan konsultasi hukum dalam satu penyedia.',
    },
  ]

  return (
    <PrintPage number={number}>
      <PageHeading
        eyebrow={SECTION.why}
        title={site.about.missionTitle}
        lead="Tiga alasan utama pelaku usaha mempercayakan alamat kantornya kepada kami."
      />

      <ol className="mt-[9mm] flex flex-col gap-[5mm]">
        {pillars.map((pillar, index) => (
          <li key={pillar.title} className="surface-soft flex items-center gap-[5mm] p-[6mm]">
            <span className="flex h-[12mm] w-[12mm] shrink-0 items-center justify-center rounded-full bg-brand-900 text-[13pt] font-extrabold text-white">
              {index + 1}
            </span>
            <div>
              <h3 className="text-[13pt] font-extrabold text-brand-900">{pillar.title}</h3>
              <p className="mt-[2mm] text-[10pt] leading-[1.65] text-ink-muted">{pillar.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <PhotoStrip photos={['wisma-perkasa-03', 'menara-karya-02', 'bekasi-05']} />

      <dl className="mt-[8mm] grid grid-cols-3 gap-[4mm] border-t border-line pt-[7mm]">
        {facts.map((fact) => (
          <div key={fact.label}>
            <dt className="text-[7.5pt] font-bold tracking-[0.14em] text-brand-500 uppercase">
              {fact.label}
            </dt>
            <dd className="mt-[2mm] text-[11.5pt] font-extrabold text-brand-900">{fact.value}</dd>
            <p className="mt-[1.5mm] text-[8.5pt] leading-[1.55] text-ink-muted">{fact.note}</p>
          </div>
        ))}
      </dl>
    </PrintPage>
  )
}
