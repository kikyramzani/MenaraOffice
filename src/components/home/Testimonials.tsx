import { getTranslations } from 'next-intl/server'
import type { Locale } from '@/i18n/routing'
import type { Testimonial } from '@/lib/data/types'
import { pickL10n } from '@/lib/format'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { RevealOnScroll } from '@/components/ui/RevealOnScroll'

type Props = { testimonials: Testimonial[]; locale: Locale }

/** Hidden entirely until real client quotes are entered from the admin panel. */
export async function Testimonials({ testimonials, locale }: Props) {
  const active = testimonials.filter((testimonial) => testimonial.active)
  if (active.length === 0) return null

  const t = await getTranslations('testimonials')

  return (
    <section className="section" aria-labelledby="testimonials-heading">
      <div className="container-site">
        <SectionHeading eyebrow={t('eyebrow')} title={<span id="testimonials-heading">{t('title')}</span>} />
        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {active.map((testimonial, index) => (
            <RevealOnScroll key={testimonial.id} delay={index * 60}>
              <figure className="flex h-full flex-col rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-[var(--space-card)] shadow-[var(--shadow-card)]">
                <blockquote className="flex-1 text-[15px] leading-relaxed text-[var(--color-text)]">
                  “{pickL10n(testimonial.quote, locale)}”
                </blockquote>
                <figcaption className="mt-5 border-t border-[var(--color-border)] pt-4">
                  <p className="text-sm font-bold text-[var(--brand-900)]">{testimonial.name}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">{testimonial.role}</p>
                </figcaption>
              </figure>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  )
}
