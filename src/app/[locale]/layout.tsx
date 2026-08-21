import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server'

import '@/styles/global.css'

import { routing, type Locale } from '@/i18n/routing'
import { getStore } from '@/lib/data'
import { pickL10n } from '@/lib/format'
import { Header, type NavService } from '@/components/site/Header'
import { Footer } from '@/components/site/Footer'
import { WhatsAppFloat } from '@/components/site/WhatsAppFloat'
import { Analytics } from '@/components/site/Analytics'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
})

// All public content is admin-editable, so the whole locale subtree renders
// per-request; page-level `dynamic` exports would be overridden by the
// prerender pass that generateStaticParams triggers, hence it lives here.
export const dynamic = 'force-dynamic'

const SITE_URL = process.env.SITE_URL ?? 'http://localhost:3000'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) return {}

  const t = await getTranslations({ locale, namespace: 'hero' })

  const title = 'Menara Office | Virtual Office, Serviced Office & Meeting Room'
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: title,
      template: '%s | Menara Office',
    },
    description: t('subtitle'),
    alternates: {
      languages: {
        id: '/id',
        en: '/en',
      },
    },
    openGraph: {
      siteName: 'Menara Office',
      type: 'website',
      locale: locale === 'id' ? 'id_ID' : 'en_US',
      images: ['/images/home/hero.webp'],
    },
    icons: {
      icon: [{ url: '/images/logo.png', type: 'image/png' }],
    },
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  setRequestLocale(locale)

  const store = getStore()
  const [services, locations, settings, messages] = await Promise.all([
    store.getServices(),
    store.getLocations(),
    store.getSettings(),
    getMessages({ locale }),
  ])

  const activeServices = services.filter((service) => service.active)
  const navServices: NavService[] = activeServices.map((service) => ({
    slug: service.slug,
    label: pickL10n(service.name, locale as Locale),
  }))

  return (
    <html lang={locale} className={jakarta.variable}>
      <head>
        {/* Without JS the IntersectionObserver reveal never runs, so its
            hidden start state must not apply at all. */}
        <noscript>
          <style>{'.reveal{opacity:1!important;transform:none!important}'}</style>
        </noscript>
      </head>
      <body className="flex min-h-dvh flex-col font-sans">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-[var(--brand-900)] focus:px-5 focus:py-3 focus:text-sm focus:text-white"
        >
          {locale === 'id' ? 'Lewati ke konten' : 'Skip to content'}
        </a>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Header services={navServices} />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer
            locale={locale as Locale}
            services={activeServices}
            locations={locations.filter((location) => location.active)}
            settings={settings}
          />
          <WhatsAppFloat waNumber={settings.waNumber} />
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  )
}
