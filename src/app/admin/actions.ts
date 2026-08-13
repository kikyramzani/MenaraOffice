'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createSession, destroySession, getSession, verifyCredentials } from '@/lib/auth'
import { getStore } from '@/lib/data'
import { checkRateLimit, peekRateLimit } from '@/lib/rate-limit'
import type {
  BookingStatus,
  L10n,
  LeadStatus,
  OfficeLocation,
  Partner,
  Post,
  PricingTier,
  Room,
  Service,
  SiteSettings,
  Testimonial,
} from '@/lib/data/types'

/** Every mutating action funnels through this guard. */
async function requireSession(): Promise<void> {
  const session = await getSession()
  if (!session) redirect('/admin/login')
}

function text(formData: FormData, key: string): string {
  const value = formData.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

function num(formData: FormData, key: string, fallback = 0): number {
  const value = Number(text(formData, key))
  return Number.isFinite(value) ? value : fallback
}

function l10n(formData: FormData, key: string): L10n {
  return { id: text(formData, `${key}_id`), en: text(formData, `${key}_en`) }
}

/**
 * Feature lists are edited as one line per feature, `indonesia | english`.
 * A line without a pipe uses the same text for both languages.
 */
function parseFeatureLines(raw: string): L10n[] {
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [id = '', en = ''] = line.split('|').map((part) => part.trim())
      return { id, en: en || id }
    })
}

/** Comma-separated whole numbers, e.g. "2, 3, 4" — used for pax-capacity lists. */
function parseNumberList(raw: string): number[] {
  return raw
    .split(',')
    .map((part) => Number(part.trim()))
    .filter((value) => Number.isFinite(value) && value > 0)
}

// ---------- auth ----------

export async function loginAction(
  _prev: { error: string } | null,
  formData: FormData,
): Promise<{ error: string } | null> {
  const email = text(formData, 'email')
  const password = typeof formData.get('password') === 'string' ? String(formData.get('password')) : ''

  // Only FAILED attempts consume the brute-force budget; a legitimate admin
  // logging in repeatedly must never lock the account.
  const rateKey = `admin-login:${email.toLowerCase()}`
  const rate = peekRateLimit(rateKey)
  if (!rate.allowed) {
    return { error: `Terlalu banyak percobaan. Coba lagi dalam ${rate.retryAfter} detik.` }
  }

  const valid = await verifyCredentials(email, password)
  if (!valid) {
    checkRateLimit(rateKey, { limit: 5, windowMs: 5 * 60_000 })
    return { error: 'Email atau password salah.' }
  }

  await createSession(email)
  redirect('/admin')
}

export async function logoutAction(): Promise<void> {
  await destroySession()
  redirect('/admin/login')
}

// ---------- leads & bookings ----------

export async function updateLeadStatusAction(formData: FormData): Promise<void> {
  await requireSession()
  const id = text(formData, 'id')
  const status = text(formData, 'status') as LeadStatus
  if (!id || !['new', 'contacted', 'closed'].includes(status)) return
  await getStore().updateLeadStatus(id, status)
  revalidatePath('/admin/leads')
}

export async function updateBookingStatusAction(formData: FormData): Promise<void> {
  await requireSession()
  const id = text(formData, 'id')
  const status = text(formData, 'status') as BookingStatus
  if (!id || !['pending', 'confirmed', 'cancelled'].includes(status)) return
  await getStore().updateBookingStatus(id, status)
  revalidatePath('/admin/booking')
}

// ---------- services & pricing ----------

export async function saveServiceAction(formData: FormData): Promise<void> {
  await requireSession()
  const store = getStore()
  const services = await store.getServices()
  const existing = services.find((service) => service.id === text(formData, 'id'))
  if (!existing) return

  const tierCount = num(formData, 'tierCount')
  const tiers: PricingTier[] = []
  for (let index = 0; index < tierCount; index += 1) {
    const source = existing.tiers[index]
    if (!source) continue
    const unit = text(formData, `tier_${index}_unit`)
    tiers.push({
      ...source,
      name: text(formData, `tier_${index}_name`) || source.name,
      price: num(formData, `tier_${index}_price`, source.price),
      unit: (['month', 'year', 'hour', 'once'] as const).find((value) => value === unit) ?? source.unit,
      priceNote: {
        id: text(formData, `tier_${index}_note_id`) || source.priceNote.id,
        en: text(formData, `tier_${index}_note_en`) || source.priceNote.en,
      },
      features: parseFeatureLines(text(formData, `tier_${index}_features`)),
      isPopular: text(formData, 'popularTier') === String(index),
    })
  }

  const updated: Service = {
    ...existing,
    name: l10n(formData, 'name'),
    tagline: l10n(formData, 'tagline'),
    description: l10n(formData, 'description'),
    features: parseFeatureLines(text(formData, 'features')),
    active: formData.get('active') === 'on',
    tiers: tiers.length > 0 ? tiers : existing.tiers,
  }

  await store.saveService(updated)
  revalidatePath('/admin/layanan')
  redirect('/admin/layanan')
}

