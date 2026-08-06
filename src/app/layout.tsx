import type { ReactNode } from 'react'

/**
 * Next requires a layout at the app root, but the real document shells live
 * in `app/[locale]/layout.tsx` (public site) and `app/admin/layout.tsx`
 * (admin panel), where the language is known. This wrapper deliberately
 * renders children untouched.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children
}
