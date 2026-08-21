'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'
import { clsx } from '@/lib/clsx'
import { Icon } from '@/components/ui/Icon'
import { LanguageSwitcher } from './LanguageSwitcher'

export type NavService = { slug: string; label: string }

type Props = { services: NavService[] }

export function Header({ services }: Props) {
  const t = useTranslations('nav')
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [servicesOpen, setServicesOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close overlays on navigation.
  useEffect(() => {
    setMobileOpen(false)
    setServicesOpen(false)
  }, [pathname])

  // Close the services dropdown on outside click / Escape.
  useEffect(() => {
    if (!servicesOpen) return
    const onClick = (event: MouseEvent) => {
      if (!dropdownRef.current?.contains(event.target as Node)) setServicesOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setServicesOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [servicesOpen])

  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  const linkClass = (href: string) =>
    clsx(
      'rounded-md px-3 py-2 text-sm font-semibold transition-colors',
      pathname === href
        ? 'text-[var(--brand-600)]'
        : 'text-[var(--brand-900)] hover:text-[var(--brand-600)]',
    )

  return (
    <header
      className={clsx(
        'fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow] duration-[var(--duration-normal)]',
        scrolled || mobileOpen
          ? 'bg-white/95 shadow-[0_1px_0_var(--color-border),0_8px_24px_-16px_rgb(11_46_74/0.25)] backdrop-blur'
          : 'bg-transparent',
      )}
    >
      <div className="container-site flex h-16 items-center justify-between gap-4 md:h-20">
        <Link href="/" className="flex shrink-0 items-center" aria-label="Menara Office, Beranda">
          <Image
            src="/images/logo.png"
            alt="Menara Office"
            width={150}
            height={58}
            priority
            className="h-9 w-auto md:h-11"
          />
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center gap-1 lg:flex">
          <Link href="/" className={linkClass('/')}>
            {t('home')}
          </Link>

          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              className={clsx(linkClass('#'), 'flex items-center gap-1')}
              aria-expanded={servicesOpen}
              aria-haspopup="true"
              aria-controls="services-menu"
              onClick={() => setServicesOpen((open) => !open)}
            >
              {t('services')}
              <Icon
                name="chevron-down"
                className={clsx('h-4 w-4 transition-transform', servicesOpen && 'rotate-180')}
              />
            </button>
            {servicesOpen ? (
              <div
                id="services-menu"
                className="absolute left-0 top-full mt-2 w-64 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white p-2 shadow-[var(--shadow-lift)]"
              >
                {services.map((service) => (
                  <Link
                    key={service.slug}
                    href={`/${service.slug}`}
                    className="block rounded-[var(--radius-sm)] px-3 py-2.5 text-sm font-medium text-[var(--brand-900)] hover:bg-[var(--brand-50)] hover:text-[var(--brand-600)]"
                  >
                    {service.label}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>

          <Link href="/lokasi" className={linkClass('/lokasi')}>
            {t('locations')}
          </Link>
          {/* Diberi warna aksen supaya menonjol dari item nav lain. */}
          <Link
            href="/promo"
            className={clsx(
              'ml-1 rounded-[var(--radius-pill)] px-3.5 py-2 text-sm font-bold transition-colors',
              pathname === '/promo'
                ? 'bg-[var(--accent-500)] text-[var(--brand-950)]'
                : 'bg-[var(--accent-100)] text-[var(--brand-900)] hover:bg-[var(--accent-500)]',
            )}
          >
            {t('promo')}
          </Link>
          <Link href="/tips-bisnis" className={linkClass('/tips-bisnis')}>
            {t('blog')}
          </Link>
          <Link href="/tentang-kami" className={linkClass('/tentang-kami')}>
            {t('about')}
          </Link>
          <Link href="/kontak" className={linkClass('/kontak')}>
            {t('contact')}
          </Link>
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <LanguageSwitcher />
          <Link
            href="/booking"
            className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] bg-[var(--brand-700)] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_-8px_rgb(23_93_141/0.65)] transition-colors hover:bg-[var(--brand-800)]"
          >
            <Icon name="calendar" className="h-4 w-4" />
            {t('bookRoom')}
          </Link>
        </div>

        <button
          type="button"
          className="rounded-md p-2 text-[var(--brand-900)] lg:hidden"
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? t('closeMenu') : t('menu')}
          onClick={() => setMobileOpen((open) => !open)}
        >
          <Icon name={mobileOpen ? 'close' : 'menu'} className="h-6 w-6" />
        </button>
      </div>

      {mobileOpen ? (
        <div className="max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-[var(--color-border)] bg-white lg:hidden">
          <nav aria-label="Mobile navigation" className="container-site flex flex-col gap-1 py-4">
            <Link href="/" className="rounded-md px-3 py-3 font-semibold text-[var(--brand-900)]">
              {t('home')}
            </Link>
            <p className="px-3 pt-2 text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
              {t('services')}
            </p>
            {services.map((service) => (
              <Link
                key={service.slug}
                href={`/${service.slug}`}
                className="rounded-md px-3 py-2.5 pl-6 text-[15px] font-medium text-[var(--brand-800)]"
              >
                {service.label}
              </Link>
            ))}
            <Link href="/lokasi" className="rounded-md px-3 py-3 font-semibold text-[var(--brand-900)]">
              {t('locations')}
            </Link>
            <Link
              href="/promo"
              className="rounded-md bg-[var(--accent-100)] px-3 py-3 font-bold text-[var(--brand-900)]"
            >
              {t('promo')}
            </Link>
            <Link href="/tips-bisnis" className="rounded-md px-3 py-3 font-semibold text-[var(--brand-900)]">
              {t('blog')}
            </Link>
            <Link href="/tentang-kami" className="rounded-md px-3 py-3 font-semibold text-[var(--brand-900)]">
              {t('about')}
            </Link>
            <Link href="/kontak" className="rounded-md px-3 py-3 font-semibold text-[var(--brand-900)]">
              {t('contact')}
            </Link>
            <div className="mt-3 flex items-center justify-between gap-3 border-t border-[var(--color-border)] px-3 pt-4">
              <LanguageSwitcher />
              <Link
                href="/booking"
                className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] bg-[var(--brand-700)] px-5 py-2.5 text-sm font-semibold text-white"
              >
                <Icon name="calendar" className="h-4 w-4" />
                {t('bookRoom')}
              </Link>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  )
}
