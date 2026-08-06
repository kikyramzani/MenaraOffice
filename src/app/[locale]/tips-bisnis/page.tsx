import Image from 'next/image'
import type { Metadata } from 'next'
import { hasLocale } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'

import { Link } from '@/i18n/navigation'
import { routing, type Locale } from '@/i18n/routing'
import { getStore } from '@/lib/data'
import { formatDate, pickL10n } from '@/lib/format'
import { Icon } from '@/components/ui/Icon'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { RevealOnScroll } from '@/components/ui/RevealOnScroll'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) return {}
  const t = await getTranslations({ locale, namespace: 'blog' })
  return {
    title: t('eyebrow'),
    description: t('subtitle'),
    alternates: { languages: { id: '/id/tips-bisnis', en: '/en/tips-bisnis' } },
  }
}

export default async function BlogIndexPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()

  const t = await getTranslations('blog')
  const typedLocale = locale as Locale
  const posts = (await getStore().getPosts()).filter((post) => post.status === 'published')

  return (
    <>
      <section className="wash-hero pb-14 pt-28 md:pt-36">
        <div className="container-site">
          <SectionHeading as="h1" eyebrow={t('eyebrow')} title={t('title')} subtitle={t('subtitle')} />
        </div>
      </section>

      <section className="section pt-4">
        <div className="container-site">
          {posts.length === 0 ? (
            <p className="text-center text-[var(--color-text-muted)]">{t('empty')}</p>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post, index) => (
                <RevealOnScroll key={post.id} delay={index * 50}>
                  <article className="group flex h-full flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-lift)]">
                    <Link href={`/tips-bisnis/${post.slug}`} className="relative block aspect-[16/9] overflow-hidden">
                      <Image
                        src={post.cover}
                        alt={pickL10n(post.title, typedLocale)}
                        fill
                        loading="lazy"
                        sizes="(max-width: 768px) 92vw, 30vw"
                        className="object-cover transition-transform duration-[var(--duration-slow)] group-hover:scale-105"
                      />
                    </Link>
                    <div className="flex flex-1 flex-col p-6">
                      <time
                        dateTime={post.publishedAt}
                        className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]"
                      >
                        {formatDate(post.publishedAt, typedLocale)}
                      </time>
                      <h2 className="mt-2 text-lg font-bold leading-snug text-[var(--brand-900)]">
                        <Link href={`/tips-bisnis/${post.slug}`} className="hover:text-[var(--brand-600)]">
                          {pickL10n(post.title, typedLocale)}
                        </Link>
                      </h2>
                      <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--color-text-muted)]">
                        {pickL10n(post.excerpt, typedLocale)}
                      </p>
                      <Link
                        href={`/tips-bisnis/${post.slug}`}
                        className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--brand-600)]"
                      >
                        {t('readMore')}
                        <Icon name="arrow-right" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </div>
                  </article>
                </RevealOnScroll>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
