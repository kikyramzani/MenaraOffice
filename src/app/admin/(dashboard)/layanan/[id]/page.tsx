import { notFound } from 'next/navigation'

import { getStore } from '@/lib/data'
import type { L10n } from '@/lib/data/types'
import { saveServiceAction } from '@/app/admin/actions'
import { adminInputClass, Card, Field, PageTitle, SubmitButton } from '@/components/admin/ui'

function featureLines(features: L10n[]): string {
  return features.map((feature) => `${feature.id} | ${feature.en}`).join('\n')
}

export default async function AdminServiceEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const services = await getStore().getServices()
  const service = services.find((candidate) => candidate.id === id)
  if (!service) notFound()

  const tiers = [...service.tiers].sort((a, b) => a.order - b.order)
  const popularIndex = tiers.findIndex((tier) => tier.isPopular)

  return (
    <>
      <PageTitle title={`Edit: ${service.name.id}`} subtitle="Perubahan langsung tampil di website setelah disimpan" />

      <form action={saveServiceAction} className="grid max-w-4xl gap-6">
        <input type="hidden" name="id" value={service.id} />
        <input type="hidden" name="tierCount" value={tiers.length} />

        <Card>
          <h2 className="mb-4 text-base font-bold text-[var(--brand-900)]">Informasi layanan</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Nama (Indonesia)" htmlFor="name_id">
              <input id="name_id" name="name_id" defaultValue={service.name.id} required className={adminInputClass} />
            </Field>
            <Field label="Nama (English)" htmlFor="name_en">
              <input id="name_en" name="name_en" defaultValue={service.name.en} required className={adminInputClass} />
            </Field>
            <Field label="Tagline (Indonesia)" htmlFor="tagline_id">
              <textarea id="tagline_id" name="tagline_id" rows={2} defaultValue={service.tagline.id} className={adminInputClass} />
            </Field>
            <Field label="Tagline (English)" htmlFor="tagline_en">
              <textarea id="tagline_en" name="tagline_en" rows={2} defaultValue={service.tagline.en} className={adminInputClass} />
            </Field>
            <Field label="Deskripsi (Indonesia)" htmlFor="description_id">
              <textarea id="description_id" name="description_id" rows={4} defaultValue={service.description.id} className={adminInputClass} />
            </Field>
            <Field label="Deskripsi (English)" htmlFor="description_en">
              <textarea id="description_en" name="description_en" rows={4} defaultValue={service.description.en} className={adminInputClass} />
            </Field>
          </div>
          <div className="mt-4">
            <Field
              label="Fitur layanan"
              htmlFor="features"
              hint="Satu fitur per baris, format: teks Indonesia | teks English"
            >
              <textarea id="features" name="features" rows={6} defaultValue={featureLines(service.features)} className={adminInputClass} />
            </Field>
          </div>
          <label className="mt-4 flex items-center gap-2 text-sm font-semibold text-[var(--brand-900)]">
            <input type="checkbox" name="active" defaultChecked={service.active} className="h-4 w-4" />
            Layanan aktif (tampil di website)
          </label>
        </Card>

        <Card>
          <h2 className="mb-1 text-base font-bold text-[var(--brand-900)]">Paket harga</h2>
          <p className="mb-4 text-xs text-[var(--color-text-muted)]">
            Pilih satu paket sebagai “Paling Populer”. Paket itu akan disorot di website.
          </p>
          <div className="grid gap-5">
            {tiers.map((tier, index) => (
              <fieldset key={tier.id} className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-4">
                <legend className="px-1 text-sm font-bold text-[var(--brand-800)]">Paket {index + 1}</legend>
                <div className="grid gap-4 md:grid-cols-3">
                  <Field label="Nama paket" htmlFor={`tier_${index}_name`}>
                    <input id={`tier_${index}_name`} name={`tier_${index}_name`} defaultValue={tier.name} className={adminInputClass} />
                  </Field>
                  <Field label="Harga (Rp)" htmlFor={`tier_${index}_price`}>
                    <input
                      id={`tier_${index}_price`}
                      name={`tier_${index}_price`}
                      type="number"
                      min={0}
                      step={1000}
                      defaultValue={tier.price}
                      className={adminInputClass}
                    />
                  </Field>
                  <Field label="Satuan harga" htmlFor={`tier_${index}_unit`}>
                    <select
                      id={`tier_${index}_unit`}
                      name={`tier_${index}_unit`}
                      defaultValue={tier.unit}
                      className={adminInputClass}
                    >
                      <option value="month">per bulan</option>
                      <option value="year">per tahun</option>
                      <option value="hour">per jam</option>
                      <option value="once">sekali bayar</option>
                    </select>
                  </Field>
                  <div className="flex items-end pb-1">
                    <label className="flex items-center gap-2 text-sm font-semibold text-[var(--brand-900)]">
                      <input
                        type="radio"
                        name="popularTier"
                        value={String(index)}
                        defaultChecked={index === popularIndex}
                        className="h-4 w-4"
                      />
                      Paling Populer
                    </label>
                  </div>
                  <Field label="Catatan harga (Indonesia)" htmlFor={`tier_${index}_note_id`}>
                    <input id={`tier_${index}_note_id`} name={`tier_${index}_note_id`} defaultValue={tier.priceNote.id} className={adminInputClass} />
                  </Field>
                  <Field label="Catatan harga (English)" htmlFor={`tier_${index}_note_en`}>
                    <input id={`tier_${index}_note_en`} name={`tier_${index}_note_en`} defaultValue={tier.priceNote.en} className={adminInputClass} />
                  </Field>
                </div>
                <div className="mt-4">
                  <Field label="Fitur paket" htmlFor={`tier_${index}_features`} hint="Satu fitur per baris: Indonesia | English">
                    <textarea
                      id={`tier_${index}_features`}
                      name={`tier_${index}_features`}
                      rows={4}
                      defaultValue={featureLines(tier.features)}
                      className={adminInputClass}
                    />
                  </Field>
                </div>
              </fieldset>
            ))}
          </div>
        </Card>

        <div>
          <SubmitButton>Simpan Perubahan</SubmitButton>
        </div>
      </form>
    </>
  )
}
