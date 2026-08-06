import { z } from 'zod'

/** Shared boundary validation for the public forms (client + server). */

const phone = z
  .string()
  .trim()
  .min(8, 'phone_short')
  .max(20, 'phone_long')
  .regex(/^\+?[0-9\s-]+$/, 'phone_invalid')

export const leadSchema = z.object({
  name: z.string().trim().min(2, 'name_short').max(100, 'name_long'),
  phone,
  email: z.string().trim().email('email_invalid').max(200),
  service: z.string().trim().max(100).default(''),
  message: z.string().trim().min(5, 'message_short').max(2000, 'message_long'),
  /**
   * Honeypot — humans leave it empty. Validation must NOT reject a filled
   * value: the route handler checks it and silently pretends success, which
   * only works if a bot submission still parses cleanly.
   */
  company: z.string().max(200).optional(),
})

export type LeadInput = z.infer<typeof leadSchema>

export const bookingSchema = z
  .object({
    roomId: z.string().trim().min(1),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date_invalid'),
    startHour: z.coerce.number().int().min(0).max(23),
    endHour: z.coerce.number().int().min(1).max(24),
    name: z.string().trim().min(2, 'name_short').max(100),
    phone,
    email: z.string().trim().email('email_invalid').max(200),
    notes: z.string().trim().max(1000).default(''),
    company: z.string().max(200).optional(),
  })
  .refine((value) => value.endHour > value.startHour, {
    message: 'range_invalid',
    path: ['endHour'],
  })

export type BookingInput = z.infer<typeof bookingSchema>
