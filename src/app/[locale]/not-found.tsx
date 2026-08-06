import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { Icon } from '@/components/ui/Icon'

export default async function NotFound() {
  const t = await getTranslations('notFound')

  return (
    <section className="wash-hero flex min-h-[70vh] items-center pb-16 pt-28">
      <div className="container-site text-center">
        <p className="text-[clamp(4rem,10vw,8rem)] font-extrabold leading-none text-[var(--brand-200)]">
          404
        </p>
        <h1 className="mt-2 text-[length:var(--text-2xl)] font-extrabold text-[var(--brand-900)]">
          {t('title')}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-[var(--color-text-muted)]">{t('body')}</p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-[var(--radius-pill)] bg-[var(--brand-700)] px-7 py-3.5 font-semibold text-white transition-colors hover:bg-[var(--brand-800)]"
        >
          <Icon name="arrow-right" className="h-5 w-5 rotate-180" />
          {t('back')}
        </Link>
      </div>
    </section>
  )
}
