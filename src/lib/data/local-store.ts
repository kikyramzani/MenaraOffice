import 'server-only'

import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'
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

/**
 * Demo-mode store: seed content plus JSON-file persistence.
 *
 * Locally the file lives in `.data/db.json` (gitignored) so admin edits
 * survive restarts. On Vercel the filesystem is read-only except `/tmp`, so
 * writes land there and survive only for the lifetime of the lambda instance —
 * acceptable for a preview deployment, and documented in the handover report.
 *
 * Concurrency: every mutation runs through a process-wide promise queue
 * (`withLock`), so two near-simultaneous booking requests cannot both pass
 * the overlap check on the same snapshot or clobber each other's persist.
 */
const DB_FILE = process.env.VERCEL
  ? '/tmp/menara-office-db.json'
  : path.join(process.cwd(), '.data', 'db.json')

type GlobalWithDb = typeof globalThis & {
  __moDb?: Database
  __moDbLoaded?: boolean
  __moDbLock?: Promise<unknown>
}
const g = globalThis as GlobalWithDb

function clone<T>(value: T): T {
  return structuredClone(value)
}

/** Serialises mutations; readers stay lock-free on the in-memory snapshot. */
function withLock<T>(task: () => Promise<T>): Promise<T> {
  const run = (g.__moDbLock ?? Promise.resolve()).then(task, task)
  // The chain itself must never reject, or every later mutation would fail.
  g.__moDbLock = run.catch(() => undefined)
  return run
}

async function loadDb(): Promise<Database> {
  if (g.__moDb && g.__moDbLoaded) return g.__moDb
  try {
    const raw = await readFile(DB_FILE, 'utf8')
    const parsed = JSON.parse(raw) as Database
    if (Array.isArray(parsed.services) && parsed.settings) {
      // Files written by an earlier version lack fields added since. Default
      // them in rather than rejecting the whole file as malformed — a missing
      // array would otherwise crash on the first `.sort()`/`.filter()`.
      g.__moDb = {
        ...parsed,
        partners: parsed.partners ?? seedDatabase.partners,
        blockedDates: parsed.blockedDates ?? seedDatabase.blockedDates,
        settings: {
          ...seedDatabase.settings,
          ...parsed.settings,
          // Defaulting to Sat+Sun rather than [] matters: [] would silently
          // reopen weekends on every existing deployment.
          closedWeekdays: parsed.settings.closedWeekdays ?? seedDatabase.settings.closedWeekdays,
        },
        locations: parsed.locations.map((location) => ({
          ...location,
          servicedOfficeCapacities: location.servicedOfficeCapacities ?? [],
        })),
      }
    } else {
      console.warn('[local-store] db file has unexpected shape — falling back to seed content')
      g.__moDb = clone(seedDatabase)
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      console.warn('[local-store] db file unreadable/corrupt — falling back to seed content:', error)
    }
    g.__moDb = clone(seedDatabase)
  }
  g.__moDbLoaded = true
  return g.__moDb
}

/**
 * Commits a new database snapshot: memory first, then an atomic
 * write-to-temp + rename so a killed process can never leave a corrupt file.
 * Throws on write failure — callers surface it instead of claiming success —
 * and rolls the in-memory snapshot back so state matches disk.
 */
async function persist(db: Database): Promise<void> {
  const previous = g.__moDb
  g.__moDb = db
  try {
    await mkdir(path.dirname(DB_FILE), { recursive: true })
    const tempFile = `${DB_FILE}.${randomUUID()}.tmp`
    await writeFile(tempFile, JSON.stringify(db, null, 2), 'utf8')
    await rename(tempFile, DB_FILE)
  } catch (error) {
    g.__moDb = previous
    console.error('[local-store] failed to persist database file:', error)
    throw new Error('Failed to persist data store')
  }
}

function upsert<T extends { id: string }>(list: T[], item: T): T[] {
  const index = list.findIndex((entry) => entry.id === item.id)
  if (index === -1) return [...list, item]
  return [...list.slice(0, index), item, ...list.slice(index + 1)]
}

export class LocalStore implements DataStore {
  async getServices(): Promise<Service[]> {
    const db = await loadDb()
    return clone(db.services).sort((a, b) => a.order - b.order)
  }

  async saveService(service: Service): Promise<void> {
    await withLock(async () => {
      const db = await loadDb()
      await persist({ ...db, services: upsert(db.services, clone(service)) })
    })
  }

  async getLocations(): Promise<OfficeLocation[]> {
    const db = await loadDb()
    return clone(db.locations).sort((a, b) => a.order - b.order)
  }

  async saveLocation(location: OfficeLocation): Promise<void> {
    await withLock(async () => {
      const db = await loadDb()
      await persist({ ...db, locations: upsert(db.locations, clone(location)) })
    })
  }

  async getRooms(): Promise<Room[]> {
    const db = await loadDb()
    return clone(db.rooms)
  }

