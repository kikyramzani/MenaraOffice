import 'server-only'

import { createHmac, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'

/**
 * Single-admin session auth.
 *
 * Credentials are verified against ADMIN_EMAIL/ADMIN_PASSWORD (demo mode) or
 * Supabase Auth when configured. Either way the session itself is our own
 * HMAC-signed, httpOnly cookie so the admin panel works identically in both
 * modes and needs no client-side auth library.
 */

const COOKIE_NAME = 'mo_admin'
const SESSION_HOURS = 12

function secret(): string {
  const value = process.env.AUTH_SECRET
  // Fail closed: without a strong secret nobody can mint or validate
  // sessions. 32+ chars keeps offline HMAC forgery impractical.
  if (!value) {
    throw new Error('AUTH_SECRET is not configured')
  }
  if (value.length < 32) {
    throw new Error('AUTH_SECRET must be at least 32 characters')
  }
  return value
}

function sign(payload: string): string {
  return createHmac('sha256', secret()).update(payload).digest('base64url')
}

function encodeToken(email: string, expiresAt: number): string {
  const payload = Buffer.from(JSON.stringify({ email, exp: expiresAt })).toString('base64url')
  return `${payload}.${sign(payload)}`
}

function decodeToken(token: string): { email: string; exp: number } | null {
  const [payload, signature] = token.split('.')
  if (!payload || !signature) return null

  const expected = sign(payload)
  const a = Buffer.from(signature)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null

  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      email?: unknown
      exp?: unknown
    }
    if (typeof parsed.email !== 'string' || typeof parsed.exp !== 'number') return null
    if (parsed.exp < Date.now()) return null
    return { email: parsed.email, exp: parsed.exp }
  } catch {
    return null
  }
}

async function verifyWithSupabase(email: string, password: string): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) return false

  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(url, anonKey, { auth: { persistSession: false } })
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  return !error
}

function verifyWithEnv(email: string, password: string): boolean {
  const expectedEmail = process.env.ADMIN_EMAIL
  const expectedPassword = process.env.ADMIN_PASSWORD
  if (!expectedEmail || !expectedPassword) return false

  const emailA = Buffer.from(email.toLowerCase())
  const emailB = Buffer.from(expectedEmail.toLowerCase())
  const passA = Buffer.from(password)
  const passB = Buffer.from(expectedPassword)

  const emailOk = emailA.length === emailB.length && timingSafeEqual(emailA, emailB)
  const passOk = passA.length === passB.length && timingSafeEqual(passA, passB)
  return emailOk && passOk
}

export async function verifyCredentials(email: string, password: string): Promise<boolean> {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return verifyWithSupabase(email, password)
  }
  return verifyWithEnv(email, password)
}

export async function createSession(email: string): Promise<void> {
  const expiresAt = Date.now() + SESSION_HOURS * 60 * 60 * 1000
  const store = await cookies()
  store.set(COOKIE_NAME, encodeToken(email, expiresAt), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_HOURS * 60 * 60,
  })
}

export async function destroySession(): Promise<void> {
  const store = await cookies()
  store.delete(COOKIE_NAME)
}

export async function getSession(): Promise<{ email: string } | null> {
  const store = await cookies()
  const token = store.get(COOKIE_NAME)?.value
  if (!token) return null
  const decoded = decodeToken(token)
  return decoded ? { email: decoded.email } : null
}
