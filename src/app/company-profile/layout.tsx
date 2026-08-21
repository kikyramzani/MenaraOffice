import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import localFont from 'next/font/local'

import '@/styles/global.css'
import '@/styles/profile-print.css'

/**
 * Static Plus Jakarta Sans, not the `next/font/google` variable build the rest
 * of the site uses.
 *
 * Chromium cannot embed a variable-font instance in a PDF, so it falls back to
 * Type3 fonts — glyphs drawn as procedures. The document still *looks* right,
 * but none of its text can be selected, searched, or copied, which matters for
 * a profile whose whole job is handing over an address and a phone number.
 * Static instances embed as real TrueType with a ToUnicode map.
 */
const jakarta = localFont({
  src: [
    { path: '../../fonts/PlusJakartaSans-Regular.ttf', weight: '400', style: 'normal' },
    { path: '../../fonts/PlusJakartaSans-SemiBold.ttf', weight: '600', style: 'normal' },
    { path: '../../fonts/PlusJakartaSans-Bold.ttf', weight: '700', style: 'normal' },
    { path: '../../fonts/PlusJakartaSans-ExtraBold.ttf', weight: '800', style: 'normal' },
  ],
  variable: '--font-jakarta',
  display: 'block',
})

export const metadata: Metadata = {
  title: 'Company Profile | Menara Office',
  robots: { index: false, follow: false },
}

/**
 * Document shell for the printable company profile — Indonesian-only and
 * deliberately outside `app/[locale]`, so the site header, footer and floating
 * WhatsApp button never end up on a page destined for paper.
 */
export default function CompanyProfileLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id" className={jakarta.variable}>
      <body className="profile-root font-sans">{children}</body>
    </html>
  )
}
