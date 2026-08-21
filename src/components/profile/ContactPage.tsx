import type { OfficeLocation, SiteSettings } from '@/lib/data/types'

import { PageHeading, PrintPage } from './PrintPage'
import { printPhoto } from './photos'
import { CONTACT_LEAD, SECTION, WEBSITE, site } from './copy'

type ContactPageProps = {
  number: number
  settings: SiteSettings
  locations: OfficeLocation[]
}

export function ContactPage({ number, settings, locations }: ContactPageProps) {
  const emails = [settings.email, settings.emailSecondary].filter(Boolean)

  return (
    <PrintPage number={number}>
      <PageHeading eyebrow={SECTION.contact} title={site.contact.title} lead={CONTACT_LEAD} />

      <div className="mt-[8mm] grid grid-cols-[1fr_62mm] gap-[6mm]">
        <div className="wash-navy rounded-[3mm] p-[6mm]">
          <h3 className="text-[8pt] font-bold tracking-[0.14em] text-brand-300 uppercase">
            {site.contact.office}
          </h3>
          <p className="mt-[3mm] text-[12pt] leading-[1.5] font-bold text-white">
            {settings.headOffice}
          </p>
          <p className="mt-[5mm] border-t border-white/20 pt-[5mm] text-[9.5pt] leading-[1.6] text-brand-200">
            Kunjungan ke cabang lain dapat diatur lebih dulu melalui tim kami.
          </p>
        </div>

        <dl className="space-y-[4mm]">
          <ContactRow label={site.contact.waLabel} value={formatWaNumber(settings.waNumber)} />
          <ContactRow label={site.contact.emailLabel} value={emails.join('\n')} />
          <ContactRow label="Instagram" value={`@${settings.instagram}`} />
          <ContactRow label="Website" value={WEBSITE} />
        </dl>
      </div>

      <section className="mt-[9mm]">
        <h3 className="text-[9pt] font-bold tracking-[0.14em] text-brand-500 uppercase">
          Cabang Menara Office
        </h3>
        <ul className="mt-[4mm] grid grid-cols-2 gap-x-[6mm] gap-y-[3mm]">
          {locations.map((location) => (
            <li key={location.id} className="border-b border-line pb-[2.5mm] text-[9.5pt]">
              <span className="font-bold text-brand-900">{location.name}</span>
              <span className="block text-[8.5pt] leading-[1.5] text-ink-muted">
                {location.city}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-auto pt-[8mm]">
        <div className="h-[40mm] overflow-hidden rounded-[3mm]">
          <img
            src={printPhoto('/images/locations/menara-karya-04.webp')}
            alt=""
            width={1100}
            height={825}
            className="print-img"
          />
        </div>
        <p className="mt-[5mm] text-[10.5pt] leading-[1.6] font-semibold text-brand-800">
          {site.cta.subtitle}
        </p>
      </div>
    </PrintPage>
  )
}

function ContactRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="surface-soft p-[4mm]">
      <dt className="text-[7.5pt] font-bold tracking-[0.14em] text-brand-500 uppercase">{label}</dt>
      <dd className="mt-[1.5mm] text-[10pt] leading-[1.5] font-semibold whitespace-pre-line text-brand-900">
        {value}
      </dd>
    </div>
  )
}

/** `6287752556600` → `+62 877-5255-6600`; anything non-Indonesian stays raw. */
function formatWaNumber(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (!digits.startsWith('62')) return `+${digits}`

  const local = digits.slice(2)
  return `+62 ${local.slice(0, 3)}-${local.slice(3, 7)}-${local.slice(7)}`
}
