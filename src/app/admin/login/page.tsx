import Image from 'next/image'
import { redirect } from 'next/navigation'

import { getSession } from '@/lib/auth'
import { LoginForm } from '@/components/admin/LoginForm'

export default async function AdminLoginPage() {
  const session = await getSession()
  if (session) redirect('/admin')

  return (
    <main className="wash-hero flex min-h-dvh items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-8 shadow-[var(--shadow-lift)]">
        <Image
          src="/images/logo.png"
          alt="Menara Office"
          width={150}
          height={58}
          priority
          className="mx-auto h-10 w-auto"
        />
        <h1 className="mt-6 text-center text-xl font-extrabold text-[var(--brand-900)]">
          Panel Administrator
        </h1>
        <p className="mt-1 text-center text-sm text-[var(--color-text-muted)]">
          Masuk untuk mengelola konten website
        </p>
        <LoginForm />
      </div>
    </main>
  )
}
