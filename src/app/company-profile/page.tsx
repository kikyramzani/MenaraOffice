import type { Room } from '@/lib/data/types'

import { getStore } from '@/lib/data'
import { formatHour } from '@/lib/format'

import { AboutPage } from '@/components/profile/AboutPage'
import { BackCoverPage } from '@/components/profile/BackCoverPage'
import { ContactPage } from '@/components/profile/ContactPage'
import { CoverPage } from '@/components/profile/CoverPage'
import { FaqPage } from '@/components/profile/FaqPage'
import { LocationDetailPage } from '@/components/profile/LocationDetailPage'
import { LocationsOverviewPage } from '@/components/profile/LocationsOverviewPage'
import { PartnersPage } from '@/components/profile/PartnersPage'
import { ProcessPage } from '@/components/profile/ProcessPage'
import { ServiceDetailPage } from '@/components/profile/ServiceDetailPage'
import { ServicesOverviewPage } from '@/components/profile/ServicesOverviewPage'
import { SECTION } from '@/components/profile/copy'
import { closedDaysLabel, countCities } from '@/components/profile/facts'
import { TocPage, type TocEntry } from '@/components/profile/TocPage'
import { WhyUsPage } from '@/components/profile/WhyUsPage'

/** Always render against current data — the PDF is generated from this page. */
export const dynamic = 'force-dynamic'

export default async function CompanyProfilePage() {
  const store = getStore()
  const [allServices, allLocations, rooms, testimonials, allPartners, settings] = await Promise.all([
    store.getServices(),
    store.getLocations(),
    store.getRooms(),
    store.getTestimonials(),
    store.getPartners(),
    store.getSettings(),
  ])

  const services = allServices.filter((service) => service.active)
  const locations = allLocations.filter((location) => location.active)
  const partners = allPartners.filter((partner) => partner.active)
  const activeTestimonials = testimonials.filter((testimonial) => testimonial.active)
  const hasTrustPage = partners.length > 0 || activeTestimonials.length > 0

  const roomsByLocation = groupRoomsByLocation(rooms)
  const cityCount = countCities(locations.map((location) => location.city))

  // Sheet numbers, assigned in reading order so the contents page can cite them.
  // Sheet 1 is the cover, which carries no printed number.
  let sheet = 2
  const tocSheet = sheet++
  const aboutSheet = sheet++
  const whySheet = sheet++
  const servicesSheet = sheet++
  const serviceSheets = Object.fromEntries(services.map((service) => [service.slug, sheet++]))
  const locationsSheet = sheet++
  const locationSheets = Object.fromEntries(locations.map((location) => [location.id, sheet++]))
  const processSheet = sheet++
  const faqSheet = sheet++
  const partnersSheet = hasTrustPage ? sheet++ : null
  const contactSheet = sheet++

  const openHour = formatHour(settings.bookingOpenHour)
  const closeHour = formatHour(settings.bookingCloseHour)

  const toc: TocEntry[] = [
    { label: SECTION.about, page: aboutSheet },
    { label: SECTION.why, page: whySheet },
    {
      label: SECTION.services,
      page: servicesSheet,
      children: services.map((service) => service.name.id),
    },
    {
      label: SECTION.locations,
      page: locationsSheet,
      children: locations.map((location) => location.name),
    },
    { label: SECTION.process, page: processSheet },
    { label: SECTION.faq, page: faqSheet },
    ...(partnersSheet ? [{ label: SECTION.partners, page: partnersSheet }] : []),
    { label: SECTION.contact, page: contactSheet },
  ]

  return (
    <main>
      <CoverPage />
      <TocPage number={tocSheet} entries={toc} />
      <AboutPage
        number={aboutSheet}
        locationCount={locations.length}
        cityCount={cityCount}
        serviceCount={services.length}
      />
      <WhyUsPage
        number={whySheet}
        locationCount={locations.length}
        cityCount={cityCount}
        openHour={openHour}
        closeHour={closeHour}
      />

      <ServicesOverviewPage
        number={servicesSheet}
        services={services}
        pageBySlug={serviceSheets}
      />
      {services.map((service) => (
        <ServiceDetailPage
          key={service.id}
          number={serviceSheets[service.slug] ?? 0}
          service={service}
        />
      ))}

      <LocationsOverviewPage
        number={locationsSheet}
        locations={locations}
        roomsByLocation={roomsByLocation}
        pageByLocation={locationSheets}
      />
      {locations.map((location) => (
        <LocationDetailPage
          key={location.id}
          number={locationSheets[location.id] ?? 0}
          location={location}
          rooms={roomsByLocation.get(location.id) ?? []}
        />
      ))}

      <ProcessPage
        number={processSheet}
        openHour={openHour}
        closeHour={closeHour}
        closedDays={closedDaysLabel(settings.closedWeekdays)}
      />
      <FaqPage number={faqSheet} />
      {partnersSheet ? (
        <PartnersPage
          number={partnersSheet}
          partners={partners}
          testimonials={activeTestimonials}
        />
      ) : null}
      <ContactPage number={contactSheet} settings={settings} locations={locations} />
      <BackCoverPage settings={settings} />
    </main>
  )
}

function groupRoomsByLocation(rooms: Room[]): Map<string, Room[]> {
  const grouped = new Map<string, Room[]>()

  for (const room of rooms) {
    if (!room.active) continue
    grouped.set(room.locationId, [...(grouped.get(room.locationId) ?? []), room])
  }

  return grouped
}
