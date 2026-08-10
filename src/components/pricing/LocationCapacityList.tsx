import { Icon } from '@/components/ui/Icon'
import { RevealOnScroll } from '@/components/ui/RevealOnScroll'

export type CapacityItem = {
  locationId: string
  locationName: string
  badges: string[]
}

type Props = { title: string; items: CapacityItem[] }

/**
 * Per-location capacity/room list, shared by the Meeting Room and Serviced
 * Office service pages. Renders nothing when there is no data to show —
 * callers are expected to have already filtered to active locations.
 */
export function LocationCapacityList({ title, items }: Props) {
  if (items.length === 0) return null

  return (
    <section className="section pt-0" aria-labelledby="capacity-heading">
      <div className="container-site">
        <h2
          id="capacity-heading"
          className="text-center text-[length:var(--text-xl)] font-extrabold text-[var(--brand-900)]"
        >
          {title}
        </h2>
        <div className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => (
            <RevealOnScroll key={item.locationId} delay={index * 50}>
              <div className="flex h-full flex-col gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-card)]">
                <p className="flex items-center gap-2 text-sm font-bold text-[var(--brand-900)]">
                  <Icon name="map-pin" className="h-4 w-4 shrink-0 text-[var(--brand-600)]" />
                  {item.locationName}
                </p>
                <div className="flex flex-wrap gap-2">
                  {item.badges.map((badge) => (
                    <span
                      key={badge}
                      className="rounded-[var(--radius-pill)] bg-[var(--brand-50)] px-3 py-1 text-xs font-semibold text-[var(--brand-700)]"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  )
}