// ---------- locations & rooms ----------

export async function saveLocationAction(formData: FormData): Promise<void> {
  await requireSession()
  const store = getStore()
  const locations = await store.getLocations()
  const existing = locations.find((location) => location.id === text(formData, 'id'))
  if (!existing) return

  const updated: OfficeLocation = {
    ...existing,
    name: text(formData, 'name') || existing.name,
    city: text(formData, 'city') || existing.city,
    address: text(formData, 'address') || existing.address,
    photo: text(formData, 'photo') || existing.photo,
    gmapsQuery: text(formData, 'gmapsQuery') || existing.gmapsQuery,
    facilities: parseFeatureLines(text(formData, 'facilities')),
    servicedOfficeCapacities: parseNumberList(text(formData, 'servicedOfficeCapacities')),
    active: formData.get('active') === 'on',
  }

  await store.saveLocation(updated)
  revalidatePath('/admin/lokasi')
  redirect('/admin/lokasi')
}

export async function saveRoomAction(formData: FormData): Promise<void> {
  await requireSession()
  const store = getStore()
  const rooms = await store.getRooms()
  const existing = rooms.find((room) => room.id === text(formData, 'id'))
  if (!existing) return

  const updated: Room = {
    ...existing,
    name: text(formData, 'name') || existing.name,
    capacity: Math.min(Math.max(Math.round(num(formData, 'capacity', existing.capacity)), 1), 500),
    pricePerHour: Math.min(
      Math.max(Math.round(num(formData, 'pricePerHour', existing.pricePerHour)), 0),
      100_000_000,
    ),
    active: formData.get('active') === 'on',
  }

  await store.saveRoom(updated)
  revalidatePath('/admin/ruangan')
}

// ---------- blog ----------

export async function savePostAction(formData: FormData): Promise<void> {
  await requireSession()
  const store = getStore()
  const posts = await store.getPosts()
  const id = text(formData, 'id')
  const existing = posts.find((post) => post.id === id)

  const slug =
    text(formData, 'slug')
      .toLowerCase()
      .replace(/[^a-z0-9-\s]/g, '')
      .replace(/\s+/g, '-') || `artikel-${Date.now()}`

  const post: Post = {
    id: existing?.id ?? crypto.randomUUID(),
    slug,
    title: l10n(formData, 'title'),
    excerpt: l10n(formData, 'excerpt'),
    content: l10n(formData, 'content'),
    cover: text(formData, 'cover') || existing?.cover || '/images/locations/menara-karya.webp',
    status: text(formData, 'status') === 'published' ? 'published' : 'draft',
    publishedAt: text(formData, 'publishedAt') || existing?.publishedAt || new Date().toISOString().slice(0, 10),
    createdAt: existing?.createdAt ?? new Date().toISOString().slice(0, 10),
  }

  await store.savePost(post)
  revalidatePath('/admin/blog')
  redirect('/admin/blog')
}

export async function deletePostAction(formData: FormData): Promise<void> {
  await requireSession()
  const id = text(formData, 'id')
  if (!id) return
  await getStore().deletePost(id)
  revalidatePath('/admin/blog')
}

// ---------- testimonials ----------

export async function saveTestimonialAction(formData: FormData): Promise<void> {
  await requireSession()
  const store = getStore()
  const testimonials = await store.getTestimonials()
  const id = text(formData, 'id')
  const existing = testimonials.find((testimonial) => testimonial.id === id)

  const testimonial: Testimonial = {
    id: existing?.id ?? crypto.randomUUID(),
    name: text(formData, 'name'),
    role: text(formData, 'role'),
    quote: l10n(formData, 'quote'),
    order: num(formData, 'order', existing?.order ?? testimonials.length + 1),
    active: formData.get('active') === 'on',
  }
  if (!testimonial.name || !testimonial.quote.id) return

  await store.saveTestimonial(testimonial)
  revalidatePath('/admin/testimoni')
}

export async function deleteTestimonialAction(formData: FormData): Promise<void> {
  await requireSession()
  const id = text(formData, 'id')
  if (!id) return
  await getStore().deleteTestimonial(id)
  revalidatePath('/admin/testimoni')
}

// ---------- partners ----------

