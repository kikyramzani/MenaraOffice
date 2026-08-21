import messages from '../../../messages/id.json'

/**
 * Copy for the printed profile.
 *
 * Anything that already exists on the website is read from `messages/id.json`
 * so the document never drifts from the site, and only text that has no
 * on-screen equivalent (cover, contents, onboarding steps) is defined here.
 */
export const site = messages

export const DOC_TITLE = 'Company Profile'
export const DOC_BRAND = 'Menara Office'

/** Section labels used by both the table of contents and the page headings. */
export const SECTION = {
  about: 'Sekilas Menara Office',
  why: 'Mengapa Menara Office',
  services: 'Layanan Kami',
  locations: 'Jaringan Lokasi',
  process: 'Cara Memulai',
  faq: 'Pertanyaan Umum',
  partners: 'Mitra Profesional',
  contact: 'Hubungi Kami',
} as const

export const COVER_BLURB =
  'Virtual Office · Serviced Office · Meeting Room · Pendirian PT & CV · Legal Consultant'

export const ABOUT_LEAD =
  'Kantor profesional untuk bisnis Anda, mulai hari ini — tanpa beban sewa gedung.'

/** Four onboarding steps, distilled from the FAQ and the contact-page promise. */
export const PROCESS_STEPS = [
  {
    title: 'Konsultasi gratis',
    body: 'Ceritakan kebutuhan Anda lewat WhatsApp, formulir website, atau kunjungan langsung. Tim kami membalas dalam 1×24 jam kerja.',
  },
  {
    title: 'Pilih paket & lokasi',
    body: 'Kami bantu memilih layanan dan cabang yang paling sesuai dengan tahap bisnis serta kebutuhan zonasi domisili Anda.',
  },
  {
    title: 'Lengkapi dokumen',
    body: 'Siapkan identitas penanggung jawab dan dokumen pendukung. Untuk pendirian badan usaha, kami dampingi dari akta sampai NIB.',
  },
  {
    title: 'Kantor Anda aktif',
    body: 'Setelah dokumen lengkap dan pembayaran diterima, alamat Anda aktif di hari kerja yang sama, termasuk penerimaan surat dan layanan resepsionis.',
  },
] as const

export const PROCESS_LEAD =
  'Empat langkah dari perkenalan sampai alamat kantor Anda resmi berjalan.'

export const CONTACT_LEAD =
  'Satu pesan sudah cukup untuk memulai. Tim kami membalas dalam 1×24 jam kerja.'

export const PARTNERS_LEAD =
  'Kami bekerja sama dengan konsultan hukum dan mitra profesional untuk memastikan setiap kebutuhan legalitas klien tertangani dengan benar.'

export const WEBSITE = 'menaraoffice.id'
export const CLOSING_LINE = 'Empowering Entrepreneurs'

/**
 * The site tagline opens with the brand line, which the about page already
 * sets as a pull quote — this drops the echo and keeps the sentence after it.
 */
export const BRAND_PROMISE = site.footer.tagline.replace(`${CLOSING_LINE}. `, '')
