import { notFound } from 'next/navigation'

import { getStore } from '@/lib/data'
import { saveLocationAction } from '@/app/admin/actions'
import { adminInputClass, Card, Field, PageTitle, SubmitButton } from '@/components/admin/ui'

export default async function AdminLocationEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const locations = await getStore().getLocations()
  const location = locations.find((candidate) => candidate.id === id)
  if (!location) notFound()

  return (
    <>
      <PageTitle title={`Edit: ${location.name}`} />

      <form action={saveLocationAction} className="max-w-3xl">
        <input type="hidden" name="id" value={location.id} />
        <Card>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Nama lokasi" htmlFor="name">
              <input id="name" name="name" defaultValue={location.name} required className={adminInputClass} />
            </Field>
            <Field label="Kota" htmlFor="city">
              <input id="city" name="city" defaultValue={location.city} required className={adminInputClass} />
            </Field>
          </div>
          <div className="mt-4">
            <Field label="Alamat lengkap" htmlFor="address">
              <textarea id="address" name="address" rows={2} defaultValue={location.address} className={adminInputClass} />
            </Field>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Field label="URL foto" htmlFor="photo" hint="Path lokal (/images/…) atau URL https">
              <input id="photo" name="photo" defaultValue={location.photo} className={adminInputClass} />
            </Field>
            <Field label="Pencarian Google Maps" htmlFor="gmapsQuery" hint="Teks pencarian untuk peta embed">
              <input id="gmapsQuery" name="gmapsQuery" defaultValue={location.gmapsQuery} className={adminInputClass} />
            </Field>
          </div>
          <div className="mt-4">
            <Field label="Fasilitas" htmlFor="facilities" hint="Satu fasilitas per baris: Indonesia | English">
              <textarea
                id="facilities"
                name="facilities"
                rows={5}
                defaultValue={location.facilities.map((facility) => `${facility.id} | ${facility.en}`).join('\n')}
                className={adminInputClass}
              />
            </Field>
          </div>
          <div className="mt-4">
            <Field
              label="Kapasitas Serviced Office (pax)"
              htmlFor="servicedOfficeCapacities"
              hint="Angka dipisah koma, contoh: 2, 3, 4 — kosongkan jika Serviced Office tidak tersedia di lokasi ini"
            >
              <input
                id="servicedOfficeCapacities"
                name="servicedOfficeCapacities"
                defaultValue={location.servicedOfficeCapacities.join(', ')}
                className={adminInputClass}
              />
            </Field>
          </div>
          <label className="mt-4 flex items-center gap-2 text-sm font-semibold text-[var(--brand-900)]">
            <input type="checkbox" name="active" defaultChecked={location.active} className="h-4 w-4" />
            Lokasi aktif (tampil di website)
          </label>
          <div className="mt-6">
            <SubmitButton>Simpan Perubahan</SubmitButton>
          </div>
        </Card>
      </form>
    </>
  )
}
