import Image from 'next/image'

import { getStore } from '@/lib/data'
import { deletePartnerAction, savePartnerAction } from '@/app/admin/actions'
import { adminInputClass, Card, Field, PageTitle, StatusBadge, SubmitButton } from '@/components/admin/ui'

export default async function AdminPartnersPage() {
  const partners = await getStore().getPartners()

  return (
    <>
      <PageTitle
        title="Our Partner"
        subtitle="Logo mitra tampil sebagai marquee di beranda. Bagian ini otomatis tersembunyi saat kosong."
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
        <Card>
          <h2 className="mb-4 text-base font-bold text-[var(--brand-900)]">Tambah partner</h2>
          <form action={savePartnerAction} className="grid gap-4">
            <Field label="Nama partner" htmlFor="p-name">
              <input id="p-name" name="name" required className={adminInputClass} />
            </Field>
            <Field
              label="URL logo"
              htmlFor="p-logo"
              hint="Path lokal (/images/partners/…) atau URL https, latar transparan disarankan"
            >
              <input id="p-logo" name="logo" required className={adminInputClass} />
            </Field>
            <Field label="Website (opsional)" htmlFor="p-website" hint="Logo akan bisa diklik jika diisi">
              <input id="p-website" name="website" type="url" placeholder="https://" className={adminInputClass} />
            </Field>
            <label className="flex items-center gap-2 text-sm font-semibold text-[var(--brand-900)]">
              <input type="checkbox" name="active" defaultChecked className="h-4 w-4" />
              Tampilkan di website
            </label>
            <div>
              <SubmitButton>Tambah</SubmitButton>
            </div>
          </form>
        </Card>

        <div className="grid gap-4">
          {partners.length === 0 ? (
            <Card>
              <p className="text-sm text-[var(--color-text-muted)]">
                Belum ada partner. Tambahkan logo mitra Anda di formulir sebelah.
              </p>
            </Card>
          ) : (
            partners.map((partner) => (
              <Card key={partner.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-24 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-white p-2">
                      <Image
                        src={partner.logo}
                        alt={partner.name}
                        width={80}
                        height={40}
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[var(--brand-900)]">{partner.name}</p>
                      {partner.website ? (
                        <p className="text-xs text-[var(--color-text-muted)]">{partner.website}</p>
                      ) : null}
                    </div>
                  </div>
                  <StatusBadge status={partner.active ? 'active' : 'inactive'} />
                </div>
                <div className="mt-3 flex gap-4">
                  <form action={savePartnerAction}>
                    <input type="hidden" name="id" value={partner.id} />
                    <input type="hidden" name="name" value={partner.name} />
                    <input type="hidden" name="logo" value={partner.logo} />
                    <input type="hidden" name="website" value={partner.website} />
                    <input type="hidden" name="order" value={partner.order} />
                    {partner.active ? null : <input type="hidden" name="active" value="on" />}
                    <button type="submit" className="text-xs font-semibold text-[var(--brand-600)] hover:underline">
                      {partner.active ? 'Sembunyikan' : 'Tampilkan'}
                    </button>
                  </form>
                  <form action={deletePartnerAction}>
                    <input type="hidden" name="id" value={partner.id} />
                    <button type="submit" className="text-xs font-semibold text-[var(--color-danger)] hover:underline">
                      Hapus
                    </button>
                  </form>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </>
  )
}
