import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { Icon } from '@/components/ui/Icon'

/**
 * Hostinger-style hero: oversized headline + dual CTA on the left, layered
 * visual with floating proof-cards on the right, stats band underneath.
 */
export async function Hero() {
  const t = await getTranslations('hero')

  const stats = [
    { value: '6', label: t('statLocations') },
    { value: '3', label: t('statCities') },
    { value: '5', label: t('statServices') },
    { value: '24/7', label: t('statBooking') },
  ]

  return (
    <section className="wash-hero overflow-hidden pb-14 pt-28 md:pt-36" aria-labelledby="hero-heading">
      <div className="container-site">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--brand-200)] bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[var(--brand-700)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-500)]" />
              {t('eyebrow')}
            </p>
            <h1
              id="hero-heading"
              className="text-[length:var(--text-hero)] font-extrabold leading-[1.05] tracking-tight text-[var(--brand-900)]"
            >
              {t('title')}
            </h1>
            <p className="mt-6 max-w-xl text-[length:var(--text-lg)] leading-relaxed text-[var(--color-text-muted)]">
              {t('subtitle')}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/virtual-office"
                className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] bg-[var(--brand-700)] px-7 py-3.5 text-base font-semibold text-white shadow-[0_10px_28px_-10px_rgb(23_93_141/0.7)] transition-[background-color,transform] hover:bg-[var(--brand-800)] active:scale-[0.98]"
              >
                {t('ctaPrimary')}
                <Icon name="arrow-right" className="h-5 w-5" />
              </Link>
              <Link
                href="/kontak"
                className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--brand-200)] bg-white px-7 py-3.5 text-base font-semibold text-[var(--brand-800)] transition-colors hover:border-[var(--brand-500)] hover:text-[var(--brand-600)]"
              >
                {t('ctaSecondary')}
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-lg)] shadow-[var(--shadow-lift)]">
              <Image
                src="/images/locations/menara-karya.webp"
                alt="Menara Karya Tower, lokasi Menara Office di Kuningan, Jakarta Selatan"
                fill
                priority
                fetchPriority="high"
                sizes="(max-width: 1024px) 92vw, 44vw"
                className="object-cover"
              />
            </div>
            {/* Floating proof cards give the layered depth the flat legacy site lacked */}
            <div className="absolute -left-4 bottom-6 hidden rounded-[var(--radius-md)] bg-white/95 px-4 py-3 shadow-[var(--shadow-lift)] backdrop-blur sm:block">
              <p className="flex items-center gap-2 text-sm font-bold text-[var(--brand-900)]">
                <Icon name="map-pin" className="h-4 w-4 text-[var(--brand-500)]" />
                Kuningan · Jakarta
              </p>
              <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">Grade-A Office Tower</p>
            </div>
            <div className="absolute -right-3 top-6 hidden rounded-[var(--radius-md)] bg-[var(--brand-900)] px-4 py-3 text-white shadow-[var(--shadow-lift)] sm:block">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand-300)]">
                Virtual Office
              </p>
              <p className="mt-0.5 text-lg font-extrabold">
                Rp 4 Juta<span className="text-xs font-medium text-[var(--brand-300)]">/bln</span>
              </p>
            </div>
          </div>
        </div>

        <dl className="mt-16 grid grid-cols-2 gap-6 rounded-[var(--radius-lg)] border border-[var(--brand-100)] bg-white/80 p-6 shadow-[var(--shadow-card)] backdrop-blur md:grid-cols-4 md:p-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center md:text-left">
              <dt className="order-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                {stat.label}
              </dt>
              <dd className="order-1 text-3xl font-extrabold tracking-tight text-[var(--brand-700)]">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
