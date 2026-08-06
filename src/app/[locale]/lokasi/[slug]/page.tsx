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
import { RevealOnScroll } from '@/components/ui/RevealOnScroll'

export const dynamic = 'force-dynamic'

type Params = { locale: string; slug: string }

async function findLocation(slug: string) {
  const locations = await getStore().getLocations()
  return locations.find((location) => location.slug === slug && location.active) ?? null
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale, slug } = await params
  if (!hasLocale(routing.locales, locale)) return {}
  const location = await findLocation(slug)
  if (!location) return {}
  return {
    title: `${location.name}, ${location.city}`,
    description: location.address,
    alternates: { languages: { id: `/id/lokasi/${slug}`, en: `/en/lokasi/${slug}` } },
  }
}

export default async function LocationDetailPage({ params }: { params: Promise<Params> }) {
  const { locale, slug } = await params
  if (!hasLocale(routing.locales, locale)) notFound()

  const location = await findLocation(slug)
  if (!location) notFound()

  const t = await getTranslations('locations')
  const typedLocale = locale as Locale
  const others = (await getStore().getLocations()).filter(
    (other) => other.active && other.id !== location.id,
  )

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: `Menara Office ${location.name}`,
    address: { '@type': 'PostalAddress', streetAddress: location.address, addressLocality: location.city, addressCountry: 'ID' },
    image: location.photo,
    url: `${process.env.SITE_URL ?? ''}/${locale}/lokasi/${location.slug}`,
  }

  return (
    <>
      {/* <-escape keeps admin-editable text from closing the script tag */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />

      <section className="wash-hero pb-14 pt-28 md:pt-36">
        <div className="container-site grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand-600)]">
              <Icon name="map-pin" className="h-4 w-4" />
              {location.city}
            </p>
            <h1 className="mt-3 text-[length:var(--text-hero)] font-extrabold leading-[1.05] tracking-tight text-[var(--brand-900)]">
              {location.name}
            </h1>
            <p className="mt-4 max-w-lg text-[length:var(--text-lg)] text-[var(--color-text-muted)]">
              {location.address}
            </p>

            <h2 className="mt-8 text-sm font-bold uppercase tracking-wider text-[var(--brand-700)]">
              {t('facilities')}
            </h2>
            <ul className="mt-3 grid max-w-lg gap-2.5 sm:grid-cols-2">
              {location.facilities.map((facility, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-[var(--color-text)]">
                  <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-success)]" />
                  {pickL10n(facility, typedLocale)}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/booking"
                className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] bg-[var(--brand-700)] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--brand-800)]"
              >
                <Icon name="calendar" className="h-4 w-4" />
                {t('bookHere')}
              </Link>
            </div>
          </div>

          <RevealOnScroll>
            <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-lg)] shadow-[var(--shadow-lift)]">
              <Image
                src={location.photo}
                alt={`${location.name}, ${location.city}`}
                fill
                priority
                sizes="(max-width: 1024px) 92vw, 46vw"
                className="object-cover"
              />
            </div>
          </RevealOnScroll>
        </div>
      </section>

      <section className="section pt-6" aria-label="Peta lokasi">
        <div className="container-site">
          <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] shadow-[var(--shadow-card)]">
            <iframe
              title={`Peta ${location.name}`}
              src={`https://www.google.com/maps?q=${encodeURIComponent(location.gmapsQuery)}&output=embed`}
              className="h-[380px] w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </div>
      </section>

      <section className="section bg-[var(--color-surface-alt)]">
        <div className="container-site">
          <h2 className="text-center text-[length:var(--text-xl)] font-extrabold text-[var(--brand-900)]">
            {t('otherLocations')}
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {others.map((other) => (
              <Link
                key={other.id}
                href={`/lokasi/${other.slug}`}
                className="group relative block aspect-[4/3] overflow-hidden rounded-[var(--radius-md)]"
              >
                <Image
                  src={other.photo}
                  alt={other.name}
                  fill
                  loading="lazy"
                  sizes="(max-width: 640px) 92vw, 18vw"
                  className="object-cover transition-transform duration-[var(--duration-slow)] group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[rgb(11_46_74/0.8)] to-transparent" />
                <p className="absolute inset-x-0 bottom-0 p-3 text-sm font-bold text-white">
                  {other.name}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
