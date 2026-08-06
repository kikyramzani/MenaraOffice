import Image from 'next/image'
import type { Metadata } from 'next'
import { hasLocale } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'

import { routing } from '@/i18n/routing'
import { getStore } from '@/lib/data'
import { Icon, type IconName } from '@/components/ui/Icon'
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
  const t = await getTranslations({ locale, namespace: 'about' })
  return {
    title: t('eyebrow'),
    description: t('body1'),
    alternates: { languages: { id: '/id/tentang-kami', en: '/en/tentang-kami' } },
  }
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()

  const t = await getTranslations('about')
  const locations = (await getStore().getLocations()).filter((location) => location.active)

  const missions: { icon: IconName; title: string; body: string }[] = [
    { icon: 'document', title: t('mission1Title'), body: t('mission1Body') },
    { icon: 'check', title: t('mission2Title'), body: t('mission2Body') },
    { icon: 'users', title: t('mission3Title'), body: t('mission3Body') },
  ]

  return (
    <>
      <section className="wash-hero pb-16 pt-28 md:pt-36">
        <div className="container-site grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand-600)]">
              {t('eyebrow')}
            </p>
            <h1 className="text-[length:var(--text-hero)] font-extrabold leading-[1.05] tracking-tight text-[var(--brand-900)]">
              {t('title')}
            </h1>
            <p className="mt-6 text-[length:var(--text-lg)] leading-relaxed text-[var(--color-text-muted)]">
              {t('body1')}
            </p>
            <p className="mt-4 text-[length:var(--text-lg)] leading-relaxed text-[var(--color-text-muted)]">
              {t('body2')}
            </p>
          </div>
          <RevealOnScroll>
            <div className="grid grid-cols-2 gap-4">
              {locations.slice(0, 4).map((location, index) => (
                <div
                  key={location.id}
                  className={`relative overflow-hidden rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] ${index % 2 === 1 ? 'mt-8' : ''} aspect-[3/4]`}
                >
                  <Image
                    src={location.photo}
                    alt={location.name}
                    fill
                    loading={index < 2 ? 'eager' : 'lazy'}
                    sizes="(max-width: 1024px) 46vw, 22vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </RevealOnScroll>
        </div>
      </section>

      <section className="section" aria-labelledby="mission-heading">
        <div className="container-site">
          <h2 id="mission-heading" className="text-center text-[length:var(--text-2xl)] font-extrabold text-[var(--brand-900)]">
            {t('missionTitle')}
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {missions.map((mission, index) => (
              <RevealOnScroll key={mission.title} delay={index * 60}>
                <div className="h-full rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-[var(--space-card)] shadow-[var(--shadow-card)]">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-[var(--radius-md)] bg-[var(--brand-100)] text-[var(--brand-700)]">
                    <Icon name={mission.icon} className="h-6 w-6" />
                  </span>
                  <h3 className="mt-5 text-lg font-bold text-[var(--brand-900)]">{mission.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-muted)]">
                    {mission.body}
                  </p>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  )
}
