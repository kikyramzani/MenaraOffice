import { PageHeading, PrintPage } from './PrintPage'
import { PROCESS_LEAD, PROCESS_STEPS, SECTION, site } from './copy'

type ProcessPageProps = {
  number: number
  openHour: string
  closeHour: string
  closedDays: string
}

export function ProcessPage({ number, openHour, closeHour, closedDays }: ProcessPageProps) {
  return (
    <PrintPage number={number}>
      <PageHeading eyebrow={SECTION.process} title={site.cta.title} lead={PROCESS_LEAD} />

      {/* Steps share the leftover height so the connector line runs the full page. */}
      <ol className="mt-[9mm] flex flex-1 flex-col gap-[5mm]">
        {PROCESS_STEPS.map((step, index) => (
          <li key={step.title} className="flex flex-1 gap-[5mm]">
            <div className="flex flex-col items-center">
              <span className="flex h-[11mm] w-[11mm] shrink-0 items-center justify-center rounded-full border-[0.6mm] border-brand-500 text-[12pt] font-extrabold text-brand-700">
                {index + 1}
              </span>
              {index < PROCESS_STEPS.length - 1 ? (
                <span className="mt-[2mm] w-[0.4mm] flex-1 bg-line" />
              ) : null}
            </div>
            <div className="pb-[1mm]">
              <h3 className="text-[13pt] font-extrabold text-brand-900">{step.title}</h3>
              <p className="mt-[2mm] max-w-[135mm] text-[10pt] leading-[1.65] text-ink-muted">
                {step.body}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-auto grid grid-cols-2 gap-[4mm] pt-[8mm]">
        <div className="surface-soft p-[5mm]">
          <h3 className="text-[8pt] font-bold tracking-[0.14em] text-brand-500 uppercase">
            Jam Booking Ruang Rapat
          </h3>
          <p className="mt-[2mm] text-[14pt] font-extrabold text-brand-900">
            {openHour} – {closeHour}
          </p>
          <p className="mt-[1.5mm] text-[9pt] text-ink-muted">{closedDays}</p>
        </div>
        <div className="surface-soft p-[5mm]">
          <h3 className="text-[8pt] font-bold tracking-[0.14em] text-brand-500 uppercase">
            Waktu Respons
          </h3>
          <p className="mt-[2mm] text-[14pt] font-extrabold text-brand-900">1×24 jam kerja</p>
          <p className="mt-[1.5mm] text-[9pt] text-ink-muted">
            Untuk balasan lebih cepat, hubungi kami langsung via WhatsApp.
          </p>
        </div>
      </div>
    </PrintPage>
  )
}
