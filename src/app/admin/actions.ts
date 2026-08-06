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
    tiers.push({
      ...source,
      name: text(formData, `tier_${index}_name`) || source.name,
      price: num(formData, `tier_${index}_price`, source.price),
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

// ---------- settings ----------

export async function saveSettingsAction(formData: FormData): Promise<void> {
  await requireSession()
  const store = getStore()
  const existing = await store.getSettings()

  const openHour = num(formData, 'bookingOpenHour', existing.bookingOpenHour)
  const closeHour = num(formData, 'bookingCloseHour', existing.bookingCloseHour)

  const updated: SiteSettings = {
    waNumber: text(formData, 'waNumber').replace(/\D/g, '') || existing.waNumber,
    email: text(formData, 'email') || existing.email,
    instagram: text(formData, 'instagram'),
    headOffice: text(formData, 'headOffice') || existing.headOffice,
    bookingOpenHour: Math.min(Math.max(openHour, 0), 23),
    bookingCloseHour: Math.min(Math.max(closeHour > openHour ? closeHour : openHour + 1, 1), 24),
  }

  await store.saveSettings(updated)
  revalidatePath('/admin/pengaturan')
}
