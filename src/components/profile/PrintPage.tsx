import type { ReactNode } from 'react'

import { clsx } from '@/lib/clsx'

type PrintPageProps = {
  children: ReactNode
  /**
   * Physical sheet number. Pages that carry it get the standard gutter and the
   * running footer; cover pages omit it and lay out edge to edge instead.
   */
  number?: number
  className?: string
}

/** One A4 sheet. Sizing and page breaks live in `profile-print.css`. */
export function PrintPage({ children, number, className }: PrintPageProps) {
  if (number === undefined) {
    return <section className={clsx('print-page', className)}>{children}</section>
  }

  return (
    <section className={clsx('print-page', className)}>
      <div className="page-body">{children}</div>
      <footer className="page-foot">
        <span>Menara Office · Company Profile</span>
        <span className="page-foot__num">{String(number).padStart(2, '0')}</span>
      </footer>
    </section>
  )
}

type PageHeadingProps = {
  eyebrow: string
  title: string
  lead?: string
}

/** Eyebrow + title + optional lead, the opening block of every content page. */
export function PageHeading({ eyebrow, title, lead }: PageHeadingProps) {
  return (
    <header>
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="page-title">{title}</h2>
      {lead ? <p className="page-lead">{lead}</p> : null}
      <div className="rule-accent" />
    </header>
  )
}
