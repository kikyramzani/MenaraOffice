import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'

import { getSession } from '@/lib/auth'
import { logoutAction } from '@/app/admin/actions'
import { AdminShell } from '@/components/admin/AdminShell'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardLayout({ children }: { children: ReactNode }) {
  const session = await getSession()
  if (!session) redirect('/admin/login')

  return (
    <AdminShell
      email={session.email}
      logoutSlot={
        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full rounded-[var(--radius-md)] border border-white/20 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/10"
          >
            Keluar
          </button>
        </form>
      }
    >
      {children}
    </AdminShell>
  )
}
