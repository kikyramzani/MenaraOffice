import type { Metadata } from 'next'
import { hasLocale } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'

import { routing } from '@/i18n/routing'
import { getStore } from '@/lib/data'
import { toDateBlockRules } from '@/lib/booking-calendar'
import { todayInJakarta } from '@/lib/request-guards'
import { SectionHeading } from '@/components/ui/SectionHeading'
import {
  BookingWidget,
  type BookingLocation,
  type BookingRoom,
} from '@/components/booking/BookingWidget'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) return {}
  const t = await getTranslations({ locale, namespace: 'booking' })
  return {
    title: t('title'),
    description: t('subtitle'),
    alternates: { languages: { id: '/id/booking', en: '/en/booking' } },
  }
}

export default async function BookingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()

  const t = await getTranslations('booking')
  const store = getStore()
  const [locations, rooms, settings, blockedDates] = await Promise.all([
    store.getLocations(),
    store.getRooms(),
    store.getSettings(),
    store.getBlockedDates(),
  ])

  // Shipped as props rather than fetched per month: the list is small, and the
  // visitor can page the calendar arbitrarily far ahead or switch location,
  // both of which would otherwise cost a round-trip each. The server guard in
  // /api/bookings remains the correctness boundary; this is a UX hint.
  const today = todayInJakarta()
  const upcomingBlocks = toDateBlockRules(blockedDates).filter((entry) => entry.date >= today)

  const activeRooms: BookingRoom[] = rooms
    .filter((room) => room.active)
    .map((room) => ({
      id: room.id,
      name: room.name,
      capacity: room.capacity,
      pricePerHour: room.pricePerHour,
      locationId: room.locationId,
    }))

  const roomLocationIds = new Set(activeRooms.map((room) => room.locationId))
  const bookableLocations: BookingLocation[] = locations
    .filter((location) => location.active && roomLocationIds.has(location.id))
    .map((location) => ({ id: location.id, name: location.name, city: location.city }))

  return (
    <section className="wash-hero pb-[var(--space-section)] pt-28 md:pt-36">
      <div className="container-site">
        <SectionHeading as="h1" title={t('title')} subtitle={t('subtitle')} />
        <div className="mt-12">
          <BookingWidget
            locations={bookableLocations}
            rooms={activeRooms}
            blockedDates={upcomingBlocks}
            closedWeekdays={settings.closedWeekdays}
            waNumberBooking={settings.waNumberBooking || settings.waNumber}
          />
        </div>
      </div>
    </section>
  )
}
