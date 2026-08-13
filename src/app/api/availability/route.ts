import { NextResponse, type NextRequest } from 'next/server'

import { getStore } from '@/lib/data'
import { findDateBlock, toDateBlockRules } from '@/lib/booking-calendar'

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
    const [rooms, bookings, settings, blockedDates] = await Promise.all([
      store.getRooms(),
      store.getBookingsForRoomDate(roomId, date),
      store.getSettings(),
      store.getBlockedDates(),
    ])

    // locationId is resolved from the room server-side rather than accepted as
    // a query param, which the client could otherwise forge to dodge a
    // location-scoped block.
    const room = rooms.find((candidate) => candidate.id === roomId)
    const block = room
      ? findDateBlock(date, room.locationId, toDateBlockRules(blockedDates), settings.closedWeekdays)
      : null

    return NextResponse.json({
      ok: true,
      openHour: settings.bookingOpenHour,
      closeHour: settings.bookingCloseHour,
      // Non-null when the whole day is closed, so a stale calendar cannot end
      // up offering slots on a day the POST guard will reject.
      blockedReason: block?.reason ?? null,
      // Suppress the ranges on a closed day rather than leak an internal
      // event's own bookings to the public calendar.
      booked: block
        ? []
        : bookings.map((booking) => ({
            startHour: booking.startHour,
            endHour: booking.endHour,
          })),
    })
  } catch (error) {
    console.error('[api/availability] failed:', error)
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 })
  }
}
