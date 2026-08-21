import type { Metadata } from 'next'
import { hasLocale } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'

import { routing, type Locale } from '@/i18n/routing'
import { getStore } from '@/lib/data'
import { activePromos } from '@/lib/promos'
import { todayInJakarta } from '@/lib/request-guards'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { PromoCard } from '@/components/promo/PromoCard'
import { CtaBand } from '@/components/home/CtaBand'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) return {}
  const t = await getTranslations({ locale, namespace: 'promo' })
  return {
    title: t('metaTitle'),
    description: t('subtitle'),
    alternates: { languages: { id: '/id/promo', en: '/en/promo' } },
  }
}

export default async function PromoPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()

  const t = await getTranslations('promo')
  const typedLocale = locale as Locale
  const settings = await getStore().getSettings()
  const running = activePromos(todayInJakarta())

  return (
    <>
      <section className="wash-hero pb-[var(--space-section)] pt-28 md:pt-36">
        <div className="container-site">
          <SectionHeading as="h1" eyebrow={t('eyebrow')} title={t('title')} subtitle={t('subtitle')} />

          {running.length === 0 ? (
            <p className="mx-auto mt-14 max-w-md rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-9 text-center text-sm text-[var(--color-text-muted)]">
              {t('empty')}
            </p>
          ) : (
            <div className="mx-auto mt-14 grid max-w-5xl gap-8">
              {running.map((promo) => (
                <PromoCard
                  key={promo.id}
                  promo={promo}
                  locale={typedLocale}
                  waNumber={settings.waNumber}
                />
              ))}
            </div>
          )}
        </div>
      </section>
      <CtaBand />
    </>
  )
}
