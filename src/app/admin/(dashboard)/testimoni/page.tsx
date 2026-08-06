import { getStore } from '@/lib/data'
import { deleteTestimonialAction, saveTestimonialAction } from '@/app/admin/actions'
import { adminInputClass, Card, Field, PageTitle, StatusBadge, SubmitButton } from '@/components/admin/ui'

export default async function AdminTestimonialsPage() {
  const testimonials = await getStore().getTestimonials()

  return (
    <>
      <PageTitle
        title="Testimoni"
        subtitle="Testimoni aktif tampil di beranda. Bagian ini otomatis tersembunyi di website saat kosong."
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
        <Card>
          <h2 className="mb-4 text-base font-bold text-[var(--brand-900)]">Tambah testimoni</h2>
          <form action={saveTestimonialAction} className="grid gap-4">
            <Field label="Nama klien" htmlFor="t-name">
              <input id="t-name" name="name" required className={adminInputClass} />
            </Field>
            <Field label="Jabatan / usaha" htmlFor="t-role" hint="Contoh: Founder, Kopi Nusantara">
              <input id="t-role" name="role" className={adminInputClass} />
            </Field>
            <Field label="Kutipan (Indonesia)" htmlFor="t-quote-id">
              <textarea id="t-quote-id" name="quote_id" rows={3} required className={adminInputClass} />
            </Field>
            <Field label="Kutipan (English)" htmlFor="t-quote-en">
              <textarea id="t-quote-en" name="quote_en" rows={3} className={adminInputClass} />
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
          {testimonials.length === 0 ? (
            <Card>
              <p className="text-sm text-[var(--color-text-muted)]">
                Belum ada testimoni. Tambahkan kutipan asli dari klien Anda di formulir sebelah.
              </p>
            </Card>
          ) : (
            testimonials.map((testimonial) => (
              <Card key={testimonial.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-[var(--brand-900)]">
                      {testimonial.name}
                      <span className="ml-2 font-normal text-[var(--color-text-muted)]">{testimonial.role}</span>
                    </p>
                    <p className="mt-2 text-sm italic text-[var(--color-text-muted)]">“{testimonial.quote.id}”</p>
                  </div>
                  <StatusBadge status={testimonial.active ? 'active' : 'inactive'} />
                </div>
                <div className="mt-3 flex gap-4">
                  <form action={saveTestimonialAction}>
                    <input type="hidden" name="id" value={testimonial.id} />
                    <input type="hidden" name="name" value={testimonial.name} />
                    <input type="hidden" name="role" value={testimonial.role} />
                    <input type="hidden" name="quote_id" value={testimonial.quote.id} />
                    <input type="hidden" name="quote_en" value={testimonial.quote.en} />
                    <input type="hidden" name="order" value={testimonial.order} />
                    {testimonial.active ? null : <input type="hidden" name="active" value="on" />}
                    <button type="submit" className="text-xs font-semibold text-[var(--brand-600)] hover:underline">
                      {testimonial.active ? 'Sembunyikan' : 'Tampilkan'}
                    </button>
                  </form>
                  <form action={deleteTestimonialAction}>
                    <input type="hidden" name="id" value={testimonial.id} />
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
