import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { Icon } from '@/components/ui/Icon'

export async function CtaBand() {
  const t = await getTranslations('cta')

  return (
    <section className="section" aria-labelledby="cta-heading">
      <div className="container-site">
        <div className="wash-navy relative overflow-hidden rounded-[var(--radius-lg)] px-6 py-14 text-center md:px-16 md:py-20">
          <h2
            id="cta-heading"
            className="mx-auto max-w-2xl text-[length:var(--text-2xl)] font-extrabold leading-tight text-white"
          >
            {t('title')}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[length:var(--text-lg)] text-[var(--brand-200)]">
            {t('subtitle')}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/kontak"
              className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] bg-white px-7 py-3.5 text-base font-semibold text-[var(--brand-800)] transition-transform hover:scale-[1.03]"
            >
              {t('button')}
              <Icon name="arrow-right" className="h-5 w-5" />
            </Link>
            <p className="text-sm text-[var(--brand-300)]">
              {t('or')}{' '}
              <Link href="/virtual-office" className="font-semibold text-white underline underline-offset-4">
                {t('explore')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
