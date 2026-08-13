import { getStore } from '@/lib/data'
import { weekdayOfIsoDate } from '@/lib/booking-calendar'
import { todayInJakarta } from '@/lib/request-guards'
import { deleteBlockedDateAction, saveBlockedDateAction } from '@/app/admin/actions'
import { adminInputClass, Card, Field, PageTitle, StatusBadge, SubmitButton } from '@/components/admin/ui'

const WEEKDAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']

export default async function AdminBlockedDatesPage() {
  const store = getStore()
  const [blockedDates, locations, bookings] = await Promise.all([
    store.getBlockedDates(),
    store.getLocations(),
    store.getBookings(),
  ])

  const today = todayInJakarta()
  const upcoming = blockedDates.filter((entry) => entry.date >= today)
  const pastCount = blockedDates.length - upcoming.length
  const locationName = (id: string) => locations.find((entry) => entry.id === id)?.name ?? id

  // Blocking a date does not cancel bookings already taken on it, so surface
  // the count and let the admin decide what to cancel from /admin/booking.
  const liveBookingsOn = (date: string) =>
    bookings.filter((booking) => booking.date === date && booking.status !== 'cancelled').length

  return (
    <>
      <PageTitle
        title="Tanggal Libur"
        subtitle="Tanggal di daftar ini tidak bisa dibooking. Sabtu & Minggu sudah otomatis tertutup lewat menu Pengaturan. Libur nasional sisa 2026 sudah terisi; tambahkan cuti bersama dan acara internal secara manual."
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
        <Card>
          <h2 className="mb-4 text-base font-bold text-[var(--brand-900)]">Blokir tanggal baru</h2>
          <form action={saveBlockedDateAction} className="grid gap-4">
            <Field label="Tanggal" htmlFor="bd-date">
              <input id="bd-date" name="date" type="date" required className={adminInputClass} />
            </Field>
            <Field
              label="Sampai tanggal (opsional)"
              htmlFor="bd-date-end"
              hint="Kosongkan untuk memblokir satu hari saja"
            >
              <input id="bd-date-end" name="dateEnd" type="date" className={adminInputClass} />
            </Field>
            <Field label="Keterangan (Indonesia)" htmlFor="bd-label-id">
              <input id="bd-label-id" name="label_id" required className={adminInputClass} />
            </Field>
            <Field label="Keterangan (English)" htmlFor="bd-label-en" hint="Kosongkan untuk memakai teks Indonesia">
              <input id="bd-label-en" name="label_en" className={adminInputClass} />
            </Field>

            <fieldset>
              <legend className="mb-1.5 block text-sm font-semibold text-[var(--brand-900)]">Berlaku untuk</legend>
              <label className="flex items-center gap-2 text-sm text-[var(--brand-900)]">
                <input type="checkbox" name="allLocations" defaultChecked className="h-4 w-4" />
                Semua lokasi
              </label>
              <p className="mt-1 mb-2 text-xs text-[var(--color-text-muted)]">
                Hilangkan centang di atas, lalu pilih lokasi tertentu di bawah.
              </p>
              <div className="flex flex-wrap gap-x-5 gap-y-2">
                {locations.map((location) => (
                  <label key={location.id} className="flex items-center gap-2 text-sm text-[var(--brand-900)]">
                    <input type="checkbox" name="locationIds" value={location.id} className="h-4 w-4" />
                    {location.name}
                  </label>
                ))}
              </div>
            </fieldset>

            <label className="flex items-center gap-2 text-sm font-semibold text-[var(--brand-900)]">
              <input type="checkbox" name="active" defaultChecked className="h-4 w-4" />
              Aktif (benar-benar memblokir booking)
            </label>
            <div>
              <SubmitButton>Tambah</SubmitButton>
            </div>
          </form>
        </Card>

        <div className="grid gap-4">
          {upcoming.length === 0 ? (
            <Card>
              <p className="text-sm text-[var(--color-text-muted)]">
                Belum ada tanggal yang diblokir ke depan.
              </p>
            </Card>
          ) : (
            upcoming.map((entry) => {
              const bookingCount = liveBookingsOn(entry.date)
              return (
                <Card key={entry.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[var(--brand-900)]">
                        {entry.date}
                        <span className="ml-2 font-normal text-[var(--color-text-muted)]">
                          {WEEKDAY_NAMES[weekdayOfIsoDate(entry.date)]}
                        </span>
                      </p>
                      <p className="mt-1 text-sm text-[var(--color-text-muted)]">{entry.label.id}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {entry.locationIds.length === 0 ? (
                          <span className="rounded-[var(--radius-pill)] bg-[var(--brand-50)] px-3 py-1 text-xs font-semibold text-[var(--brand-700)]">
                            Semua lokasi
                          </span>
                        ) : (
                          entry.locationIds.map((id) => (
                            <span
                              key={id}
                              className="rounded-[var(--radius-pill)] bg-[var(--brand-50)] px-3 py-1 text-xs font-semibold text-[var(--brand-700)]"
                            >
                              {locationName(id)}
                            </span>
                          ))
                        )}
                      </div>
                      {bookingCount > 0 ? (
                        <p className="mt-2 text-xs font-semibold text-[var(--color-warning)]">
                          {bookingCount} booking sudah ada pada tanggal ini. Blokir tidak membatalkannya
                          otomatis, batalkan dari menu Booking.
                        </p>
                      ) : null}
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      <StatusBadge status={entry.source} />
                      <StatusBadge status={entry.active ? 'active' : 'inactive'} />
                    </div>
                  </div>

                  <div className="mt-3 flex gap-4">
                    <form action={saveBlockedDateAction}>
                      <input type="hidden" name="id" value={entry.id} />
                      <input type="hidden" name="label_id" value={entry.label.id} />
                      <input type="hidden" name="label_en" value={entry.label.en} />
                      {entry.locationIds.length === 0 ? (
                        <input type="hidden" name="allLocations" value="on" />
                      ) : (
                        entry.locationIds.map((id) => (
                          <input key={id} type="hidden" name="locationIds" value={id} />
                        ))
                      )}
                      {entry.active ? null : <input type="hidden" name="active" value="on" />}
                      <button type="submit" className="text-xs font-semibold text-[var(--brand-600)] hover:underline">
                        {entry.active ? 'Nonaktifkan' : 'Aktifkan'}
                      </button>
                    </form>
                    <form action={deleteBlockedDateAction}>
                      <input type="hidden" name="id" value={entry.id} />
                      <button type="submit" className="text-xs font-semibold text-[var(--color-danger)] hover:underline">
                        Hapus
                      </button>
                    </form>
                  </div>
                </Card>
              )
            })
          )}

          {pastCount > 0 ? (
            <p className="text-xs text-[var(--color-text-muted)]">
              {pastCount} tanggal lampau disembunyikan.
            </p>
          ) : null}
        </div>
      </div>
    </>
  )
}
