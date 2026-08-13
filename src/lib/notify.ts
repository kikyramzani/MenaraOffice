import 'server-only'

import type { Booking, Lead, SiteSettings } from '@/lib/data/types'

/**
 * Email notifications via Resend. Fire-and-forget with logging: a failed
 * notification must never fail the visitor's submission — the record is
 * already stored and visible in the admin inbox either way.
 */

async function send(subject: string, html: string, fallbackTo?: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  // Env wins so a deployment can redirect notifications without a content
  // edit; otherwise the admin-editable contact address is the destination.
  const to = process.env.NOTIFY_EMAIL_TO || fallbackTo
  if (!apiKey || !to) {
    console.info(`[notify] RESEND not configured — skipped email: ${subject}`)
    return
  }

  try {
    const { Resend } = await import('resend')
    const resend = new Resend(apiKey)
    const { error } = await resend.emails.send({
      // onboarding@resend.dev is Resend's sandbox sender and only delivers to
      // the account owner. Set RESEND_FROM to a verified domain address for
      // real delivery.
      from: process.env.RESEND_FROM || 'Menara Office Website <onboarding@resend.dev>',
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

export async function notifyNewLead(lead: Lead, settings?: SiteSettings): Promise<void> {
  await send(
    `Lead baru: ${lead.name}`,
    `<h2>Lead baru dari website</h2>
     <p><strong>Nama:</strong> ${esc(lead.name)}<br/>
     <strong>WhatsApp:</strong> ${esc(lead.phone)}<br/>
     <strong>Email:</strong> ${esc(lead.email)}<br/>
     <strong>Layanan:</strong> ${esc(lead.service)}</p>
     <p>${esc(lead.message)}</p>`,
    settings?.email,
  )
}

export async function notifyNewBooking(
  booking: Booking,
  roomName: string,
  settings?: SiteSettings,
): Promise<void> {
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
    settings?.email,
  )
}
