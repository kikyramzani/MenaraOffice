/** Bilingual text value — Indonesian is the primary market language. */
export type L10n = { id: string; en: string }

export type PricingTier = {
  id: string
  name: string
  /** Price in IDR. */
  price: number
  unit: 'month' | 'year' | 'hour' | 'once'
  priceNote: L10n
  features: L10n[]
  isPopular: boolean
  order: number
}

export type Service = {
  id: string
  slug: string
  name: L10n
  tagline: L10n
  description: L10n
  /** Key of the icon rendered on cards and detail pages. */
  icon: 'building' | 'desk' | 'meeting' | 'document' | 'scale'
  heroImage: string
  features: L10n[]
  tiers: PricingTier[]
  order: number
  active: boolean
}

export type OfficeLocation = {
  id: string
  slug: string
  name: string
  city: string
  address: string
  photo: string
  /** Extra branch photos shown as a gallery below the hero; empty hides the section. */
  gallery: string[]
  gmapsQuery: string
  facilities: L10n[]
  /** Serviced Office room sizes (pax) available at this location; empty when not offered here. */
  servicedOfficeCapacities: number[]
  order: number
  active: boolean
}

export type Room = {
  id: string
  locationId: string
  name: string
  capacity: number
  pricePerHour: number
  active: boolean
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled'

export type Booking = {
  id: string
  roomId: string
  name: string
  phone: string
  email: string
  /** ISO date, e.g. 2026-08-01 */
  date: string
  /** 24h clock, inclusive start / exclusive end, e.g. 9 → 12 means 09:00–12:00. */
  startHour: number
  endHour: number
  notes: string
  status: BookingStatus
  createdAt: string
}

export type LeadStatus = 'new' | 'contacted' | 'closed'

export type Lead = {
  id: string
  name: string
  phone: string
  email: string
  service: string
  message: string
  status: LeadStatus
  source: string
  createdAt: string
}

export type PostStatus = 'draft' | 'published'

export type Post = {
  id: string
  slug: string
  title: L10n
  excerpt: L10n
  /** Markdown body. */
  content: L10n
  cover: string
  status: PostStatus
  publishedAt: string
  createdAt: string
}

export type Testimonial = {
  id: string
  name: string
  role: string
  quote: L10n
  order: number
  active: boolean
}

export type Partner = {
  id: string
  name: string
  logo: string
  /** Optional link to the partner's site; empty string renders a plain logo. */
  website: string
  order: number
  active: boolean
}

export type BlockedDateSource = 'holiday' | 'manual'

export type BlockedDate = {
  id: string
  /** ISO date, e.g. 2026-08-17. One row is exactly one calendar day. */
  date: string
  label: L10n
  /**
   * Empty array is the "all locations" scope — a national holiday closes the
   * whole company. A non-empty array blocks only those locations, so an
   * internal event at Menara Karya leaves Bandung bookable.
   */
  locationIds: string[]
  /** Seeded national holidays vs. internal events the admin added by hand. */
  source: BlockedDateSource
  active: boolean
}

export type SiteSettings = {
  waNumber: string
  email: string
  /** Second public address; both are shown in the footer and contact page. */
  emailSecondary: string
  instagram: string
  headOffice: string
  /** Booking hours (24h clock) offered by the availability calendar. */
  bookingOpenHour: number
  bookingCloseHour: number
  /** Weekdays that take no bookings at all. 0 = Sunday … 6 = Saturday. */
  closedWeekdays: number[]
}

export type Database = {
  services: Service[]
  locations: OfficeLocation[]
  rooms: Room[]
  bookings: Booking[]
  leads: Lead[]
  posts: Post[]
  testimonials: Testimonial[]
  partners: Partner[]
  blockedDates: BlockedDate[]
  settings: SiteSettings
}
