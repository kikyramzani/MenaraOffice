import Image from 'next/image'
import type { Metadata } from 'next'
import { hasLocale } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'

import { Link } from '@/i18n/navigation'
import { routing, type Locale } from '@/i18n/routing'
import { getStore } from '@/lib/data'
import { pickL10n } from '@/lib/format'
import { Icon } from '@/components/ui/Icon'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { RevealOnScroll } from '@/components/ui/RevealOnScroll'
import { CtaBand } from '@/components/home/CtaBand'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) return {}
  const t = await getTranslations({ locale, namespace: 'locations' })
  return {
    title: t('title'),
    description: t('subtitle'),
    alternates: { languages: { id: '/id/lokasi', en: '/en/lokasi' } },
  }
}

export default async function LocationsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()

  const t = await getTranslations('locations')
  const locations = (await getStore().getLocations()).filter((location) => location.active)
  const typedLocale = locale as Locale

  return (
    <>
      <section className="wash-hero pb-14 pt-28 md:pt-36">
        <div className="container-site">
          <SectionHeading as="h1" eyebrow={t('eyebrow')} title={t('title')} subtitle={t('subtitle')} />
        </div>
      </section>

      <section className="section pt-4">
        <div className="container-site grid gap-8 md:grid-cols-2">
          {locations.map((location, index) => (
            <RevealOnScroll key={location.id} delay={index * 50}>
              <article className="group flex h-full flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-lift)]">
                <Link href={`/lokasi/${location.slug}`} className="relative block aspect-[16/9] overflow-hidden">
                  <Image
                    src={location.photo}
                    alt={`${location.name}, ${location.city}`}
                    fill
                    loading="lazy"
                    sizes="(max-width: 768px) 92vw, 46vw"
                    className="object-cover transition-transform duration-[var(--duration-slow)] group-hover:scale-105"
                  />
                </Link>
                <div className="flex flex-1 flex-col p-6">
                  <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--brand-600)]">
                    <Icon name="map-pin" className="h-3.5 w-3.5" />
                    {location.city}
                  </p>
                  <h2 className="mt-1.5 text-xl font-bold text-[var(--brand-900)]">{location.name}</h2>
                  <p className="mt-2 text-sm text-[var(--color-text-muted)]">{location.address}</p>
                  <ul className="mt-4 flex flex-1 flex-wrap gap-2">
                    {location.facilities.map((facility, facilityIndex) => (
                      <li
                        key={facilityIndex}
                        className="h-fit rounded-[var(--radius-pill)] bg-[var(--brand-50)] px-3 py-1 text-xs font-medium text-[var(--brand-700)]"
                      >
                        {pickL10n(facility, typedLocale)}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={`/lokasi/${location.slug}`}
                    className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--brand-600)] hover:text-[var(--brand-700)]"
                  >
                    {t('viewMap')}
                    <Icon name="arrow-right" className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            </RevealOnScroll>
          ))}
        </div>
      </section>

      <CtaBand />
    </>
  )
}
