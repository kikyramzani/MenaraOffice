import { NextResponse, type NextRequest } from 'next/server'

import { BookingConflictError, getStore } from '@/lib/data'
import { bookingSchema } from '@/lib/schemas'
import { checkRateLimit } from '@/lib/rate-limit'
import { notifyNewBooking } from '@/lib/notify'
import { clientIp, isAllowedOrigin, todayInJakarta } from '@/lib/request-guards'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  if (!isAllowedOrigin(request)) {
    return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 })
  }

  const rate = checkRateLimit(`bookings:${clientIp(request)}`, { limit: 5, windowMs: 60_000 })
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

  const parsed = bookingSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: 'validation', issues: parsed.error.issues.map((issue) => issue.message) },
      { status: 400 },
    )
  }

  if (parsed.data.company) {
    return NextResponse.json({ ok: true })
  }

  const store = getStore()

  // Reject unknown/inactive rooms and out-of-hours requests server-side; the
  // client UI enforces the same rules but is not a boundary.
  const [rooms, settings] = await Promise.all([store.getRooms(), store.getSettings()])
  const room = rooms.find((candidate) => candidate.id === parsed.data.roomId && candidate.active)
  if (!room) {
    return NextResponse.json({ ok: false, error: 'unknown_room' }, { status: 400 })
  }
  if (
    parsed.data.startHour < settings.bookingOpenHour ||
    parsed.data.endHour > settings.bookingCloseHour
  ) {
    return NextResponse.json({ ok: false, error: 'outside_hours' }, { status: 400 })
  }

  // Business timezone, not the server's — Vercel lambdas run in UTC and would
  // otherwise reject "today" bookings made between 00:00 and 07:00 WIB.
  if (parsed.data.date < todayInJakarta()) {
    return NextResponse.json({ ok: false, error: 'past_date' }, { status: 400 })
  }

  try {
    const booking = await store.createBooking({
      roomId: parsed.data.roomId,
      name: parsed.data.name,
      phone: parsed.data.phone,
      email: parsed.data.email,
      date: parsed.data.date,
      startHour: parsed.data.startHour,
      endHour: parsed.data.endHour,
      notes: parsed.data.notes,
    })
    await notifyNewBooking(booking, room.name)
    return NextResponse.json({ ok: true, id: booking.id })
  } catch (error) {
    if (error instanceof BookingConflictError) {
      return NextResponse.json({ ok: false, error: 'conflict' }, { status: 409 })
    }
    console.error('[api/bookings] failed to store booking:', error)
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 })
  }
}
