'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { clsx } from '@/lib/clsx'

type Props = {
  children: ReactNode
  className?: string
  /** Stagger delay in ms, applied via transition-delay. */
  delay?: number
}

/**
 * IntersectionObserver-driven reveal. Falls back to always-visible when
 * prefers-reduced-motion is set (handled in global.css) or when JS fails.
 */
export function RevealOnScroll({ children, className, delay = 0 }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.1 },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={clsx('reveal', className)}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  )
}
