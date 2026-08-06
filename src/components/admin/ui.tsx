import type { ReactNode } from 'react'
import { clsx } from '@/lib/clsx'

/** Shared admin building blocks — kept intentionally tiny. */

export const adminInputClass =
  'w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white px-3.5 py-2.5 text-sm focus:border-[var(--brand-500)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-200)]'

export function PageTitle({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-extrabold text-[var(--brand-900)]">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-[var(--color-text-muted)]">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  )
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={clsx(
        'rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-card)] md:p-6',
        className,
      )}
    >
      {children}
    </div>
  )
}

const badgeTones: Record<string, string> = {
  new: 'bg-[var(--brand-100)] text-[var(--brand-800)]',
  contacted: 'bg-[var(--accent-100)] text-[#92400e]',
  closed: 'bg-slate-100 text-slate-600',
  pending: 'bg-[var(--accent-100)] text-[#92400e]',
  confirmed: 'bg-[#dcfce7] text-[#166534]',
  cancelled: 'bg-[#fee2e2] text-[#991b1b]',
  published: 'bg-[#dcfce7] text-[#166534]',
  draft: 'bg-slate-100 text-slate-600',
  active: 'bg-[#dcfce7] text-[#166534]',
  inactive: 'bg-slate-100 text-slate-600',
}

const badgeLabels: Record<string, string> = {
  new: 'Baru',
  contacted: 'Dihubungi',
  closed: 'Selesai',
  pending: 'Menunggu',
  confirmed: 'Terkonfirmasi',
  cancelled: 'Dibatalkan',
  published: 'Terbit',
  draft: 'Draf',
  active: 'Aktif',
  inactive: 'Nonaktif',
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={clsx(
        'inline-flex rounded-[var(--radius-pill)] px-2.5 py-1 text-xs font-bold',
        badgeTones[status] ?? 'bg-slate-100 text-slate-600',
      )}
    >
      {badgeLabels[status] ?? status}
    </span>
  )
}

export function Field({ label, htmlFor, children, hint }: { label: string; htmlFor?: string; children: ReactNode; hint?: string }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-semibold text-[var(--brand-900)]">
        {label}
      </label>
      {children}
      {hint ? <p className="mt-1 text-xs text-[var(--color-text-muted)]">{hint}</p> : null}
    </div>
  )
}

export function SubmitButton({ children = 'Simpan' }: { children?: ReactNode }) {
  return (
    <button
      type="submit"
      className="rounded-[var(--radius-pill)] bg-[var(--brand-700)] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--brand-800)]"
    >
      {children}
    </button>
  )
}
