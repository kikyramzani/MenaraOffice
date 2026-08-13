import 'server-only'

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { randomUUID } from 'node:crypto'

import { seedDatabase } from './seed'
import {
  BookingConflictError,
  overlaps,
  type DataStore,
  type NewBooking,
  type NewLead,
} from './store'
import type {
  BlockedDate,
  Booking,
  BookingStatus,
  Lead,
  LeadStatus,
  OfficeLocation,
  Partner,
  Post,
  Room,
  Service,
  SiteSettings,
  Testimonial,
} from './types'

/**
 * Supabase-backed store. See `supabase/schema.sql` for the DDL.
 *
 * Content entities (services, locations, rooms, posts, testimonials,
 * settings) are stored as JSONB documents keyed by id — they are always read
 * and written whole by the admin panel, so a document model keeps this mapper
 * tiny. Bookings and leads are real relational tables because they are
 * queried by column (room/date/status) and inserted by anonymous visitors.
 *
 * All access happens server-side with the service-role key; RLS on every
 * table denies the anon role by default.
 */
function client(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string,
    { auth: { persistSession: false } },
  )
}

type DocRow = { id: string; data: unknown }

async function readDocs<T>(table: string, seed: T[]): Promise<T[]> {
  const { data, error } = await client().from(table).select('id, data')
  if (error) throw new Error(`[supabase] read ${table}: ${error.message}`)
  const rows = (data ?? []) as DocRow[]
  // First boot on an empty project: fall back to seed content so the site
  // renders; the admin "save" writes the row and takes over from there.
  if (rows.length === 0) return seed
  return rows.map((row) => row.data as T)
}

async function writeDoc(table: string, id: string, doc: unknown): Promise<void> {
  const { error } = await client().from(table).upsert({ id, data: doc })
  if (error) throw new Error(`[supabase] write ${table}: ${error.message}`)
}

async function deleteDoc(table: string, id: string): Promise<void> {
  const { error } = await client().from(table).delete().eq('id', id)
  if (error) throw new Error(`[supabase] delete ${table}: ${error.message}`)
}

type BookingRow = {
  id: string
  room_id: string
  name: string
  phone: string
  email: string
  date: string
  start_hour: number
  end_hour: number
  notes: string
  status: BookingStatus
  created_at: string
}

function bookingFromRow(row: BookingRow): Booking {
  return {
    id: row.id,
    roomId: row.room_id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    date: row.date,
    startHour: row.start_hour,
    endHour: row.end_hour,
    notes: row.notes,
    status: row.status,
    createdAt: row.created_at,
  }
}

type LeadRow = {
  id: string
  name: string
  phone: string
  email: string
  service: string
  message: string
  status: LeadStatus
  source: string
  created_at: string
}

function leadFromRow(row: LeadRow): Lead {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    service: row.service,
    message: row.message,
    status: row.status,
    source: row.source,
    createdAt: row.created_at,
  }
}

export class SupabaseStore implements DataStore {
  async getServices(): Promise<Service[]> {
    const services = await readDocs<Service>('services', seedDatabase.services)
    return services.sort((a, b) => a.order - b.order)
  }

  async saveService(service: Service): Promise<void> {
    await writeDoc('services', service.id, service)
  }

  async getLocations(): Promise<OfficeLocation[]> {
    const locations = await readDocs<OfficeLocation>('locations', seedDatabase.locations)
    return locations.sort((a, b) => a.order - b.order)
  }

  async saveLocation(location: OfficeLocation): Promise<void> {
    await writeDoc('locations', location.id, location)
  }

  async getRooms(): Promise<Room[]> {
    return readDocs<Room>('rooms', seedDatabase.rooms)
  }

  async saveRoom(room: Room): Promise<void> {
    await writeDoc('rooms', room.id, room)
  }

