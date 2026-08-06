import Link from 'next/link'

import { getStore } from '@/lib/data'
import { Card, PageTitle, StatusBadge } from '@/components/admin/ui'

export default async function AdminLocationsPage() {
  const locations = await getStore().getLocations()

  return (
    <>
      <PageTitle title="Lokasi" subtitle="Kelola alamat, foto, dan fasilitas setiap lokasi" />

      <div className="grid gap-4 md:grid-cols-2">
        {locations.map((location) => (
          <Card key={location.id}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-base font-bold text-[var(--brand-900)]">{location.name}</h2>
                  <StatusBadge status={location.active ? 'active' : 'inactive'} />
                </div>
                <p className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-[var(--brand-600)]">
                  {location.city}
                </p>
                <p className="mt-2 text-sm text-[var(--color-text-muted)]">{location.address}</p>
              </div>
              <Link
                href={`/admin/lokasi/${location.id}`}
                className="shrink-0 rounded-[var(--radius-pill)] border border-[var(--brand-200)] px-5 py-2 text-sm font-semibold text-[var(--brand-700)] transition-colors hover:border-[var(--brand-500)]"
              >
                Edit
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </>
  )
}
