import type { Metadata } from 'next'
import { hasLocale } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'

import { routing, type Locale } from '@/i18n/routing'
import { getStore } from '@/lib/data'
import { pickL10n } from '@/lib/format'
import { waLink } from '@/lib/whatsapp'
import { Icon } from '@/components/ui/Icon'
import { ContactForm } from '@/components/contact/ContactForm'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) return {}
  const t = await getTranslations({ locale, namespace: 'contact' })
  return {
    title: t('title'),
    description: t('subtitle'),
    alternates: { languages: { id: '/id/kontak', en: '/en/kontak' } },
  }
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()

  const t = await getTranslations('contact')
  const typedLocale = locale as Locale
  const store = getStore()
  const [services, settings] = await Promise.all([store.getServices(), store.getSettings()])

  const serviceOptions = services
    .filter((service) => service.active)
    .map((service) => ({ slug: service.slug, label: pickL10n(service.name, typedLocale) }))

  return (
    <section className="wash-hero pb-[var(--space-section)] pt-28 md:pt-36">
      <div className="container-site">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <h1 className="text-[length:var(--text-hero)] font-extrabold leading-[1.05] tracking-tight text-[var(--brand-900)]">
              {t('title')}
            </h1>
            <p className="mt-5 text-[length:var(--text-lg)] leading-relaxed text-[var(--color-text-muted)]">
              {t('subtitle')}
            </p>

            <ul className="mt-10 space-y-6">
              <li className="flex gap-4">
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--brand-100)] text-[var(--brand-700)]">
                  <Icon name="map-pin" className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-bold text-[var(--brand-900)]">{t('office')}</p>
                  <div className="mt-1 text-sm text-[var(--color-text-muted)]">{settings.headOffice}</div>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--brand-100)] text-[var(--brand-700)]">
                  <Icon name="whatsapp" className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-bold text-[var(--brand-900)]">{t('waLabel')}</p>
                  <div className="mt-1 text-sm">
                    <a
                      href={waLink(settings.waNumber, 'Halo Menara Office')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-[var(--brand-600)]"
                    >
                      +{settings.waNumber}
                    </a>
                  </div>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--brand-100)] text-[var(--brand-700)]">
                  <Icon name="mail" className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-bold text-[var(--brand-900)]">{t('emailLabel')}</p>
                  <div className="mt-1 flex flex-col text-sm">
                    <a href={`mailto:${settings.email}`} className="font-semibold text-[var(--brand-600)]">
                      {settings.email}
                    </a>
                    {settings.emailSecondary ? (
                      <a
                        href={`mailto:${settings.emailSecondary}`}
                        className="font-semibold text-[var(--brand-600)]"
                      >
                        {settings.emailSecondary}
                      </a>
                    ) : null}
                  </div>
                </div>
              </li>
            </ul>
          </div>

          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-lift)] md:p-10">
            <ContactForm serviceOptions={serviceOptions} />
          </div>
        </div>
      </div>
    </section>
  )
}
