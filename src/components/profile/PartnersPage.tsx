import type { Partner, Testimonial } from '@/lib/data/types'

import { PageHeading, PrintPage } from './PrintPage'
import { PhotoStrip } from './PhotoStrip'
import { PARTNERS_LEAD, SECTION, site } from './copy'

type PartnersPageProps = {
  number: number
  partners: Partner[]
  testimonials: Testimonial[]
}

/**
 * Partner logos, plus client quotes when the admin panel has any. The
 * testimonial block stays out of the document until real quotes exist rather
 * than filling the page with placeholders.
 */
export function PartnersPage({ number, partners, testimonials }: PartnersPageProps) {
  return (
    <PrintPage number={number}>
      <PageHeading eyebrow={site.partners.title} title={SECTION.partners} lead={PARTNERS_LEAD} />

      {/* Without client quotes this page is short, so the logos take the stage. */}
      <ul className="mt-[9mm] grid max-h-[76mm] min-h-[42mm] flex-1 grid-cols-3 grid-rows-1 gap-[5mm]">
        {partners.map((partner) => (
          <li
            key={partner.id}
            className="surface-soft flex flex-col items-center justify-center p-[5mm]"
          >
            <div className="flex w-full flex-1 items-center justify-center">
              <img
                src={partner.logo}
                alt={partner.name}
                width={400}
                height={200}
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <p className="mt-[3mm] text-center text-[9.5pt] font-bold text-brand-900">
              {partner.name}
            </p>
          </li>
        ))}
      </ul>

      {testimonials.length ? (
        <section className="mt-[10mm]">
          <h3 className="text-[9pt] font-bold tracking-[0.14em] text-brand-500 uppercase">
            {site.testimonials.title}
          </h3>
          <div className="mt-[4mm] space-y-[4mm]">
            {testimonials.slice(0, 3).map((testimonial) => (
              <figure
                key={testimonial.id}
                className="border-l-[1.2mm] border-accent pl-[5mm]"
              >
                <blockquote className="text-[10.5pt] leading-[1.6] text-ink italic">
                  “{testimonial.quote.id}”
                </blockquote>
                <figcaption className="mt-[2mm] text-[9pt] text-ink-muted">
                  <span className="font-bold text-brand-900">{testimonial.name}</span>
                  {testimonial.role ? ` · ${testimonial.role}` : ''}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      ) : null}

      <PhotoStrip photos={['cempaka-mas-01', 'bekasi-03', 'epiwalk-05']} />
    </PrintPage>
  )
}