  async saveRoom(room: Room): Promise<void> {
    await withLock(async () => {
      const db = await loadDb()
      await persist({ ...db, rooms: upsert(db.rooms, clone(room)) })
    })
  }

  async getPosts(): Promise<Post[]> {
    const db = await loadDb()
    return clone(db.posts).sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1))
  }

  async savePost(post: Post): Promise<void> {
    await withLock(async () => {
      const db = await loadDb()
      await persist({ ...db, posts: upsert(db.posts, clone(post)) })
    })
  }

  async deletePost(id: string): Promise<void> {
    await withLock(async () => {
      const db = await loadDb()
      await persist({ ...db, posts: db.posts.filter((post) => post.id !== id) })
    })
  }

  async getTestimonials(): Promise<Testimonial[]> {
    const db = await loadDb()
    return clone(db.testimonials).sort((a, b) => a.order - b.order)
  }

  async saveTestimonial(testimonial: Testimonial): Promise<void> {
    await withLock(async () => {
      const db = await loadDb()
      await persist({ ...db, testimonials: upsert(db.testimonials, clone(testimonial)) })
    })
  }

  async deleteTestimonial(id: string): Promise<void> {
    await withLock(async () => {
      const db = await loadDb()
      await persist({ ...db, testimonials: db.testimonials.filter((t) => t.id !== id) })
    })
  }

  async getPartners(): Promise<Partner[]> {
    const db = await loadDb()
    return clone(db.partners).sort((a, b) => a.order - b.order)
  }

  async savePartner(partner: Partner): Promise<void> {
    await withLock(async () => {
      const db = await loadDb()
      await persist({ ...db, partners: upsert(db.partners, clone(partner)) })
    })
  }

  async deletePartner(id: string): Promise<void> {
    await withLock(async () => {
      const db = await loadDb()
      await persist({ ...db, partners: db.partners.filter((p) => p.id !== id) })
    })
  }

  async getBlockedDates(): Promise<BlockedDate[]> {
    const db = await loadDb()
    return clone(db.blockedDates).sort((a, b) => (a.date < b.date ? -1 : 1))
  }

  async saveBlockedDate(blockedDate: BlockedDate): Promise<void> {
    await withLock(async () => {
      const db = await loadDb()
      await persist({ ...db, blockedDates: upsert(db.blockedDates, clone(blockedDate)) })
    })
  }

  async deleteBlockedDate(id: string): Promise<void> {
    await withLock(async () => {
      const db = await loadDb()
      await persist({ ...db, blockedDates: db.blockedDates.filter((entry) => entry.id !== id) })
    })
  }

  async getSettings(): Promise<SiteSettings> {
    const db = await loadDb()
    return clone(db.settings)
  }

  async saveSettings(settings: SiteSettings): Promise<void> {
    await withLock(async () => {
      const db = await loadDb()
      await persist({ ...db, settings: clone(settings) })
    })
  }

  async getBookings(): Promise<Booking[]> {
    const db = await loadDb()
    return clone(db.bookings).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
  }

  async getBookingsForRoomDate(roomId: string, date: string): Promise<Booking[]> {
    const db = await loadDb()
    return clone(
      db.bookings.filter(
        (b) => b.roomId === roomId && b.date === date && b.status !== 'cancelled',
      ),
    )
  }

  async createBooking(input: NewBooking): Promise<Booking> {
    // Conflict check and insert share one lock slot, so a concurrent request
    // sees this booking before running its own check.
    return withLock(async () => {
      const db = await loadDb()
      const conflicting = db.bookings.some(
        (b) =>
          b.roomId === input.roomId &&
          b.date === input.date &&
          b.status !== 'cancelled' &&
          overlaps(b, input),
      )
      if (conflicting) throw new BookingConflictError()

      const booking: Booking = {
        ...input,
        id: randomUUID(),
        status: 'pending',
        createdAt: new Date().toISOString(),
      }
      await persist({ ...db, bookings: [...db.bookings, booking] })
      return clone(booking)
    })
  }

  async updateBookingStatus(id: string, status: BookingStatus): Promise<void> {
    await withLock(async () => {
      const db = await loadDb()
      await persist({
        ...db,
        bookings: db.bookings.map((b) => (b.id === id ? { ...b, status } : b)),
      })
    })
  }

  async getLeads(): Promise<Lead[]> {
    const db = await loadDb()
    return clone(db.leads).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
  }

  async createLead(input: NewLead): Promise<Lead> {
    return withLock(async () => {
      const db = await loadDb()
      const lead: Lead = {
        ...input,
        id: randomUUID(),
        status: 'new',
        createdAt: new Date().toISOString(),
      }
      await persist({ ...db, leads: [...db.leads, lead] })
      return clone(lead)
    })
  }

  async updateLeadStatus(id: string, status: LeadStatus): Promise<void> {
    await withLock(async () => {
      const db = await loadDb()
      await persist({
        ...db,
        leads: db.leads.map((lead) => (lead.id === id ? { ...lead, status } : lead)),
      })
    })
  }
}