  async getPosts(): Promise<Post[]> {
    const posts = await readDocs<Post>('posts', seedDatabase.posts)
    return posts.sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1))
  }

  async savePost(post: Post): Promise<void> {
    await writeDoc('posts', post.id, post)
  }

  async deletePost(id: string): Promise<void> {
    await deleteDoc('posts', id)
  }

  async getTestimonials(): Promise<Testimonial[]> {
    const testimonials = await readDocs<Testimonial>('testimonials', seedDatabase.testimonials)
    return testimonials.sort((a, b) => a.order - b.order)
  }

  async saveTestimonial(testimonial: Testimonial): Promise<void> {
    await writeDoc('testimonials', testimonial.id, testimonial)
  }

  async deleteTestimonial(id: string): Promise<void> {
    await deleteDoc('testimonials', id)
  }

  async getPartners(): Promise<Partner[]> {
    const partners = await readDocs<Partner>('partners', seedDatabase.partners)
    return partners.sort((a, b) => a.order - b.order)
  }

  async savePartner(partner: Partner): Promise<void> {
    await writeDoc('partners', partner.id, partner)
  }

  async deletePartner(id: string): Promise<void> {
    await deleteDoc('partners', id)
  }

  async getBlockedDates(): Promise<BlockedDate[]> {
    // Empty seed on purpose: readDocs returns its seed argument whenever the
    // table has zero rows, so a non-empty seed would resurrect every national
    // holiday the moment the admin deletes the last one. Supabase gets its
    // holidays from the one-time insert in supabase/schema.sql instead; demo
    // mode gets them from seedDatabase via LocalStore.
    const blockedDates = await readDocs<BlockedDate>('blocked_dates', [])
    return blockedDates.sort((a, b) => (a.date < b.date ? -1 : 1))
  }

  async saveBlockedDate(blockedDate: BlockedDate): Promise<void> {
    await writeDoc('blocked_dates', blockedDate.id, blockedDate)
  }

  async deleteBlockedDate(id: string): Promise<void> {
    await deleteDoc('blocked_dates', id)
  }

  async getSettings(): Promise<SiteSettings> {
    const rows = await readDocs<SiteSettings>('settings', [seedDatabase.settings])
    const stored = rows[0] ?? seedDatabase.settings
    // Rows written before these fields existed lack them entirely; default
    // here so every consumer can treat them as always-present — including the
    // admin form, which would otherwise render every weekday unchecked and
    // then persist "nothing is closed" on the first save.
    return {
      ...seedDatabase.settings,
      ...stored,
      closedWeekdays: stored.closedWeekdays ?? seedDatabase.settings.closedWeekdays,
    }
  }

  async saveSettings(settings: SiteSettings): Promise<void> {
    await writeDoc('settings', 'site', settings)
  }

  async getBookings(): Promise<Booking[]> {
    const { data, error } = await client()
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw new Error(`[supabase] read bookings: ${error.message}`)
    return ((data ?? []) as BookingRow[]).map(bookingFromRow)
  }

  async getBookingsForRoomDate(roomId: string, date: string): Promise<Booking[]> {
    const { data, error } = await client()
      .from('bookings')
      .select('*')
      .eq('room_id', roomId)
      .eq('date', date)
      .neq('status', 'cancelled')
    if (error) throw new Error(`[supabase] read bookings: ${error.message}`)
    return ((data ?? []) as BookingRow[]).map(bookingFromRow)
  }

  async createBooking(input: NewBooking): Promise<Booking> {
    // Application-level pre-check for a friendly error; the real guarantee is
    // the btree_gist exclusion constraint in schema.sql, surfaced as 23P01.
    const existing = await this.getBookingsForRoomDate(input.roomId, input.date)
    if (existing.some((b) => overlaps(b, input))) throw new BookingConflictError()

    const row = {
      id: randomUUID(),
      room_id: input.roomId,
      name: input.name,
      phone: input.phone,
      email: input.email,
      date: input.date,
      start_hour: input.startHour,
      end_hour: input.endHour,
      notes: input.notes,
      status: 'pending' as const,
    }
    const { data, error } = await client().from('bookings').insert(row).select('*').single()
    if (error) {
      if (error.code === '23P01') throw new BookingConflictError()
      throw new Error(`[supabase] create booking: ${error.message}`)
    }
    return bookingFromRow(data as BookingRow)
  }

  async updateBookingStatus(id: string, status: BookingStatus): Promise<void> {
    const { error } = await client().from('bookings').update({ status }).eq('id', id)
    if (error) throw new Error(`[supabase] update booking: ${error.message}`)
  }

  async getLeads(): Promise<Lead[]> {
    const { data, error } = await client()
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw new Error(`[supabase] read leads: ${error.message}`)
    return ((data ?? []) as LeadRow[]).map(leadFromRow)
  }

  async createLead(input: NewLead): Promise<Lead> {
    const row = {
      id: randomUUID(),
      name: input.name,
      phone: input.phone,
      email: input.email,
      service: input.service,
      message: input.message,
      source: input.source,
      status: 'new' as const,
    }
    const { data, error } = await client().from('leads').insert(row).select('*').single()
    if (error) throw new Error(`[supabase] create lead: ${error.message}`)
    return leadFromRow(data as LeadRow)
  }

  async updateLeadStatus(id: string, status: LeadStatus): Promise<void> {
    const { error } = await client().from('leads').update({ status }).eq('id', id)
    if (error) throw new Error(`[supabase] update lead: ${error.message}`)
  }
}
