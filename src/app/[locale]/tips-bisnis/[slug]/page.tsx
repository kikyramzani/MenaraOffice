import Image from 'next/image'
import type { Metadata } from 'next'
import { hasLocale } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'

import { Link } from '@/i18n/navigation'
import { routing, type Locale } from '@/i18n/routing'
import { getStore } from '@/lib/data'
import { formatDate, pickL10n } from '@/lib/format'
import { markdownToHtml } from '@/lib/markdown'
import { Icon } from '@/components/ui/Icon'

export const dynamic = 'force-dynamic'

type Params = { locale: string; slug: string }

async function findPost(slug: string) {
  const posts = await getStore().getPosts()
  return posts.find((post) => post.slug === slug && post.status === 'published') ?? null
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale, slug } = await params
  if (!hasLocale(routing.locales, locale)) return {}
  const post = await findPost(slug)
  if (!post) return {}
  const typedLocale = locale as Locale
  return {
    title: pickL10n(post.title, typedLocale),
    description: pickL10n(post.excerpt, typedLocale),
    alternates: { languages: { id: `/id/tips-bisnis/${slug}`, en: `/en/tips-bisnis/${slug}` } },
    openGraph: { images: [post.cover] },
  }
}

export default async function BlogPostPage({ params }: { params: Promise<Params> }) {
  const { locale, slug } = await params
  if (!hasLocale(routing.locales, locale)) notFound()

  const post = await findPost(slug)
  if (!post) notFound()

  const t = await getTranslations('blog')
  const typedLocale = locale as Locale
  const related = (await getStore().getPosts())
    .filter((other) => other.status === 'published' && other.id !== post.id)
    .slice(0, 3)

  return (
    <article className="pb-[var(--space-section)] pt-28 md:pt-36">
      <div className="container-site max-w-3xl">
        <Link
          href="/tips-bisnis"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--brand-600)]"
        >
          <Icon name="arrow-right" className="h-4 w-4 rotate-180" />
          {t('backToBlog')}
        </Link>

        <time
          dateTime={post.publishedAt}
          className="mt-6 block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]"
        >
          {formatDate(post.publishedAt, typedLocale)}
        </time>
        <h1 className="mt-3 text-[length:var(--text-hero)] font-extrabold leading-[1.08] tracking-tight text-[var(--brand-900)]">
          {pickL10n(post.title, typedLocale)}
        </h1>
        <p className="mt-4 text-[length:var(--text-lg)] leading-relaxed text-[var(--color-text-muted)]">
          {pickL10n(post.excerpt, typedLocale)}
        </p>

        <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-[var(--radius-lg)] shadow-[var(--shadow-card)]">
          <Image
            src={post.cover}
            alt={pickL10n(post.title, typedLocale)}
            fill
            priority
            sizes="(max-width: 768px) 92vw, 46rem"
            className="object-cover"
          />
        </div>

        <div
          className="prose-mo mt-10"
          dangerouslySetInnerHTML={{ __html: markdownToHtml(pickL10n(post.content, typedLocale)) }}
        />
      </div>

      {related.length > 0 ? (
        <aside className="container-site mt-[var(--space-section)] max-w-5xl">
          <h2 className="text-center text-[length:var(--text-xl)] font-extrabold text-[var(--brand-900)]">
            {t('relatedPosts')}
          </h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {related.map((other) => (
              <Link
                key={other.id}
                href={`/tips-bisnis/${other.slug}`}
                className="group rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-lift)]"
              >
                <time className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                  {formatDate(other.publishedAt, typedLocale)}
                </time>
                <p className="mt-2 font-bold leading-snug text-[var(--brand-900)] group-hover:text-[var(--brand-600)]">
                  {pickL10n(other.title, typedLocale)}
                </p>
              </Link>
            ))}
          </div>
        </aside>
      ) : null}
    </article>
  )
}
