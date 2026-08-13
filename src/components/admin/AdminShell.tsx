'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState, type ReactNode } from 'react'
import { clsx } from '@/lib/clsx'
import { Icon, type IconName } from '@/components/ui/Icon'

type NavItem = { href: string; label: string; icon: IconName }

const NAV_ITEMS: NavItem[] = [
  { href: '/admin', label: 'Dashboard', icon: 'globe' },
  { href: '/admin/leads', label: 'Leads', icon: 'mail' },
  { href: '/admin/booking', label: 'Booking', icon: 'calendar' },
  { href: '/admin/tanggal-libur', label: 'Tanggal Libur', icon: 'clock' },
  { href: '/admin/layanan', label: 'Layanan & Harga', icon: 'building' },
  { href: '/admin/lokasi', label: 'Lokasi', icon: 'map-pin' },
  { href: '/admin/ruangan', label: 'Ruang Rapat', icon: 'meeting' },
  { href: '/admin/blog', label: 'Tips Bisnis', icon: 'document' },
  { href: '/admin/testimoni', label: 'Testimoni', icon: 'users' },
  { href: '/admin/partner', label: 'Our Partner', icon: 'handshake' },
  { href: '/admin/pengaturan', label: 'Pengaturan', icon: 'desk' },
]

type Props = {
  email: string
  logoutSlot: ReactNode
  children: ReactNode
}

/** Responsive admin chrome: fixed sidebar ≥lg, slide-in drawer below. */
export function AdminShell({ email, logoutSlot, children }: Props) {
  const pathname = usePathname()
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    setDrawerOpen(false)
  }, [pathname])

  const nav = (
    <nav aria-label="Admin navigation" className="flex flex-1 flex-col gap-1 p-4">
      {NAV_ITEMS.map((item) => {
        const isActive =
          item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              'flex items-center gap-3 rounded-[var(--radius-md)] px-3.5 py-2.5 text-sm font-semibold transition-colors',
              isActive
                ? 'bg-[var(--brand-700)] text-white'
                : 'text-[var(--brand-100)] hover:bg-white/10 hover:text-white',
            )}
          >
            <Icon name={item.icon} className="h-[18px] w-[18px]" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )

  const sidebarFooter = (
    <div className="border-t border-white/10 p-4">
      <p className="truncate px-2 text-xs text-[var(--brand-300)]">{email}</p>
      <div className="mt-2">{logoutSlot}</div>
    </div>
  )

  return (
    <div className="flex min-h-dvh">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-[var(--brand-900)] lg:flex">
        <div className="flex h-16 items-center gap-3 border-b border-white/10 px-6">
          <Image src="/images/logo-white.png" alt="Menara Office" width={120} height={46} className="h-8 w-auto" />
        </div>
        {nav}
        {sidebarFooter}
      </aside>

      {/* Mobile drawer */}
      {drawerOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Tutup menu"
            className="absolute inset-0 bg-black/50"
            onClick={() => setDrawerOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-[var(--brand-900)]">
            <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
              <Image src="/images/logo-white.png" alt="Menara Office" width={110} height={42} className="h-7 w-auto" />
              <button
                type="button"
                aria-label="Tutup menu"
                className="rounded-md p-2 text-white"
                onClick={() => setDrawerOpen(false)}
              >
                <Icon name="close" className="h-5 w-5" />
              </button>
            </div>
            {nav}
            {sidebarFooter}
          </aside>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        {/* Mobile topbar */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-[var(--color-border)] bg-white px-4 lg:hidden">
          <button
            type="button"
            aria-label="Buka menu"
            className="rounded-md p-2 text-[var(--brand-900)]"
            onClick={() => setDrawerOpen(true)}
          >
            <Icon name="menu" className="h-5 w-5" />
          </button>
          <p className="text-sm font-bold text-[var(--brand-900)]">Admin Menara Office</p>
        </header>

        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  )
}
