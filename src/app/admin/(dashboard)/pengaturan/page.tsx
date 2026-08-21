import { getStore } from '@/lib/data'
import { saveSettingsAction } from '@/app/admin/actions'
import { adminInputClass, Card, Field, PageTitle, SubmitButton } from '@/components/admin/ui'

/** Monday-first to match the booking calendar's own column order. */
const CLOSABLE_WEEKDAYS = [
  { value: 1, label: 'Senin' },
  { value: 2, label: 'Selasa' },
  { value: 3, label: 'Rabu' },
  { value: 4, label: 'Kamis' },
  { value: 5, label: 'Jumat' },
  { value: 6, label: 'Sabtu' },
  { value: 0, label: 'Minggu' },
]

export default async function AdminSettingsPage() {
  const settings = await getStore().getSettings()

  return (
    <>
      <PageTitle title="Pengaturan" subtitle="Kontak, alamat kantor pusat, dan jam operasional booking" />

      <form action={saveSettingsAction} className="max-w-2xl">
        <Card>
          <div className="grid gap-4 md:grid-cols-2">
            <Field
              label="WhatsApp Admin 1 (umum)"
              htmlFor="waNumber"
              hint="Tombol chat mengambang, halaman kontak, tombol paket. Format tanpa +, contoh: 6282262981118"
            >
              <input id="waNumber" name="waNumber" defaultValue={settings.waNumber} className={adminInputClass} />
            </Field>
            <Field
              label="WhatsApp Admin 2 (booking)"
              htmlFor="waNumberBooking"
              hint="Khusus booking ruang rapat dan notifikasi booking"
            >
              <input
                id="waNumberBooking"
                name="waNumberBooking"
                defaultValue={settings.waNumberBooking}
                className={adminInputClass}
              />
            </Field>
            <Field
              label="Email notifikasi (tidak tampil di web)"
              htmlFor="email"
              hint="Kotak masuk internal untuk leads & booking"
            >
              <input id="email" name="email" type="email" defaultValue={settings.email} className={adminInputClass} />
            </Field>
            <Field
              label="Email publik"
              htmlFor="emailSecondary"
              hint="Satu-satunya email yang tampil di footer & halaman kontak; ikut menerima notifikasi"
            >
              <input
                id="emailSecondary"
                name="emailSecondary"
                type="email"
                defaultValue={settings.emailSecondary}
                className={adminInputClass}
              />
            </Field>
            <Field label="Instagram" htmlFor="instagram">
              <input id="instagram" name="instagram" defaultValue={settings.instagram} className={adminInputClass} />
            </Field>
          </div>
          <div className="mt-4">
            <Field label="Alamat kantor pusat" htmlFor="headOffice">
              <textarea id="headOffice" name="headOffice" rows={2} defaultValue={settings.headOffice} className={adminInputClass} />
            </Field>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Field label="Jam buka booking (0 sampai 23)" htmlFor="bookingOpenHour">
              <input
                id="bookingOpenHour"
                name="bookingOpenHour"
                type="number"
                min={0}
                max={23}
                defaultValue={settings.bookingOpenHour}
                className={adminInputClass}
              />
            </Field>
            <Field label="Jam tutup booking (1 sampai 24)" htmlFor="bookingCloseHour">
              <input
                id="bookingCloseHour"
                name="bookingCloseHour"
                type="number"
                min={1}
                max={24}
                defaultValue={settings.bookingCloseHour}
                className={adminInputClass}
              />
            </Field>
          </div>
          <fieldset className="mt-4">
            <legend className="mb-1.5 block text-sm font-semibold text-[var(--brand-900)]">Hari tutup</legend>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {CLOSABLE_WEEKDAYS.map((day) => (
                <label key={day.value} className="flex items-center gap-2 text-sm text-[var(--brand-900)]">
                  <input
                    type="checkbox"
                    name="closedWeekdays"
                    value={day.value}
                    defaultChecked={settings.closedWeekdays.includes(day.value)}
                    className="h-4 w-4"
                  />
                  {day.label}
                </label>
              ))}
            </div>
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">
              Tanggal pada hari yang dicentang tidak bisa dibooking sama sekali.
            </p>
          </fieldset>

          <div className="mt-6">
            <SubmitButton>Simpan Pengaturan</SubmitButton>
          </div>
        </Card>
      </form>
    </>
  )
}
