import Image from 'next/image'
import type { Metadata } from 'next'
import { hasLocale } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'

import { Link } from '@/i18n/navigation'
import { routing, type Locale } from '@/i18n/routing'
import { getStore } from '@/lib/data'
import { formatRupiahFull, pickL10n } from '@/lib/format'
import { Icon } from '@/components/ui/Icon'
import { RevealOnScroll } from '@/components/ui/RevealOnScroll'
import { PricingSection } from '@/components/pricing/PricingSection'
import { LocationCapacityList, type CapacityItem } from '@/components/pricing/LocationCapacityList'
import { CtaBand } from '@/components/home/CtaBand'

export const dynamic = 'force-dynamic'

type Params = { locale: string; serviceSlug: string }

async function findService(slug: string) {
  const services = await getStore().getServices()
  return services.find((service) => service.slug === slug && service.active) ?? null
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale, serviceSlug } = await params
  if (!hasLocale(routing.locales, locale)) return {}
  const service = await findService(serviceSlug)
  if (!service) return {}

  return {
    title: pickL10n(service.name, locale as Locale),
    description: pickL10n(service.tagline, locale as Locale),
    alternates: {
      languages: { id: `/id/${serviceSlug}`, en: `/en/${serviceSlug}` },
    },
  }
}

export default async function ServicePage({ params }: { params: Promise<Params> }) {
  const { locale, serviceSlug } = await params
  if (!hasLocale(routing.locales, locale)) notFound()

  const service = await findService(serviceSlug)
  if (!service) notFound()

  const t = await getTranslations('services')
  const tBooking = await getTranslations('booking')
  const tHero = await getTranslations('hero')
  const typedLocale = locale as Locale
  const settings = await getStore().getSettings()
  const isMeetingRoom = service.slug === 'meeting-room'
  const isServicedOffice = service.slug === 'serviced-office'

  let capacityItems: CapacityItem[] = []
  let capacityHeading = ''

  if (isMeetingRoom) {
    const store = getStore()
    const [rooms, locations] = await Promise.all([store.getRooms(), store.getLocations()])
    const locationById = new Map(locations.map((location) => [location.id, location]))
    capacityItems = rooms
      .filter((room) => room.active && locationById.get(room.locationId)?.active)
      .map((room) => ({
        locationId: room.locationId,
        locationName: locationById.get(room.locationId)?.name ?? room.name,
        badges: [
          t('capacityPax', { count: room.capacity }),
          `${formatRupiahFull(room.pricePerHour)}${t('perHour')}`,
        ],
      }))
    capacityHeading = t('meetingRoomCapacityHeading')
  } else if (isServicedOffice) {
    const locations = await getStore().getLocations()
    capacityItems = locations
      .filter((location) => location.active && location.servicedOfficeCapacities.length > 0)
      .map((location) => ({
        locationId: location.id,
        locationName: location.name,
        badges: location.servicedOfficeCapacities.map((pax) => t('capacityPax', { count: pax })),
      }))
    capacityHeading = t('servicedOfficeCapacityHeading')
  }

  return (
    <>
      <section className="wash-hero pb-16 pt-28 md:pt-36" aria-labelledby="service-heading">
        <div className="container-site grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--brand-200)] bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[var(--brand-700)]">
              <Icon name={service.icon} className="h-4 w-4" />
              {t('eyebrow')}
            </p>
            <h1
              id="service-heading"
              className="text-[length:var(--text-hero)] font-extrabold leading-[1.05] tracking-tight text-[var(--brand-900)]"
            >
              {pickL10n(service.name, typedLocale)}
            </h1>
            <p className="mt-5 max-w-xl text-[length:var(--text-lg)] leading-relaxed text-[var(--color-text-muted)]">
              {pickL10n(service.description, typedLocale)}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="#pricing"
                className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] bg-[var(--brand-700)] px-7 py-3.5 text-base font-semibold text-white transition-colors hover:bg-[var(--brand-800)]"
              >
                {tHero('ctaPrimary')}
                <Icon name="arrow-right" className="h-5 w-5" />
              </a>
              {isMeetingRoom ? (
                <Link
                  href="/booking"
                  className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--brand-200)] bg-white px-7 py-3.5 text-base font-semibold text-[var(--brand-800)] transition-colors hover:border-[var(--brand-500)]"
                >
                  <Icon name="calendar" className="h-5 w-5" />
                  {tBooking('title')}
                </Link>
              ) : null}
            </div>
          </div>

          <RevealOnScroll>
            <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-lg)] shadow-[var(--shadow-lift)]">
              <Image
                src={service.heroImage}
                alt={pickL10n(service.name, typedLocale)}
                fill
                priority
                sizes="(max-width: 1024px) 92vw, 46vw"
                className="object-cover"
              />
            </div>
          </RevealOnScroll>
        </div>
      </section>

      <section className="section" aria-labelledby="features-heading">
        <div className="container-site">
          <h2 id="features-heading" className="text-center text-[length:var(--text-xl)] font-extrabold text-[var(--brand-900)]">
            {t('features')}
          </h2>
          <ul className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {service.features.map((feature, index) => (
              <li key={index}>
                <RevealOnScroll
                  delay={index * 40}
                  className="flex h-full items-start gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white p-4 shadow-[var(--shadow-card)]"
                >
                  <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--brand-100)] text-[var(--brand-700)]">
                    <Icon name="check" className="h-4 w-4" />
                  </span>
                  <span className="text-sm font-medium text-[var(--color-text)]">
                    {pickL10n(feature, typedLocale)}
                  </span>
                </RevealOnScroll>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <LocationCapacityList title={capacityHeading} items={capacityItems} />

      <PricingSection service={service} locale={typedLocale} waNumber={settings.waNumber} />

      {isMeetingRoom ? (
        <section className="section">
          <div className="container-site text-center">
            <h2 className="text-[length:var(--text-xl)] font-extrabold text-[var(--brand-900)]">
              {tBooking('subtitle')}
            </h2>
            <Link
              href="/booking"
              className="mt-6 inline-flex items-center gap-2 rounded-[var(--radius-pill)] bg-[var(--brand-700)] px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-[var(--brand-800)]"
            >
              <Icon name="calendar" className="h-5 w-5" />
              {tBooking('title')}
            </Link>
          </div>
        </section>
      ) : (
        <CtaBand />
      )}
    </>
  )
}
