import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import type { OfficeLocation } from '@/lib/data/types'
import { Icon } from '@/components/ui/Icon'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { RevealOnScroll } from '@/components/ui/RevealOnScroll'
import { clsx } from '@/lib/clsx'

type Props = { locations: OfficeLocation[] }

/**
 * Bento-style location mosaic: the first tile spans two columns to break the
 * uniform-grid monotony, remaining tiles fill in around it.
 */
export async function LocationsPreview({ locations }: Props) {
  const t = await getTranslations('locations')

  return (
    <section className="section bg-[var(--color-surface-alt)]" aria-labelledby="locations-heading">
      <div className="container-site">
        <SectionHeading
          eyebrow={t('eyebrow')}
          title={<span id="locations-heading">{t('title')}</span>}
          subtitle={t('subtitle')}
        />

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {locations.map((location, index) => (
            <RevealOnScroll
              key={location.id}
              delay={index * 50}
              className={clsx(index === 0 && 'sm:col-span-2 sm:row-span-2')}
            >
              <Link
                href={`/lokasi/${location.slug}`}
                className={clsx(
                  'group relative block overflow-hidden rounded-[var(--radius-lg)]',
                  index === 0 ? 'aspect-[4/3] sm:h-full sm:aspect-auto' : 'aspect-[4/3]',
                )}
              >
                <Image
                  src={location.photo}
                  alt={`${location.name}, ${location.city}`}
                  fill
                  loading="lazy"
                  sizes={index === 0 ? '(max-width: 640px) 92vw, 46vw' : '(max-width: 640px) 92vw, 23vw'}
                  className="object-cover transition-transform duration-[var(--duration-slow)] group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[rgb(11_46_74/0.85)] via-[rgb(11_46_74/0.2)] to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--brand-300)]">
                    <Icon name="map-pin" className="h-3.5 w-3.5" />
                    {location.city}
                  </p>
                  <p className={clsx('mt-1 font-bold text-white', index === 0 ? 'text-2xl' : 'text-base')}>
                    {location.name}
                  </p>
                </div>
              </Link>
            </RevealOnScroll>
          ))}

          <RevealOnScroll delay={locations.length * 50}>
            <Link
              href="/lokasi"
              className="group flex aspect-[4/3] flex-col items-center justify-center gap-3 rounded-[var(--radius-lg)] border-2 border-dashed border-[var(--brand-300)] bg-white text-[var(--brand-700)] transition-colors hover:border-[var(--brand-500)] hover:bg-[var(--brand-50)]"
            >
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--brand-100)] transition-transform group-hover:scale-110">
                <Icon name="arrow-right" className="h-6 w-6" />
              </span>
              <span className="text-sm font-bold">{t('viewAll')}</span>
            </Link>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  )
}