export async function savePartnerAction(formData: FormData): Promise<void> {
  await requireSession()
  const store = getStore()
  const partners = await store.getPartners()
  const id = text(formData, 'id')
  const existing = partners.find((partner) => partner.id === id)

  const partner: Partner = {
    id: existing?.id ?? crypto.randomUUID(),
    name: text(formData, 'name'),
    logo: text(formData, 'logo') || existing?.logo || '',
    website: text(formData, 'website'),
    order: num(formData, 'order', existing?.order ?? partners.length + 1),
    active: formData.get('active') === 'on',
  }
  if (!partner.name || !partner.logo) return

  await store.savePartner(partner)
  revalidatePath('/admin/partner')
}

export async function deletePartnerAction(formData: FormData): Promise<void> {
  await requireSession()
  const id = text(formData, 'id')
  if (!id) return
  await getStore().deletePartner(id)
  revalidatePath('/admin/partner')
}

// ---------- blocked dates ----------

/** Expands a start/end pair into one ISO date per day; blank end means one day. */
function eachIsoDate(start: string, end: string): string[] {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(start)) return []
  const last = /^\d{4}-\d{2}-\d{2}$/.test(end) && end >= start ? end : start
  const dates: string[] = []
  // UTC arithmetic: a DST transition in the server's local zone would
  // otherwise make a naive +1-day march skip or repeat a date.
  let cursor = Date.parse(`${start}T00:00:00Z`)
  // The 366 cap stops a fat-fingered end year from writing thousands of rows.
  while (dates.length < 366) {
    const iso = new Date(cursor).toISOString().slice(0, 10)
    if (iso > last) break
    dates.push(iso)
    cursor += 86_400_000
  }
  return dates
}

export async function saveBlockedDateAction(formData: FormData): Promise<void> {
  await requireSession()
  const store = getStore()
  const id = text(formData, 'id')
  const existing = (await store.getBlockedDates()).find((entry) => entry.id === id)

  const label = l10n(formData, 'label')
  const locationIds =
    formData.get('allLocations') === 'on'
      ? []
      : formData.getAll('locationIds').map(String).filter(Boolean)
  const active = formData.get('active') === 'on'

  // Editing an existing row never re-expands a range — otherwise the toggle
  // button would silently fan one row out into many.
  if (existing) {
    await store.saveBlockedDate({
      ...existing,
      label: label.id ? { id: label.id, en: label.en || label.id } : existing.label,
      locationIds,
      active,
    })
    revalidatePath('/admin/tanggal-libur')
    return
  }

  const dates = eachIsoDate(text(formData, 'date'), text(formData, 'dateEnd'))
  if (dates.length === 0 || !label.id) return

  for (const date of dates) {
    await store.saveBlockedDate({
      id: crypto.randomUUID(),
      date,
      label: { id: label.id, en: label.en || label.id },
      locationIds,
      source: 'manual',
      active,
    })
  }
  revalidatePath('/admin/tanggal-libur')
}

export async function deleteBlockedDateAction(formData: FormData): Promise<void> {
  await requireSession()
  const id = text(formData, 'id')
  if (!id) return
  await getStore().deleteBlockedDate(id)
  revalidatePath('/admin/tanggal-libur')
}

// ---------- settings ----------

export async function saveSettingsAction(formData: FormData): Promise<void> {
  await requireSession()
  const store = getStore()
  const existing = await store.getSettings()

  const openHour = num(formData, 'bookingOpenHour', existing.bookingOpenHour)
  const closeHour = num(formData, 'bookingCloseHour', existing.bookingCloseHour)

  // Unlike every other field here, an empty result is meaningful rather than
  // "field absent": the form always renders the checkbox group, so [] really
  // does mean the admin opened every day. Do not fall back to `existing`.
  const closedWeekdays = formData
    .getAll('closedWeekdays')
    .map((value) => Number(value))
    .filter((value) => Number.isInteger(value) && value >= 0 && value <= 6)

  const updated: SiteSettings = {
    waNumber: text(formData, 'waNumber').replace(/\D/g, '') || existing.waNumber,
    email: text(formData, 'email') || existing.email,
    emailSecondary: text(formData, 'emailSecondary'),
    instagram: text(formData, 'instagram'),
    headOffice: text(formData, 'headOffice') || existing.headOffice,
    bookingOpenHour: Math.min(Math.max(openHour, 0), 23),
    bookingCloseHour: Math.min(Math.max(closeHour > openHour ? closeHour : openHour + 1, 1), 24),
    closedWeekdays,
  }

  await store.saveSettings(updated)
  revalidatePath('/admin/pengaturan')
}
