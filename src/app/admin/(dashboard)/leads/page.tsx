import { getStore } from '@/lib/data'
import { updateLeadStatusAction } from '@/app/admin/actions'
import { Card, PageTitle, StatusBadge } from '@/components/admin/ui'

export default async function AdminLeadsPage() {
  const leads = await getStore().getLeads()

  return (
    <>
      <PageTitle title="Leads" subtitle="Pesan masuk dari form kontak dan newsletter" />

      <Card className="overflow-x-auto p-0 md:p-0">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-[var(--color-border)] bg-[var(--color-surface-alt)] text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
            <tr>
              <th className="px-5 py-3.5">Nama</th>
              <th className="px-5 py-3.5">Kontak</th>
              <th className="px-5 py-3.5">Layanan</th>
              <th className="px-5 py-3.5">Pesan</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {leads.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-[var(--color-text-muted)]">
                  Belum ada leads masuk.
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead.id} className="align-top">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-[var(--brand-900)]">{lead.name}</p>
                    <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                      {new Date(lead.createdAt).toLocaleString('id-ID')}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <p>{lead.phone}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">{lead.email}</p>
                  </td>
                  <td className="px-5 py-4">{lead.service || '·'}</td>
                  <td className="max-w-[16rem] px-5 py-4">
                    <p className="line-clamp-3 text-[var(--color-text-muted)]">{lead.message}</p>
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={lead.status} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-col gap-1.5">
                      {lead.status !== 'contacted' ? (
                        <form action={updateLeadStatusAction}>
                          <input type="hidden" name="id" value={lead.id} />
                          <input type="hidden" name="status" value="contacted" />
                          <button className="text-xs font-semibold text-[var(--brand-600)] hover:underline" type="submit">
                            Tandai dihubungi
                          </button>
                        </form>
                      ) : null}
                      {lead.status !== 'closed' ? (
                        <form action={updateLeadStatusAction}>
                          <input type="hidden" name="id" value={lead.id} />
                          <input type="hidden" name="status" value="closed" />
                          <button className="text-xs font-semibold text-[var(--color-text-muted)] hover:underline" type="submit">
                            Tutup
                          </button>
                        </form>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </>
  )
}
