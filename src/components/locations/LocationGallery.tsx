'use client'

import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'

import { Icon } from '@/components/ui/Icon'
import { clsx } from '@/lib/clsx'

type Props = {
  images: string[]
  /** Used to build per-image alt text, e.g. "Epiwalk Rasuna Epicentrum — foto 3". */
  locationName: string
}

/**
 * Branch photo grid with a lightbox. The only modal in the codebase, so it
 * owns its own focus handling rather than pulling in a dialog library.
 */
export function LocationGallery({ images, locationName }: Props) {
  const t = useTranslations('locations')
  // -1 means the lightbox is closed; any index >= 0 is the open photo.
  const [openIndex, setOpenIndex] = useState(-1)
  const triggersRef = useRef<Array<HTMLButtonElement | null>>([])
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  const count = images.length
  // Doubles as the "is the lightbox open" flag, so the open state and the photo
  // it shows can never disagree.
  const openImage = openIndex >= 0 ? images[openIndex] : undefined
  const isOpen = openImage !== undefined

  // Tracks the index outside React state purely so `close` can restore focus
  // without reading it inside a state updater — updaters must stay pure, and
  // React may call them twice.
  const openIndexRef = useRef(openIndex)
  openIndexRef.current = openIndex

  const close = useCallback(() => {
    // Return focus to the thumbnail that opened the lightbox, so keyboard users
    // resume where they left off instead of at the top of the page.
    triggersRef.current[openIndexRef.current]?.focus()
    setOpenIndex(-1)
  }, [])

  const step = useCallback(
    (delta: number) => {
      setOpenIndex((current) => (current < 0 ? current : (current + delta + count) % count))
    },
    [count],
  )

  useEffect(() => {
    if (!isOpen) return

    closeButtonRef.current?.focus()

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        close()
        return
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        step(1)
        return
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        step(-1)
        return
      }
      if (event.key !== 'Tab') return

      // Focus trap: the dialog holds few controls, so cycling the live list of
      // focusable nodes is cheaper and less brittle than a sentinel approach.
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>('button')
      const first = focusable?.[0]
      const last = focusable?.[focusable.length - 1]
      if (!first || !last) return
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen, close, step])

  if (count === 0) return null

  return (
    <section className="section pt-6" aria-labelledby="location-gallery-heading">
      <div className="container-site">
        <h2
          id="location-gallery-heading"
          className="text-[length:var(--text-xl)] font-extrabold text-[var(--brand-900)]"
        >
          {t('gallery')}
        </h2>

        <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((src, index) => (
            <li key={src}>
              <button
                type="button"
                ref={(node) => {
                  triggersRef.current[index] = node
                }}
                onClick={() => setOpenIndex(index)}
                className="group relative block aspect-[4/3] w-full overflow-hidden rounded-[var(--radius-md)] shadow-[var(--shadow-card)] outline-offset-2 transition-shadow duration-[var(--duration-fast)] hover:shadow-[var(--shadow-lift)] focus-visible:outline-2 focus-visible:outline-[var(--brand-600)]"
                aria-label={t('galleryOpen', { index: index + 1, total: count })}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  loading="lazy"
                  sizes="(max-width: 640px) 46vw, (max-width: 1024px) 31vw, 23vw"
                  className="object-cover transition-transform duration-[var(--duration-slow)] group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                />
              </button>
            </li>
          ))}
        </ul>
      </div>

      {openImage ? (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={t('gallery')}
          className="fixed inset-0 z-[100] flex flex-col bg-[rgb(11_46_74/0.94)] p-4 backdrop-blur-sm sm:p-8"
          onClick={(event) => {
            // Backdrop click closes; clicks that bubble from the image do not.
            if (event.target === event.currentTarget) close()
          }}
        >
          <div className="flex items-center justify-between gap-4 text-white">
            <p className="text-sm font-semibold tabular-nums">
              {t('galleryCounter', { index: openIndex + 1, total: count })}
            </p>
            <button
              type="button"
              ref={closeButtonRef}
              onClick={close}
              className="inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius-pill)] bg-white/10 transition-colors duration-[var(--duration-fast)] hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-white"
              aria-label={t('galleryClose')}
            >
              <Icon name="close" className="h-5 w-5" />
            </button>
          </div>

          <div className="relative mt-4 min-h-0 flex-1">
            <Image
              key={openImage}
              src={openImage}
              alt={`${locationName} — ${t('galleryCounter', { index: openIndex + 1, total: count })}`}
              fill
              priority
              sizes="100vw"
              className="object-contain"
            />
          </div>

          {count > 1 ? (
            <div className="mt-4 flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => step(-1)}
                className={navButtonClass}
                aria-label={t('galleryPrev')}
              >
                <Icon name="arrow-right" className="h-5 w-5 rotate-180" />
              </button>
              <button
                type="button"
                onClick={() => step(1)}
                className={navButtonClass}
                aria-label={t('galleryNext')}
              >
                <Icon name="arrow-right" className="h-5 w-5" />
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}

const navButtonClass = clsx(
  'inline-flex h-12 w-12 items-center justify-center rounded-[var(--radius-pill)] bg-white/10 text-white',
  'transition-colors duration-[var(--duration-fast)] hover:bg-white/20',
  'focus-visible:outline-2 focus-visible:outline-white',
)
