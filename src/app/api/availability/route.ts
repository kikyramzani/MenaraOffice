import { NextResponse, type NextRequest } from 'next/server'

import { getStore } from '@/lib/data'

export const runtime = 'nodejs'

/**
 * GET /api/availability?roomId=…&date=YYYY-MM-DD
 * Returns booked [start, end) hour ranges plus the bookable window, so the
 * calendar can paint availability without exposing booker identities.
 */
export async function GET(request: NextRequest) {
  const roomId = request.nextUrl.searchParams.get('roomId') ?? ''
  const date = request.nextUrl.searchParams.get('date') ?? ''

  if (!roomId || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 })
  }

  try {
    const store = getStore()
    const [bookings, settings] = await Promise.all([
      store.getBookingsForRoomDate(roomId, date),
      store.getSettings(),
    ])

    return NextResponse.json({
      ok: true,
      openHour: settings.bookingOpenHour,
      closeHour: settings.bookingCloseHour,
      booked: bookings.map((booking) => ({
        startHour: booking.startHour,
        endHour: booking.endHour,
      })),
    })
  } catch (error) {
    console.error('[api/availability] failed:', error)
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 })
  }
}
