import { PageHeading, PrintPage } from './PrintPage'
import { SECTION, site } from './copy'

type FaqPageProps = {
  number: number
}

export function FaqPage({ number }: FaqPageProps) {
  const items = [
    { q: site.faq.q1, a: site.faq.a1 },
    { q: site.faq.q2, a: site.faq.a2 },
    { q: site.faq.q3, a: site.faq.a3 },
    { q: site.faq.q4, a: site.faq.a4 },
    { q: site.faq.q5, a: site.faq.a5 },
  ]

  return (
    <PrintPage number={number}>
      <PageHeading
        eyebrow={site.faq.eyebrow}
        title={SECTION.faq}
        lead="Hal-hal yang paling sering ditanyakan calon klien sebelum memulai."
      />

      <dl className="mt-[9mm] space-y-[6mm]">
        {items.map((item, index) => (
          <div key={item.q} className="border-b border-line pb-[5mm] last:border-b-0">
            <dt className="flex gap-[4mm] text-[11.5pt] leading-[1.35] font-extrabold text-brand-900">
              <span className="text-brand-400 tabular-nums">{String(index + 1).padStart(2, '0')}</span>
              {item.q}
            </dt>
            <dd className="mt-[2.5mm] pl-[10mm] text-[10pt] leading-[1.65] text-ink-muted">
              {item.a}
            </dd>
          </div>
        ))}
      </dl>

      <p className="mt-auto pt-[8mm] text-[9.5pt] leading-[1.6] text-ink-muted">
        Pertanyaan lain? {site.cta.subtitle}
      </p>
    </PrintPage>
  )
}
