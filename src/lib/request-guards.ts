import 'server-only'

import type { NextRequest } from 'next/server'

/**
 * Client IP for rate-limit bucketing. Prefers platform-verified headers
 * (Vercel sets these from the connection, stripping client-supplied values)
 * over the raw X-Forwarded-For list, which an attacker can rotate freely to
 * mint fresh buckets.
 */
export function clientIp(request: NextRequest): string {
  return (
    request.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip')?.trim() ??
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown'
  )
}

/**
 * Lightweight cross-origin guard for anonymous write endpoints: browsers
 * always send Origin on cross-site POSTs, so a mismatch with Host means a
 * third-party page is scripting submissions. Requests without Origin
 * (curl, same-origin fetch in some browsers) are allowed — the rate limiter
 * and honeypot cover those.
 */
export function isAllowedOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin')
  if (!origin) return true
  try {
    const originHost = new URL(origin).host
    const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host')
    return originHost === host
  } catch {
    return false
  }
}

/** Today's date in the business timezone (Asia/Jakarta), as YYYY-MM-DD. */
export function todayInJakarta(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}
