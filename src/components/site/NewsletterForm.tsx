'use client'

import { useState, type FormEvent } from 'react'
import { useTranslations } from 'next-intl'

/**
 * Newsletter signup — stored as a lead (service: "newsletter") so subscribers
 * appear in the admin inbox without a separate mailing-list integration.
 */
export function NewsletterForm() {
  const t = useTranslations('footer')
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle')

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (state === 'sending') return
    setState('sending')
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: 'Newsletter subscriber',
          phone: '000000000',
          email,
          service: 'newsletter',
          message: 'Newsletter subscription from footer',
        }),
      })
      setState(response.ok ? 'done' : 'idle')
    } catch {
      setState('idle')
    }
  }

  if (state === 'done') {
    return <p className="mt-3 text-sm font-medium text-[#7ee2a8]">{t('newsletterSuccess')}</p>
  }

  return (
    <form onSubmit={onSubmit} className="mt-3 flex max-w-sm gap-2">
      <label htmlFor="newsletter-email" className="sr-only">
        {t('newsletterPlaceholder')}
      </label>
      <input
        id="newsletter-email"
        type="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder={t('newsletterPlaceholder')}
        className="w-full rounded-[var(--radius-pill)] border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white placeholder:text-[var(--brand-300)] focus:border-[var(--brand-400)] focus:outline-none"
      />
      <button
        type="submit"
        disabled={state === 'sending'}
        className="shrink-0 rounded-[var(--radius-pill)] bg-[var(--brand-700)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--brand-600)] disabled:opacity-60"
      >
        {t('newsletterButton')}
      </button>
    </form>
  )
}
