import { PageHeading, PrintPage } from './PrintPage'
import { PhotoStrip } from './PhotoStrip'

export type TocEntry = {
  label: string
  page: number
  /** Sub-entries render indented and lighter, e.g. one line per branch. */
  children?: string[]
}

type TocPageProps = {
  number: number
  entries: TocEntry[]
}

export function TocPage({ number, entries }: TocPageProps) {
  return (
    <PrintPage number={number}>
      <PageHeading eyebrow="Isi Dokumen" title="Daftar Isi" />

      <ol className="mt-[10mm] space-y-[6mm]">
        {entries.map((entry) => (
          <li key={entry.label}>
            <div className="flex items-baseline gap-[3mm]">
              <span className="text-[11.5pt] font-bold text-brand-900">{entry.label}</span>
              <span className="h-0 flex-1 translate-y-[-1mm] border-b border-dotted border-line" />
              <span className="text-[11pt] font-bold tabular-nums text-brand-600">
                {String(entry.page).padStart(2, '0')}
              </span>
            </div>
            {entry.children?.length ? (
              <p className="mt-[2mm] text-[9pt] leading-[1.6] text-ink-muted">
                {entry.children.join(' · ')}
              </p>
            ) : null}
          </li>
        ))}
      </ol>

      <PhotoStrip photos={['epiwalk-01', 'bekasi-02', 'cempaka-mas-03']} />
    </PrintPage>
  )
}
