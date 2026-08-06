import type { MetadataRoute } from 'next'

import { locales } from '@/i18n/routing'
import { getStore } from '@/lib/data'

const SITE_URL = process.env.SITE_URL ?? 'http://localhost:3000'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const store = getStore()
  const [services, locations, posts] = await Promise.all([
    store.getServices(),
    store.getLocations(),
    store.getPosts(),
  ])

  const paths = [
    '',
    '/lokasi',
    '/tips-bisnis',
    '/tentang-kami',
    '/kontak',
    '/booking',
    ...services.filter((service) => service.active).map((service) => `/${service.slug}`),
    ...locations.filter((location) => location.active).map((location) => `/lokasi/${location.slug}`),
    ...posts.filter((post) => post.status === 'published').map((post) => `/tips-bisnis/${post.slug}`),
  ]

  return paths.flatMap((path) =>
    locales.map((locale) => ({
      url: `${SITE_URL}/${locale}${path}`,
      changeFrequency: 'weekly' as const,
      priority: path === '' ? 1 : 0.7,
      alternates: {
        languages: Object.fromEntries(
          locales.map((alternate) => [alternate, `${SITE_URL}/${alternate}${path}`]),
        ),
      },
    })),
  )
}
