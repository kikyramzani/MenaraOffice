import 'server-only'

import type { Booking, Lead } from '@/lib/data/types'

/**
 * Email notifications via Resend. Fire-and-forget with logging: a failed
 * notification must never fail the visitor's submission — the record is
 * already stored and visible in the admin inbox either way.
 */

async function send(subject: string, html: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  const to = process.env.NOTIFY_EMAIL_TO
  if (!apiKey || !to) {
    console.info(`[notify] RESEND not configured — skipped email: ${subject}`)
    return
  }

  try {
    const { Resend } = await import('resend')
    const resend = new Resend(apiKey)
    const { error } = await resend.emails.send({
      from: 'Menara Office Website <onboarding@resend.dev>',
      to,
      subject,
      html,
    })
    if (error) console.error('[notify] resend error:', error)
  } catch (error) {
    console.error('[notify] failed to send email:', error)
  }
}

const esc = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export async function notifyNewLead(lead: Lead): Promise<void> {
  await send(
    `Lead baru: ${lead.name}`,
    `<h2>Lead baru dari website</h2>
     <p><strong>Nama:</strong> ${esc(lead.name)}<br/>
     <strong>WhatsApp:</strong> ${esc(lead.phone)}<br/>
     <strong>Email:</strong> ${esc(lead.email)}<br/>
     <strong>Layanan:</strong> ${esc(lead.service)}</p>
     <p>${esc(lead.message)}</p>`,
  )
}

export async function notifyNewBooking(booking: Booking, roomName: string): Promise<void> {
  await send(
    `Booking baru: ${roomName} ${booking.date}`,
    `<h2>Permintaan booking meeting room</h2>
     <p><strong>Ruangan:</strong> ${esc(roomName)}<br/>
     <strong>Tanggal:</strong> ${esc(booking.date)}<br/>
     <strong>Jam:</strong> ${booking.startHour}:00-${booking.endHour}:00<br/>
     <strong>Nama:</strong> ${esc(booking.name)}<br/>
     <strong>WhatsApp:</strong> ${esc(booking.phone)}<br/>
     <strong>Email:</strong> ${esc(booking.email)}</p>
     <p>${esc(booking.notes)}</p>
     <p>Konfirmasi booking ini dari panel admin.</p>`,
  )
}
