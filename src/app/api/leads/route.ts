import { NextResponse, type NextRequest } from 'next/server'

import { getStore } from '@/lib/data'
import { leadSchema } from '@/lib/schemas'
import { checkRateLimit } from '@/lib/rate-limit'
import { notifyNewLead } from '@/lib/notify'
import { clientIp, isAllowedOrigin } from '@/lib/request-guards'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  if (!isAllowedOrigin(request)) {
    return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 })
  }

  const rate = checkRateLimit(`leads:${clientIp(request)}`, { limit: 5, windowMs: 60_000 })
  if (!rate.allowed) {
    return NextResponse.json(
      { ok: false, error: 'rate_limited' },
      { status: 429, headers: { 'retry-after': String(rate.retryAfter) } },
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 })
  }

  const parsed = leadSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: 'validation', issues: parsed.error.issues.map((issue) => issue.message) },
      { status: 400 },
    )
  }

  // Honeypot tripped: pretend success, store nothing.
  if (parsed.data.company) {
    return NextResponse.json({ ok: true })
  }

  try {
    const store = getStore()
    const settings = await store.getSettings()
    const lead = await store.createLead({
      name: parsed.data.name,
      phone: parsed.data.phone,
      email: parsed.data.email,
      service: parsed.data.service,
      message: parsed.data.message,
      source: 'website',
    })
    await notifyNewLead(lead, settings)
    return NextResponse.json({ ok: true, id: lead.id })
  } catch (error) {
    console.error('[api/leads] failed to store lead:', error)
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 })
  }
}
