import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'

import '@/styles/global.css'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
})

export const metadata: Metadata = {
  title: { default: 'Admin Menara Office', template: '%s | Admin Menara Office' },
  robots: { index: false, follow: false },
}

/** Admin document shell — Indonesian-only, session-gated in nested layouts. */
export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id" className={jakarta.variable}>
      <body className="min-h-dvh bg-[var(--color-surface-alt)] font-sans text-[var(--color-text)]">
        {children}
      </body>
    </html>
  )
}
