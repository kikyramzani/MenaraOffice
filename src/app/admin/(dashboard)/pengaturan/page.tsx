import { getStore } from '@/lib/data'
import { saveSettingsAction } from '@/app/admin/actions'
import { adminInputClass, Card, Field, PageTitle, SubmitButton } from '@/components/admin/ui'

export default async function AdminSettingsPage() {
  const settings = await getStore().getSettings()

  return (
    <>
      <PageTitle title="Pengaturan" subtitle="Kontak, alamat kantor pusat, dan jam operasional booking" />

      <form action={saveSettingsAction} className="max-w-2xl">
        <Card>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Nomor WhatsApp" htmlFor="waNumber" hint="Format internasional tanpa +, contoh: 6282262981118">
              <input id="waNumber" name="waNumber" defaultValue={settings.waNumber} className={adminInputClass} />
            </Field>
            <Field label="Email" htmlFor="email">
              <input id="email" name="email" type="email" defaultValue={settings.email} className={adminInputClass} />
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
          <div className="mt-6">
            <SubmitButton>Simpan Pengaturan</SubmitButton>
          </div>
        </Card>
      </form>
    </>
  )
}
