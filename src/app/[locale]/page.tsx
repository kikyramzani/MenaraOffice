import { hasLocale } from 'next-intl'
import { notFound } from 'next/navigation'

import { routing, type Locale } from '@/i18n/routing'
import { getStore } from '@/lib/data'
import { Hero } from '@/components/home/Hero'
import { PartnersMarquee } from '@/components/home/PartnersMarquee'
import { ServicesGrid } from '@/components/home/ServicesGrid'
import { LocationsPreview } from '@/components/home/LocationsPreview'
import { Testimonials } from '@/components/home/Testimonials'
import { Faq } from '@/components/home/Faq'
import { CtaBand } from '@/components/home/CtaBand'

// Content is admin-editable; render per-request so edits show immediately.
export const dynamic = 'force-dynamic'

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()

  const store = getStore()
  const [services, locations, testimonials, partners] = await Promise.all([
    store.getServices(),
    store.getLocations(),
    store.getTestimonials(),
    store.getPartners(),
  ])

  return (
    <>
      <Hero />
      <PartnersMarquee partners={partners} />
      <ServicesGrid services={services.filter((s) => s.active)} locale={locale as Locale} />
      <LocationsPreview locations={locations.filter((l) => l.active)} />
      <Testimonials testimonials={testimonials} locale={locale as Locale} />
      <Faq />
      <CtaBand />
    </>
  )
}
