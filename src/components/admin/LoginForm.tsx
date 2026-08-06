'use client'

import { useActionState } from 'react'
import { loginAction } from '@/app/admin/actions'

const inputClass =
  'w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white px-4 py-3 text-sm focus:border-[var(--brand-500)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-200)]'

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, null)

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <div>
        <label htmlFor="admin-email" className="mb-1.5 block text-sm font-semibold text-[var(--brand-900)]">
          Email
        </label>
        <input
          id="admin-email"
          name="email"
          type="email"
          required
          autoComplete="username"
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="admin-password" className="mb-1.5 block text-sm font-semibold text-[var(--brand-900)]">
          Password
        </label>
        <input
          id="admin-password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={inputClass}
        />
      </div>

      {state?.error ? (
        <p role="alert" className="rounded-[var(--radius-md)] bg-[#fef2f2] px-4 py-3 text-sm font-medium text-[var(--color-danger)]">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-[var(--radius-pill)] bg-[var(--brand-700)] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--brand-800)] disabled:opacity-60"
      >
        {pending ? 'Memproses…' : 'Masuk'}
      </button>
    </form>
  )
}
