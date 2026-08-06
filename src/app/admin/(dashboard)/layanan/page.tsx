import Link from 'next/link'

import { getStore } from '@/lib/data'
import { formatRupiahFull } from '@/lib/format'
import { Card, PageTitle, StatusBadge } from '@/components/admin/ui'

export default async function AdminServicesPage() {
  const services = await getStore().getServices()

  return (
    <>
      <PageTitle title="Layanan & Harga" subtitle="Kelola paket, harga, dan fitur setiap layanan" />

      <div className="grid gap-4">
        {services.map((service) => (
          <Card key={service.id}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold text-[var(--brand-900)]">{service.name.id}</h2>
                  <StatusBadge status={service.active ? 'active' : 'inactive'} />
                </div>
                <p className="mt-1 text-sm text-[var(--color-text-muted)]">{service.tagline.id}</p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {service.tiers.map((tier) => (
                    <li
                      key={tier.id}
                      className="rounded-[var(--radius-pill)] bg-[var(--brand-50)] px-3 py-1.5 text-xs font-semibold text-[var(--brand-800)]"
                    >
                      {tier.name}: {formatRupiahFull(tier.price)}
                      {tier.unit === 'month' ? '/bln' : tier.unit === 'hour' ? '/jam' : ''}
                      {tier.isPopular ? ' ★' : ''}
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                href={`/admin/layanan/${service.id}`}
                className="rounded-[var(--radius-pill)] border border-[var(--brand-200)] px-5 py-2 text-sm font-semibold text-[var(--brand-700)] transition-colors hover:border-[var(--brand-500)]"
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
