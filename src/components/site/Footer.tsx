import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import type { OfficeLocation, Service, SiteSettings } from '@/lib/data/types'
import { pickL10n } from '@/lib/format'
import { waLink } from '@/lib/whatsapp'
import { Icon } from '@/components/ui/Icon'
import { NewsletterForm } from './NewsletterForm'

type Props = {
  locale: Locale
  services: Service[]
  locations: OfficeLocation[]
  settings: SiteSettings
}

export async function Footer({ locale, services, locations, settings }: Props) {
  const t = await getTranslations('footer')
  const tNav = await getTranslations('nav')
  const year = new Date().getFullYear()

  return (
    <footer className="wash-navy mt-auto">
      <div className="container-site pb-10 pt-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <Image
              src="/images/logo-white.png"
              alt="Menara Office"
              width={170}
              height={65}
              className="h-11 w-auto"
            />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-[var(--brand-200)]">
              {t('tagline')}
            </p>
            <div className="mt-6">
              <p className="text-sm font-bold text-white">{t('newsletter')}</p>
              <NewsletterForm />
            </div>
          </div>

          <nav aria-label={t('services')}>
            <p className="text-sm font-bold uppercase tracking-wider text-[var(--brand-300)]">
              {t('services')}
            </p>
            <ul className="mt-4 space-y-2.5">
              {services.map((service) => (
                <li key={service.id}>
                  <Link
                    href={`/${service.slug}`}
                    className="text-sm text-[var(--brand-100)] transition-colors hover:text-white"
                  >
                    {pickL10n(service.name, locale)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label={t('company')}>
            <p className="text-sm font-bold uppercase tracking-wider text-[var(--brand-300)]">
              {t('company')}
            </p>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link href="/tentang-kami" className="text-sm text-[var(--brand-100)] hover:text-white">
                  {tNav('about')}
                </Link>
              </li>
              <li>
                <Link href="/lokasi" className="text-sm text-[var(--brand-100)] hover:text-white">
                  {tNav('locations')}
                </Link>
              </li>
              <li>
                <Link href="/tips-bisnis" className="text-sm text-[var(--brand-100)] hover:text-white">
                  {tNav('blog')}
                </Link>
              </li>
              <li>
                <Link href="/booking" className="text-sm text-[var(--brand-100)] hover:text-white">
                  {tNav('bookRoom')}
                </Link>
              </li>
              <li>
                <Link href="/kontak" className="text-sm text-[var(--brand-100)] hover:text-white">
                  {tNav('contact')}
                </Link>
              </li>
            </ul>
          </nav>

          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-[var(--brand-300)]">
              {t('contact')}
            </p>
            <ul className="mt-4 space-y-3 text-sm text-[var(--brand-100)]">
              <li className="flex gap-2.5">
                <Icon name="map-pin" className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand-300)]" />
                <span>{settings.headOffice}</span>
              </li>
              <li>
                <a
                  href={waLink(settings.waNumber, 'Halo Menara Office')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 hover:text-white"
                >
                  <Icon name="whatsapp" className="h-4 w-4 shrink-0 text-[var(--brand-300)]" />
                  +{settings.waNumber}
                  <span className="text-xs text-[var(--brand-300)]">{t('admin1')}</span>
                </a>
              </li>
              {settings.waNumberBooking ? (
                <li>
                  <a
                    href={waLink(settings.waNumberBooking, 'Halo Menara Office')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 hover:text-white"
                  >
                    <Icon name="whatsapp" className="h-4 w-4 shrink-0 text-[var(--brand-300)]" />
                    +{settings.waNumberBooking}
                    <span className="text-xs text-[var(--brand-300)]">{t('admin2')}</span>
                  </a>
                </li>
              ) : null}
              {/* Hanya alamat publik yang ditampilkan; `email` adalah kotak
                  masuk internal untuk notifikasi. */}
              <li>
                <a
                  href={`mailto:${settings.emailSecondary || settings.email}`}
                  className="flex items-center gap-2.5 hover:text-white"
                >
                  <Icon name="mail" className="h-4 w-4 shrink-0 text-[var(--brand-300)]" />
                  {settings.emailSecondary || settings.email}
                </a>
              </li>
            </ul>
            <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-[var(--brand-300)]">
              {t('locations')}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-[var(--brand-200)]">
              {locations.map((location) => location.name).join(' · ')}
            </p>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 text-center text-xs text-[var(--brand-300)]">
          © {year} {t('rights')}
        </div>
      </div>
    </footer>
  )
}
