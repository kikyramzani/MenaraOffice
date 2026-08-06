import 'server-only'

import type {
  Booking,
  BookingStatus,
  Database,
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

export type NewBooking = Omit<Booking, 'id' | 'createdAt' | 'status'>
export type NewLead = Omit<Lead, 'id' | 'createdAt' | 'status'>

/** Thrown when a booking overlaps an existing pending/confirmed booking. */
export class BookingConflictError extends Error {
  constructor() {
    super('Slot sudah terisi untuk jadwal tersebut')
    this.name = 'BookingConflictError'
  }
}

/**
 * Storage abstraction behind the whole site.
 *
 * Two implementations exist: `LocalStore` (seed data + JSON file persistence,
 * used while Supabase env vars are absent) and `SupabaseStore`. Pages, API
 * routes and admin actions only ever talk to this interface, so switching to
 * Supabase is purely an environment-variable change.
 */
export interface DataStore {
  getServices(): Promise<Service[]>
  saveService(service: Service): Promise<void>

  getLocations(): Promise<OfficeLocation[]>
  saveLocation(location: OfficeLocation): Promise<void>

  getRooms(): Promise<Room[]>
  saveRoom(room: Room): Promise<void>

  getPosts(): Promise<Post[]>
  savePost(post: Post): Promise<void>
  deletePost(id: string): Promise<void>

  getTestimonials(): Promise<Testimonial[]>
  saveTestimonial(testimonial: Testimonial): Promise<void>
  deleteTestimonial(id: string): Promise<void>

  getPartners(): Promise<Partner[]>
  savePartner(partner: Partner): Promise<void>
  deletePartner(id: string): Promise<void>

  getSettings(): Promise<SiteSettings>
  saveSettings(settings: SiteSettings): Promise<void>

  getBookings(): Promise<Booking[]>
  getBookingsForRoomDate(roomId: string, date: string): Promise<Booking[]>
  /** Rejects with {@link BookingConflictError} when the slot overlaps. */
  createBooking(input: NewBooking): Promise<Booking>
  updateBookingStatus(id: string, status: BookingStatus): Promise<void>

  getLeads(): Promise<Lead[]>
  createLead(input: NewLead): Promise<Lead>
  updateLeadStatus(id: string, status: LeadStatus): Promise<void>
}

export function hasSupabaseEnv(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
}

/** True overlap test on [start, end) hour ranges. */
export function overlaps(a: { startHour: number; endHour: number }, b: { startHour: number; endHour: number }): boolean {
  return a.startHour < b.endHour && a.endHour > b.startHour
}

export type { Database }
