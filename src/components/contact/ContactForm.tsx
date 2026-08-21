'use client'

import { useState, type FormEvent } from 'react'
import { useTranslations } from 'next-intl'
import { leadSchema } from '@/lib/schemas'
import { waLink } from '@/lib/whatsapp'
import { Icon } from '@/components/ui/Icon'

type Props = {
  serviceOptions: { slug: string; label: string }[]
  /** Admin 1 — the general-enquiry inbox. */
  waNumber: string
}

const inputClass =
  'w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]/60 focus:border-[var(--brand-500)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-200)]'

export function ContactForm({ serviceOptions, waNumber }: Props) {
  const t = useTranslations('contact')
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (state === 'sending') return
    setError(null)
    setFieldErrors({})

    const formData = new FormData(event.currentTarget)
    const raw = Object.fromEntries(formData.entries())
    const parsed = leadSchema.safeParse(raw)

    if (!parsed.success) {
      const errors: Record<string, string> = {}
      for (const issue of parsed.error.issues) {
        const key = issue.path[0]
        if (typeof key === 'string' && !errors[key]) errors[key] = issue.message
      }
      setFieldErrors(errors)
      return
    }

    setState('sending')
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(parsed.data),
      })

      if (response.status === 429) {
        setError(t('rateLimited'))
        setState('idle')
        return
      }
      if (!response.ok) {
        setError(t('genericError'))
        setState('idle')
        return
      }
      setState('done')
    } catch {
      setError(t('genericError'))
      setState('idle')
    }
  }

  if (state === 'done') {
    return (
      <div
        role="status"
        className="rounded-[var(--radius-lg)] border border-[var(--color-success)]/30 bg-[#f0fdf4] p-8 text-center"
      >
        <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-success)] text-white">
          <Icon name="check" className="h-7 w-7" />
        </span>
        <h3 className="mt-4 text-xl font-bold text-[var(--brand-900)]">{t('successTitle')}</h3>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">{t('successBody')}</p>
      </div>
    )
  }

  const fieldError = (key: string) => {
    const code = fieldErrors[key]
    if (!code) return null
    return (
      <p role="alert" className="mt-1 text-xs font-medium text-[var(--color-danger)]">
        {fieldErrorMessage(code, t)}
      </p>
    )
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      {/* Honeypot: hidden from humans, bots fill it and get silently dropped */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label htmlFor="lead-company">Company</label>
        <input id="lead-company" type="text" name="company" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="lead-name" className="mb-1.5 block text-sm font-semibold text-[var(--brand-900)]">
            {t('name')}
          </label>
          <input id="lead-name" name="name" type="text" required className={inputClass} />
          {fieldError('name')}
        </div>
        <div>
          <label htmlFor="lead-phone" className="mb-1.5 block text-sm font-semibold text-[var(--brand-900)]">
            {t('phone')}
          </label>
          <input id="lead-phone" name="phone" type="tel" required placeholder="08xxxxxxxxxx" className={inputClass} />
          {fieldError('phone')}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="lead-email" className="mb-1.5 block text-sm font-semibold text-[var(--brand-900)]">
            {t('email')}
          </label>
          <input id="lead-email" name="email" type="email" required className={inputClass} />
          {fieldError('email')}
        </div>
        <div>
          <label htmlFor="lead-service" className="mb-1.5 block text-sm font-semibold text-[var(--brand-900)]">
            {t('service')}
          </label>
          <select id="lead-service" name="service" defaultValue="" className={inputClass}>
            <option value="" disabled>
              {t('servicePlaceholder')}
            </option>
            {serviceOptions.map((option) => (
              <option key={option.slug} value={option.label}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="lead-message" className="mb-1.5 block text-sm font-semibold text-[var(--brand-900)]">
          {t('message')}
        </label>
        <textarea
          id="lead-message"
          name="message"
          rows={5}
          required
          placeholder={t('messagePlaceholder')}
          className={inputClass}
        />
        {fieldError('message')}
      </div>

      {error ? (
        <p role="alert" className="rounded-[var(--radius-md)] bg-[#fef2f2] px-4 py-3 text-sm font-medium text-[var(--color-danger)]">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={state === 'sending'}
          className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] bg-[var(--brand-700)] px-7 py-3.5 text-base font-semibold text-white transition-colors hover:bg-[var(--brand-800)] disabled:opacity-60"
        >
          {state === 'sending' ? t('submitting') : t('submit')}
          <Icon name="arrow-right" className="h-5 w-5" />
        </button>
        <a
          href={waLink(waNumber, 'Halo Menara Office, saya ingin konsultasi.')}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] bg-[var(--wa-600)] px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--wa-700)]"
        >
          <Icon name="whatsapp" className="h-5 w-5" />
          {t('chatWa')}
        </a>
      </div>
    </form>
  )
}

/** Maps zod issue codes from lib/schemas.ts onto translated copy. */
function fieldErrorMessage(code: string, t: ReturnType<typeof useTranslations<'contact'>>): string {
  const map: Record<string, string> = {
    name_short: t('errName'),
    name_long: t('errName'),
    phone_short: t('errPhone'),
    phone_long: t('errPhone'),
    phone_invalid: t('errPhone'),
    email_invalid: t('errEmail'),
    message_short: t('errMessage'),
    message_long: t('errMessage'),
  }
  return map[code] ?? t('genericError')
}
