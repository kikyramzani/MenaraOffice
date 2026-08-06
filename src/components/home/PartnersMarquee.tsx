import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import type { Partner } from '@/lib/data/types'

type Props = { partners: Partner[] }

/** Seconds one full lap takes when the lap holds exactly LAP_MIN_ITEMS items. */
const BASE_LAP_SECONDS = 22
/**
 * Minimum items per lap so the strip stays wider than any real viewport
 * (each logo box is roughly 160px + 64px margin ≈ 224px, so 14 items covers
 * ~3100px). With few active partners the set repeats to reach this floor —
 * otherwise a single lap is narrower than the screen and the CSS loop
 * visibly jumps to blank space instead of scrolling continuously.
 */
const LAP_MIN_ITEMS = 14

/**
 * Logo trust-bar, ported from the "Our Partner" marquee on menaraoffice.id.
 * The lap is repeated to clear LAP_MIN_ITEMS, then that lap is duplicated
 * once more so the CSS animation (translateX 0 → -50%) loops seamlessly with
 * no gap, however few partners are configured. Pauses under
 * `prefers-reduced-motion` via the shared .marquee-track rule.
 */
export async function PartnersMarquee({ partners }: Props) {
  const active = partners.filter((partner) => partner.active)
  if (active.length === 0) return null

  const t = await getTranslations('partners')

  const repeats = Math.max(1, Math.ceil(LAP_MIN_ITEMS / active.length))
  const lap = Array.from({ length: repeats }, () => active).flat()
  const track = [...lap, ...lap]
  // Keep px/second constant regardless of how many logos are configured —
  // more repeats means a wider lap, so the duration scales with it.
  const durationSeconds = BASE_LAP_SECONDS * repeats

  return (
    <section className="border-y border-[var(--color-border)] bg-[var(--color-surface-alt)] py-10" aria-labelledby="partners-heading">
      <div className="container-site">
        <p
          id="partners-heading"
          className="mb-6 text-center text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-text-muted)]"
        >
          {t('title')}
        </p>
      </div>
      <div className="marquee-viewport">
        <div className="marquee-track" style={{ animationDuration: `${durationSeconds}s` }}>
          {track.map((partner, index) => {
            const logo = (
              <Image
                src={partner.logo}
                alt={partner.name}
                width={160}
                height={64}
                loading="lazy"
                className="h-12 w-auto object-contain opacity-80 grayscale transition-[opacity,filter] duration-[var(--duration-normal)] hover:opacity-100 hover:grayscale-0"
              />
            )
            return (
              <div key={`${partner.id}-${index}`} className="mx-8 flex shrink-0 items-center">
                {partner.website ? (
                  <a href={partner.website} target="_blank" rel="noopener noreferrer" aria-label={partner.name}>
                    {logo}
                  </a>
                ) : (
                  logo
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
