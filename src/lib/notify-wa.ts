import 'server-only'

import type { Booking } from '@/lib/data/types'
import { formatHour } from '@/lib/format'

/**
 * WhatsApp notification for new bookings, via a gateway (Fonnte by default —
 * the common choice in Indonesia).
 *
 * WhatsApp cannot be pushed from a server without a paid gateway, so this is
 * inert until WA_GATEWAY_TOKEN and WA_NOTIFY_TO are set. Until then the
 * customer-facing "Lanjutkan ke WhatsApp" button on the booking success screen
 * remains the working path.
 *
 * Fire-and-forget with logging, exactly like notify.ts: the booking is already
 * stored and visible in the admin inbox, so a failed notification must never
 * fail the visitor's submission.
 */
export async function notifyBookingWhatsApp(
  booking: Booking,
  roomName: string,
  locationName: string,
): Promise<void> {
  const token = process.env.WA_GATEWAY_TOKEN
  const target = process.env.WA_NOTIFY_TO
  if (!token || !target) {
    console.info('[notify-wa] gateway not configured — skipped WhatsApp for booking', booking.id)
    return
  }

  const message = [
    '*Booking Meeting Room Baru*',
    `Ruangan: ${roomName} (${locationName})`,
    `Tanggal: ${booking.date}`,
    `Jam: ${formatHour(booking.startHour)}-${formatHour(booking.endHour)}`,
    `Nama: ${booking.name}`,
    `WhatsApp: ${booking.phone}`,
    `Email: ${booking.email}`,
    booking.notes ? `Catatan: ${booking.notes}` : '',
    '',
    'Konfirmasi dari panel admin.',
  ]
    .filter(Boolean)
    .join('\n')

  try {
    // 10s ceiling: an unreachable gateway must not hold the booking response
    // open, since the record is already committed by this point.
    const response = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: { Authorization: token, 'content-type': 'application/json' },
      body: JSON.stringify({ target, message }),
      signal: AbortSignal.timeout(10_000),
    })
    if (!response.ok) {
      console.error('[notify-wa] gateway returned', response.status)
    }
  } catch (error) {
    console.error('[notify-wa] failed to send WhatsApp:', error)
  }
}
