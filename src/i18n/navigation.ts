import { createNavigation } from 'next-intl/navigation'
import { routing } from './routing'

/**
 * Locale-aware replacements for next/link and the router hooks. Always import
 * Link from here rather than from `next/link`, otherwise the locale prefix is
 * dropped and the visitor is bounced back to the default language.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing)
