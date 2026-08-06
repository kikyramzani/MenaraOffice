import { getStore } from '@/lib/data'
import { formatHour, formatRupiahFull } from '@/lib/format'
import { updateBookingStatusAction } from '@/app/admin/actions'
import { Card, PageTitle, StatusBadge } from '@/components/admin/ui'

export default async function AdminBookingPage() {
  const store = getStore()
  const [bookings, rooms, locations] = await Promise.all([
    store.getBookings(),
    store.getRooms(),
    store.getLocations(),
  ])

  const describeRoom = (roomId: string) => {
    const room = rooms.find((candidate) => candidate.id === roomId)
    if (!room) return { name: roomId, location: '', price: 0 }
    const location = locations.find((candidate) => candidate.id === room.locationId)
    return { name: room.name, location: location?.name ?? '', price: room.pricePerHour }
  }

  return (
    <>
      <PageTitle
        title="Booking Meeting Room"
        subtitle="Konfirmasi atau batalkan permintaan booking. Slot terkonfirmasi otomatis terkunci di kalender"
      />

      <Card className="overflow-x-auto p-0 md:p-0">
        <table className="w-full min-w-[840px] text-left text-sm">
          <thead className="border-b border-[var(--color-border)] bg-[var(--color-surface-alt)] text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
            <tr>
              <th className="px-5 py-3.5">Ruangan</th>
              <th className="px-5 py-3.5">Jadwal</th>
              <th className="px-5 py-3.5">Pemesan</th>
              <th className="px-5 py-3.5">Estimasi</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {bookings.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-[var(--color-text-muted)]">
                  Belum ada booking masuk.
                </td>
              </tr>
            ) : (
              bookings.map((booking) => {
                const room = describeRoom(booking.roomId)
                const hours = booking.endHour - booking.startHour
                return (
                  <tr key={booking.id} className="align-top">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-[var(--brand-900)]">{room.name}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">{room.location}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium">{booking.date}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">
                        {formatHour(booking.startHour)}-{formatHour(booking.endHour)} ({hours} jam)
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium">{booking.name}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">
                        {booking.phone} · {booking.email}
                      </p>
                      {booking.notes ? (
                        <p className="mt-1 max-w-[14rem] text-xs italic text-[var(--color-text-muted)]">
                          “{booking.notes}”
                        </p>
                      ) : null}
                    </td>
                    <td className="px-5 py-4 font-semibold text-[var(--brand-700)]">
                      {formatRupiahFull(room.price * hours)}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={booking.status} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1.5">
                        {booking.status === 'pending' ? (
                          <form action={updateBookingStatusAction}>
                            <input type="hidden" name="id" value={booking.id} />
                            <input type="hidden" name="status" value="confirmed" />
                            <button className="text-xs font-semibold text-[#166534] hover:underline" type="submit">
                              Konfirmasi
                            </button>
                          </form>
                        ) : null}
                        {booking.status !== 'cancelled' ? (
                          <form action={updateBookingStatusAction}>
                            <input type="hidden" name="id" value={booking.id} />
                            <input type="hidden" name="status" value="cancelled" />
                            <button className="text-xs font-semibold text-[var(--color-danger)] hover:underline" type="submit">
                              Batalkan
                            </button>
                          </form>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </Card>
    </>
  )
}
