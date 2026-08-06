import Link from 'next/link'

import { getStore } from '@/lib/data'
import { formatHour } from '@/lib/format'
import { Card, PageTitle, StatusBadge } from '@/components/admin/ui'

export default async function AdminDashboardPage() {
  const store = getStore()
  const [leads, bookings, posts, services] = await Promise.all([
    store.getLeads(),
    store.getBookings(),
    store.getPosts(),
    store.getServices(),
  ])

  const rooms = await store.getRooms()
  const roomName = (roomId: string) => rooms.find((room) => room.id === roomId)?.name ?? roomId

  const stats = [
    { label: 'Leads baru', value: leads.filter((lead) => lead.status === 'new').length, href: '/admin/leads' },
    { label: 'Booking menunggu', value: bookings.filter((b) => b.status === 'pending').length, href: '/admin/booking' },
    { label: 'Artikel terbit', value: posts.filter((post) => post.status === 'published').length, href: '/admin/blog' },
    { label: 'Layanan aktif', value: services.filter((service) => service.active).length, href: '/admin/layanan' },
  ]

  return (
    <>
      <PageTitle title="Dashboard" subtitle="Ringkasan aktivitas website Menara Office" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="transition-shadow hover:shadow-[var(--shadow-lift)]">
              <p className="text-3xl font-extrabold text-[var(--brand-700)]">{stat.value}</p>
              <p className="mt-1 text-sm font-semibold text-[var(--color-text-muted)]">{stat.label}</p>
            </Card>
          </Link>
        ))}
      </div>

      {/* overflow-hidden zeroes the grid items' automatic minimum size so long
          lead emails cannot force the column wider than small viewports */}
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card className="min-w-0 overflow-hidden">
          <h2 className="text-base font-bold text-[var(--brand-900)]">Leads terbaru</h2>
          {leads.length === 0 ? (
            <p className="mt-3 text-sm text-[var(--color-text-muted)]">Belum ada leads masuk.</p>
          ) : (
            <ul className="mt-3 divide-y divide-[var(--color-border)]">
              {leads.slice(0, 5).map((lead) => (
                <li key={lead.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[var(--brand-900)]">{lead.name}</p>
                    <p className="truncate text-xs text-[var(--color-text-muted)]">
                      {lead.service || '·'} · {lead.phone}
                    </p>
                  </div>
                  <StatusBadge status={lead.status} />
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="min-w-0 overflow-hidden">
          <h2 className="text-base font-bold text-[var(--brand-900)]">Booking terbaru</h2>
          {bookings.length === 0 ? (
            <p className="mt-3 text-sm text-[var(--color-text-muted)]">Belum ada booking masuk.</p>
          ) : (
            <ul className="mt-3 divide-y divide-[var(--color-border)]">
              {bookings.slice(0, 5).map((booking) => (
                <li key={booking.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[var(--brand-900)]">
                      {roomName(booking.roomId)}
                    </p>
                    <p className="truncate text-xs text-[var(--color-text-muted)]">
                      {booking.date} · {formatHour(booking.startHour)}-{formatHour(booking.endHour)} · {booking.name}
                    </p>
                  </div>
                  <StatusBadge status={booking.status} />
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  )
}
