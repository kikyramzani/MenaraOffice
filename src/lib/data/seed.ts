import type { BlockedDate, Database, L10n, PricingTier } from './types'

const l = (id: string, en: string): L10n => ({ id, en })

/**
 * Serviced Office tiers differ only by room size and price; the inclusions are
 * identical, so they are generated rather than copied three times.
 */
const servicedOfficeTier = (
  id: string,
  pax: number,
  price: number,
  order: number,
): PricingTier => ({
  id,
  name: `${pax} Pax`,
  price,
  unit: 'month',
  priceNote: l('Start From', 'Start From'),
  features: [
    l(`Kantor privat ${pax} orang`, `Private office for ${pax}`),
    l('Free meeting room 12 jam/bulan', 'Free meeting room, 12 hrs/month'),
    l('Free pantry (air mineral, teh, kopi)', 'Free pantry (water, tea, coffee)'),
    l('Siap pakai, lengkap dengan furnitur', 'Move-in ready and fully furnished'),
    l('Office boy & resepsionis', 'Office support staff & reception'),
    l('Free domisili surat', 'Free mail-handling address'),
    l('Fleksibilitas penyewaan', 'Flexible lease terms'),
  ],
  isPopular: false,
  order,
})

/** Date-derived ids keep the Supabase provisioning insert idempotent. */
const holiday = (date: string, id: string, en: string): BlockedDate => ({
  id: `holiday-${date}`,
  date,
  label: l(id, en),
  // Empty = every location: a national holiday closes the whole company.
  locationIds: [],
  source: 'holiday',
  active: true,
})

/**
 * Initial content, ported from menaraoffice.id with the August-2026 price
 * revision applied: Virtual Office starts from Rp 4 juta **per year**,
 * Serviced Office from Rp 4 juta per month, and Meeting Room is a flat
 * Rp 150 rb/jam across every branch.
 *
 * Every value here is editable from the admin panel; nothing is hardcoded in
 * pages.
 */
export const seedDatabase: Database = {
  services: [
    {
      id: 'svc-virtual-office',
      slug: 'virtual-office',
      name: l('Virtual Office', 'Virtual Office'),
      tagline: l(
        'Alamat bisnis bergengsi tanpa biaya sewa kantor fisik',
        'A prestigious business address without the cost of a physical office',
      ),
      description: l(
        'Gunakan alamat gedung perkantoran premium di Jakarta, Bekasi, dan Bandung untuk legalitas dan citra profesional perusahaan Anda. Surat-menyurat ditangani resepsionis kami, dan Anda tetap mendapat akses meeting room.',
        'Use a premium office-tower address in Jakarta, Bekasi, or Bandung for your company registration and professional image. Our receptionists handle your mail, and you keep access to meeting rooms.',
      ),
      icon: 'building',
      heroImage: '/images/services/virtual-office.webp',
      features: [
        l('Alamat bisnis bergengsi', 'Prestigious business address'),
        l('Hemat biaya operasional', 'Lower operating costs'),
        l('Meningkatkan kepercayaan klien', 'Boosts client trust'),
        l('Bebas macet & parkir', 'No commute or parking hassle'),
        l('Layanan resepsionis', 'Receptionist service'),
        l('Free meeting room', 'Free meeting room'),
        l('Free domisili surat', 'Free mail-handling address'),
      ],
      tiers: [
        {
          id: 'tier-vo-basic',
          name: 'Basic',
          price: 4_000_000,
          unit: 'year',
          priceNote: l('Start From', 'Start From'),
          features: [
            l('Alamat bergengsi', 'Prestigious address'),
            l('Hemat biaya operasional', 'Lower operating costs'),
            l('Meningkatkan kepercayaan', 'Boosts client trust'),
            l('Bebas macet & parkir', 'No commute or parking hassle'),
            l('Layanan resepsionis', 'Receptionist service'),
            l('Free meeting room', 'Free meeting room'),
            l('Free domisili surat', 'Free mail-handling address'),
          ],
          isPopular: false,
          order: 1,
        },
        {
          id: 'tier-vo-business',
          name: 'Business',
          price: 6_000_000,
          unit: 'year',
          priceNote: l('Meeting Room Semua Cabang', 'All-Branch Meeting Room'),
          features: [
            l('Semua fitur Basic', 'Everything in Basic'),
            l('Free meeting room 120 jam/tahun', 'Free meeting room, 120 hrs/year'),
            l('Berlaku di semua cabang Menara Office', 'Valid at every Menara Office branch'),
          ],
          isPopular: false,
          order: 2,
        },
      ],
      order: 1,
      active: true,
    },
    {
      id: 'svc-serviced-office',
      slug: 'serviced-office',
      name: l('Serviced Office', 'Serviced Office'),
      tagline: l(
        'Kantor siap pakai dengan layanan lengkap, tinggal bawa laptop',
        'A fully serviced, move-in-ready office. Just bring your laptop',
      ),
      description: l(
        'Ruang kantor privat berperabot lengkap dengan internet, resepsionis, pantry, dan office boy. Sewa fleksibel tanpa investasi fit-out, cocok untuk tim yang ingin langsung produktif.',
        'Private, fully furnished offices with internet, reception, pantry, and support staff. Flexible terms with zero fit-out investment, perfect for teams that need to be productive from day one.',
      ),
      icon: 'desk',
      heroImage: '/images/services/serviced-office.webp',
      features: [
        l('Efisiensi biaya & waktu', 'Cost & time efficiency'),
        l('Fleksibilitas penyewaan', 'Flexible lease terms'),
        l('Siap pakai', 'Move-in ready'),
        l('Free meeting room', 'Free meeting room'),
        l('Free pantry', 'Free pantry'),
        l('Office boy', 'Office support staff'),
        l('Free domisili surat', 'Free mail-handling address'),
      ],
      tiers: [
        servicedOfficeTier('tier-so-2pax', 2, 4_000_000, 1),
        servicedOfficeTier('tier-so-3pax', 3, 5_000_000, 2),
        servicedOfficeTier('tier-so-4pax', 4, 6_000_000, 3),
      ],
      order: 2,
      active: true,
    },
    {
      id: 'svc-meeting-room',
      slug: 'meeting-room',
      name: l('Meeting Room', 'Meeting Room'),
      tagline: l(
        'Ruang rapat profesional per jam, siap dipesan online',
        'Professional meeting rooms by the hour, bookable online',
      ),
      description: l(
        'Ruang rapat nyaman dengan proyektor, internet stabil, dan pantry gratis di lokasi strategis Jakarta, Bekasi, dan Bandung. Cek ketersediaan dan pesan langsung dari kalender online kami.',
        'Comfortable meeting rooms with projector, stable internet, and free pantry across Jakarta, Bekasi, and Bandung. Check availability and book straight from our online calendar.',
      ),
      icon: 'meeting',
      heroImage: '/images/services/meeting-room.webp',
      features: [
        l('Ketersediaan listrik cukup', 'Ample power outlets'),
        l('Furnitur rapat yang nyaman', 'Comfortable meeting furniture'),
        l('Koneksi internet stabil', 'Stable internet connection'),
        l('Proyektor & alat tulis', 'Projector & stationery'),
        l('Free pantry', 'Free pantry'),
      ],
      tiers: [
        {
          id: 'tier-mr-hourly',
          name: 'Basic',
          price: 150_000,
          unit: 'hour',
          priceNote: l('Start From', 'Start From'),
          features: [
            l('Ketersediaan listrik cukup', 'Ample power outlets'),
            l('Dilengkapi furnitur rapat yang nyaman', 'Comfortable meeting furniture'),
            l('Koneksi internet stabil', 'Stable internet connection'),
            l('Proyektor & alat tulis', 'Projector & stationery'),
            l('Free pantry', 'Free pantry'),
          ],
          isPopular: false,
          order: 1,
        },
      ],
      order: 3,
      active: true,
    },
    {
      id: 'svc-pendirian-pt',
      slug: 'pendirian-pt',
      name: l('Pendirian PT/CV/Firma/Yayasan', 'Company Incorporation (PT/CV/Firma/Foundation)'),
      tagline: l(
        'Urus legalitas usaha dari akta sampai NIB, dibantu sampai tuntas',
        'Company legality handled end-to-end, from deed to business licence',
      ),
      description: l(
        'Paket pendirian PT, PT Perorangan, CV, Firma, dan Yayasan lengkap dengan akta notaris, SK Kemenkumham, NPWP, dan NIB. Gabungkan dengan Virtual Office untuk alamat domisili yang memenuhi syarat zonasi.',
        'Incorporation packages for PT, sole-proprietor PT, CV, Firma, and Foundations, complete with notarial deed, ministry approval, tax ID, and business licence. Combine with a Virtual Office for a zoning-compliant registered address.',
      ),
      icon: 'document',
      heroImage: '/images/services/pendirian-pt.webp',
      features: [
        l('Akta pendirian & SK Kemenkumham', 'Deed & ministry approval'),
        l('NPWP badan & NIB', 'Corporate tax ID & business licence'),
        l('Konsultasi zonasi domisili', 'Domicile zoning consultation'),
        l('Proses transparan & cepat', 'Fast, transparent process'),
        l('Bisa bundling Virtual Office', 'Bundle with Virtual Office'),
      ],
      tiers: [
        {
          id: 'tier-pt-pt',
          name: 'PT/CV/Firma',
          price: 6_000_000,
          unit: 'once',
          priceNote: l('Start From', 'Start From'),
          features: [
            l('Akta pendirian PT', 'PT incorporation deed'),
            l('SK Kemenkumham', 'Ministry approval'),
            l('NPWP badan & NIB', 'Corporate tax ID & business licence'),
            l('Konsultasi struktur saham', 'Share-structure consultation'),
          ],
          isPopular: false,
          order: 1,
        },
        {
          id: 'tier-pt-yayasan',
          name: 'Yayasan',
          // Nol = harga atas permintaan: biaya yayasan tergantung struktur
          // pengurus dan maksud pendiriannya, jadi tidak bisa dipatok di muka.
          price: 0,
          unit: 'once',
          priceNote: l('Konsultasi Dahulu', 'Consultation First'),
          features: [
            l('Akta pendirian yayasan', 'Foundation deed'),
            l('SK Kemenkumham', 'Ministry approval'),
            l('NPWP badan & NIB', 'Corporate tax ID & business licence'),
            l('Biaya menyesuaikan struktur & tujuan yayasan', 'Fee depends on the structure and purpose'),
          ],
          isPopular: false,
          order: 2,
        },
      ],
      order: 4,
      active: true,
    },
    {
      id: 'svc-legal-consultant',
      slug: 'legal-consultant',
      name: l('Legal Consultant', 'Legal Consultant'),
      tagline: l(
        'Konsultasi hukum bisnis dengan profesional bersertifikat',
        'Business-law consultation with certified professionals',
      ),
      description: l(
        'Sesi konsultasi hukum untuk perizinan, kontrak, dan kepatuhan usaha kecil-menengah. Jadwalkan sesi di lokasi Menara Office mana pun.',
        'Legal consultation sessions covering licensing, contracts, and SME compliance. Schedule a session at any Menara Office location.',
      ),
      icon: 'scale',
      heroImage: '/images/services/legal-consultant.webp',
      features: [
        l('Profesional bersertifikat', 'Certified professionals'),
        l('Konsultasi perizinan & kontrak', 'Licensing & contract advice'),
        l('Sesi privat & rahasia', 'Private, confidential sessions'),
        l('Tersedia di semua lokasi', 'Available at every location'),
      ],
      // Tanpa tier: tarif konsultasi tidak dipublikasikan, halaman layanan
      // menampilkan ajakan konsultasi lewat WhatsApp sebagai gantinya.
      tiers: [],
      order: 5,
      active: true,
    },
  ],

  locations: [
    {
      id: 'loc-menara-karya',
      slug: 'menara-karya-kuningan',
      name: 'Menara Karya Tower',
      city: 'Jakarta Selatan',
      address:
        'Menara Karya Tower (Adaro), Lt 21 Unit G, Jl. H.R. Rasuna Said Blok X-5 Kav. 1-2, RT 01 RW 02, Kel. Kuningan Timur, Kec. Setiabudi, Jakarta Selatan 12950',
      photo: '/images/locations/menara-karya.webp',
      gallery: [
        '/images/locations/menara-karya-01.webp',
        '/images/locations/menara-karya-02.webp',
        '/images/locations/menara-karya-03.webp',
        '/images/locations/menara-karya-04.webp',
        '/images/locations/menara-karya-05.webp',
        '/images/locations/menara-karya-06.webp',
      ],
      gmapsQuery: 'Menara Karya, Kuningan, Jakarta Selatan',
      facilities: [
        l('Gedung perkantoran Grade A', 'Grade-A office tower'),
        l('Kawasan bisnis Kuningan', 'Kuningan CBD location'),
        l('Akses MRT & Transjakarta', 'MRT & Transjakarta access'),
        l('Lobi & resepsionis premium', 'Premium lobby & reception'),
      ],
      servicedOfficeCapacities: [2, 3, 4],
      order: 1,
      active: true,
    },
    {
      id: 'loc-wisma-perkasa',
      slug: 'wisma-perkasa-pejaten',
      name: 'Wisma Perkasa',
      city: 'Jakarta Selatan',
      address:
        'Wisma Perkasa, Jl. Hj. Tutty Alawiyah 21B No. 6-7, Kel. Pejaten Barat, Kec. Pasar Minggu, Jakarta Selatan 12510',
      photo: '/images/locations/wisma-perkasa.webp',
      gallery: [
        '/images/locations/wisma-perkasa-01.webp',
        '/images/locations/wisma-perkasa-02.webp',
        '/images/locations/wisma-perkasa-03.webp',
        '/images/locations/wisma-perkasa-04.webp',
        '/images/locations/wisma-perkasa-05.webp',
        '/images/locations/wisma-perkasa-06.webp',
        '/images/locations/wisma-perkasa-07.webp',
        '/images/locations/wisma-perkasa-08.webp',
      ],
      gmapsQuery: 'Wisma Perkasa, Jl. Hj. Tutty Alawiyah, Pejaten Barat, Jakarta Selatan',
      facilities: [
        l('Lingkungan tenang & strategis', 'Quiet, strategic neighbourhood'),
        l('Akses Transjakarta', 'Transjakarta access'),
        l('Parkir luas', 'Ample parking'),
        l('Meeting room tersedia', 'Meeting rooms available'),
      ],
      servicedOfficeCapacities: [4],
      order: 2,
      active: true,
    },
    {
      id: 'loc-epiwalk',
      slug: 'epiwalk-kuningan',
      name: 'Epiwalk Rasuna Epicentrum',
      city: 'Jakarta Selatan',
      address:
        'Epiwalk Office Suite Lt 6 Unit B603, Jl. Epicentrum Boulevard Barat, RT.2/RW.5, Karet Kuningan, Kec. Setiabudi, Jakarta Selatan 12940',
      photo: '/images/locations/epiwalk.webp',
      gallery: [
        '/images/locations/epiwalk-01.webp',
        '/images/locations/epiwalk-02.webp',
        '/images/locations/epiwalk-03.webp',
        '/images/locations/epiwalk-04.webp',
        '/images/locations/epiwalk-05.webp',
        '/images/locations/epiwalk-06.webp',
        '/images/locations/epiwalk-07.webp',
        '/images/locations/epiwalk-08.webp',
      ],
      gmapsQuery: 'Epiwalk Epicentrum Kuningan Jakarta',
      facilities: [
        l('Kompleks lifestyle & perkantoran', 'Lifestyle & office complex'),
        l('Akses MRT & Transjakarta', 'MRT & Transjakarta access'),
        l('Keamanan 24 jam', '24-hour security'),
        l('Meeting room tersedia', 'Meeting rooms available'),
      ],
      servicedOfficeCapacities: [4],
      order: 3,
      active: true,
    },
    {
      id: 'loc-cempaka-mas',
      slug: 'cempaka-mas',
      name: 'Ruko Mega Grosir Cempaka Mas',
      city: 'Jakarta Pusat',
      address:
        'Ruko Mega Grosir Cempaka Mas, Jl. Letjend Suprapto Blok D No. 22, Sumur Batu, Kec. Kemayoran, Jakarta Pusat 10640',
      photo: '/images/locations/cempaka-mas.webp',
      gallery: [
        '/images/locations/cempaka-mas-01.webp',
        '/images/locations/cempaka-mas-02.webp',
        '/images/locations/cempaka-mas-03.webp',
        '/images/locations/cempaka-mas-04.webp',
        '/images/locations/cempaka-mas-05.webp',
        '/images/locations/cempaka-mas-06.webp',
      ],
      gmapsQuery: 'Mega Grosir Cempaka Mas Jakarta Pusat',
      facilities: [
        l('Akses Transjakarta', 'Transjakarta access'),
        l('Kawasan komersial ramai', 'Busy commercial district'),
        l('Front office siap melayani', 'Staffed front office'),
        l('Meeting room tersedia', 'Meeting rooms available'),
      ],
      servicedOfficeCapacities: [2, 3, 4],
      order: 4,
      active: true,
    },
    {
      id: 'loc-bekasi',
      slug: 'grand-wisata-bekasi',
      name: 'Ruko Celebration Boulevard',
      city: 'Bekasi',
      address: 'Ruko Celebration Boulevard, Grand Wisata, Bekasi',
      photo: '/images/locations/bekasi.webp',
      gallery: [
        '/images/locations/bekasi-01.webp',
        '/images/locations/bekasi-02.webp',
        '/images/locations/bekasi-03.webp',
        '/images/locations/bekasi-04.webp',
        '/images/locations/bekasi-05.webp',
        '/images/locations/bekasi-06.webp',
        '/images/locations/bekasi-07.webp',
      ],
      gmapsQuery: 'Celebration Boulevard Grand Wisata Bekasi',
      facilities: [
        l('Kawasan Grand Wisata', 'Grand Wisata township'),
        l('Dekat tol Jakarta Cikampek', 'Near the Jakarta Cikampek toll'),
        l('Lingkungan bisnis berkembang', 'Growing business area'),
        l('Parkir mudah', 'Easy parking'),
      ],
      servicedOfficeCapacities: [3, 4],
      order: 5,
      active: true,
    },
    {
      id: 'loc-bandung',
      slug: 'mtc-bandung',
      name: 'Metro Trade Center (MTC)',
      city: 'Bandung',
      address: 'Metro Trade Center, Jl. Soekarno-Hatta, Bandung',
      photo: '/images/locations/bandung-mtc.webp',
      gallery: [],
      gmapsQuery: 'Metro Trade Center Soekarno Hatta Bandung',
      facilities: [
        l('Pusat perdagangan Bandung Timur', 'East-Bandung trade hub'),
        l('Akses jalan utama Soekarno-Hatta', 'Main-road Soekarno-Hatta access'),
        l('Harga kompetitif', 'Competitive pricing'),
        l('Meeting room tersedia', 'Meeting rooms available'),
      ],
      servicedOfficeCapacities: [],
      order: 6,
      active: true,
    },
  ],

  rooms: [
    { id: 'room-mk-a', locationId: 'loc-menara-karya', name: 'Ruang Rapat Karya', capacity: 6, pricePerHour: 150_000, active: true },
    { id: 'room-wp-a', locationId: 'loc-wisma-perkasa', name: 'Ruang Rapat Perkasa', capacity: 8, pricePerHour: 150_000, active: true },
    { id: 'room-ep-a', locationId: 'loc-epiwalk', name: 'Ruang Rapat Epiwalk', capacity: 5, pricePerHour: 150_000, active: true },
    { id: 'room-cm-a', locationId: 'loc-cempaka-mas', name: 'Ruang Rapat Cempaka', capacity: 8, pricePerHour: 150_000, active: true },
    { id: 'room-bk-a', locationId: 'loc-bekasi', name: 'Ruang Rapat Celebration', capacity: 8, pricePerHour: 150_000, active: true },
    { id: 'room-bd-a', locationId: 'loc-bandung', name: 'Ruang Rapat MTC', capacity: 8, pricePerHour: 150_000, active: true },
  ],

  bookings: [],
  leads: [],

  posts: [
    {
      id: 'post-virtual-office-legalitas',
      slug: 'virtual-office-untuk-legalitas-pt',
      title: l(
        'Virtual Office untuk Legalitas PT: Syarat & Keuntungannya',
        'Using a Virtual Office for Company Registration: Rules & Benefits',
      ),
      excerpt: l(
        'Alamat virtual office yang sesuai zonasi bisa dipakai sebagai domisili PT. Ini syarat dan keuntungannya bagi UMKM.',
        'A zoning-compliant virtual office address can serve as your company domicile. Here are the requirements and benefits for SMEs.',
      ),
      content: l(
        'Banyak pelaku usaha menunda pendirian PT karena biaya sewa kantor. Padahal, alamat **virtual office** yang berada di zona komersial sah digunakan sebagai domisili perusahaan.\n\n## Syarat utama\n\n1. Gedung berada di zona perkantoran/komersial.\n2. Penyedia memiliki izin dan perjanjian layanan yang jelas.\n3. Tersedia bukti domisili untuk keperluan KBLI tertentu.\n\n## Keuntungan\n\n- Hemat puluhan juta rupiah per tahun dibanding sewa fisik.\n- Alamat bergengsi meningkatkan kepercayaan klien dan vendor.\n- Surat-menyurat ditangani resepsionis profesional.\n\nMenara Office menyediakan alamat di Kuningan, Pejaten, Cempaka Mas, Bekasi, dan Bandung yang seluruhnya berada di zona komersial.',
        'Many founders delay incorporating because of office rental costs. Yet a **virtual office** address in a commercial zone is legally valid as a company domicile.\n\n## Key requirements\n\n1. The building sits in an office/commercial zone.\n2. The provider is licensed with a clear service agreement.\n3. Domicile evidence is available for the relevant business classifications.\n\n## Benefits\n\n- Save tens of millions of rupiah a year versus a physical lease.\n- A prestigious address builds trust with clients and vendors.\n- Professional receptionists handle your correspondence.\n\nMenara Office provides commercial-zone addresses in Kuningan, Pejaten, Cempaka Mas, Bekasi, and Bandung.',
      ),
      cover: '/images/blog/virtual-office-untuk-legalitas-pt.webp',
      status: 'published',
      publishedAt: '2026-06-10',
      createdAt: '2026-06-10',
    },
    {
      id: 'post-tips-meeting-produktif',
      slug: 'tips-meeting-produktif',
      title: l(
        '5 Tips Meeting Produktif untuk Tim Kecil',
        '5 Tips for Productive Meetings in Small Teams',
      ),
      excerpt: l(
        'Rapat yang efektif bukan soal durasi, tapi struktur. Lima kebiasaan sederhana ini membuat meeting tim kecil jauh lebih produktif.',
        'Effective meetings are about structure, not length. These five simple habits make small-team meetings far more productive.',
      ),
      content: l(
        'Rapat yang buruk menghabiskan jam kerja paling mahal di perusahaan Anda. Lima kebiasaan ini terbukti membuat rapat lebih efektif:\n\n1. **Tentukan keputusan yang dicari**, bukan sekadar topik.\n2. **Bagikan materi sebelum rapat**, bukan saat rapat.\n3. **Batasi 30 sampai 45 menit** dengan timer terlihat.\n4. **Satu notulis, satu daftar tindak lanjut** dengan penanggung jawab.\n5. **Pisahkan ruang**, rapat penting butuh ruangan yang bebas gangguan.\n\nButuh ruang rapat profesional per jam? Meeting room Menara Office bisa dipesan online mulai Rp 150 ribu/jam.',
        "Bad meetings burn your company's most expensive hours. These five habits make meetings measurably better:\n\n1. **Define the decision you need**, not just the topic.\n2. **Share materials before the meeting**, not during it.\n3. **Cap it at 30 to 45 minutes** with a visible timer.\n4. **One note-taker, one action list** with clear owners.\n5. **Change rooms**, important meetings deserve a distraction-free space.\n\nNeed a professional meeting room by the hour? Menara Office rooms can be booked online from Rp 150k/hour.",
      ),
      cover: '/images/blog/tips-meeting-produktif.webp',
      status: 'published',
      publishedAt: '2026-05-22',
      createdAt: '2026-05-22',
    },
    {
      id: 'post-memilih-lokasi-kantor',
      slug: 'memilih-lokasi-kantor-pertama',
      title: l(
        'Memilih Lokasi Kantor Pertama: Kuningan, Bekasi, atau Bandung?',
        'Choosing Your First Office Location: Kuningan, Bekasi, or Bandung?',
      ),
      excerpt: l(
        'Lokasi kantor memengaruhi persepsi klien, biaya, dan akses talenta. Begini cara memilih lokasi pertama yang tepat untuk usaha Anda.',
        'Office location shapes client perception, cost, and talent access. Here is how to pick the right first location for your business.',
      ),
      content: l(
        'Memilih lokasi kantor pertama adalah keputusan strategis. Tiga pertimbangan utama:\n\n## 1. Persepsi klien\nAlamat CBD seperti **Kuningan** memberi kesan mapan, penting untuk B2B dan jasa profesional.\n\n## 2. Struktur biaya\nKawasan berkembang seperti **Grand Wisata Bekasi** atau **MTC Bandung** menawarkan biaya jauh lebih rendah dengan akses tol yang baik.\n\n## 3. Akses tim\nPertimbangkan titik tengah domisili tim inti Anda dan akses transportasi umum.\n\nDengan virtual office, Anda bahkan bisa memakai alamat CBD sambil bekerja dari mana saja, kombinasi paling hemat untuk usaha tahap awal.',
        'Choosing your first office location is a strategic decision. Three main considerations:\n\n## 1. Client perception\nA CBD address like **Kuningan** signals credibility, critical for B2B and professional services.\n\n## 2. Cost structure\nGrowing areas like **Grand Wisata Bekasi** or **MTC Bandung** offer far lower costs with good toll access.\n\n## 3. Team access\nConsider the midpoint of your core team and public-transport access.\n\nWith a virtual office you can even use a CBD address while working from anywhere, the leanest combination for early-stage businesses.',
      ),
      cover: '/images/blog/memilih-lokasi-kantor-pertama.webp',
      status: 'published',
      publishedAt: '2026-04-15',
      createdAt: '2026-04-15',
    },
  ],

  // Seeded empty on purpose: real client quotes should be entered from the
  // admin panel, the public section hides itself while this list is empty.
  testimonials: [],

  // Ported from the "Our Partner" marquee on menaraoffice.id.
  partners: [
    {
      id: 'partner-rah',
      name: 'RAH & Partners',
      logo: '/images/partners/rah-partners.webp',
      website: '',
      order: 1,
      active: true,
    },
    {
      id: 'partner-mnl',
      name: 'Mangatur Nainggolan Law Firm',
      logo: '/images/partners/mnl-lawfirm.webp',
      website: '',
      order: 2,
      active: true,
    },
    {
      id: 'partner-kji',
      name: 'KJI',
      logo: '/images/partners/kji.webp',
      website: '',
      order: 3,
      active: true,
    },
  ],

  /**
   * Libur nasional sisa 2026 per SKB 3 Menteri (No. 1497/2025). Semuanya
   * tanggal resmi, bukan perkiraan. September–November 2026 tidak ada libur
   * nasional. Libur 2027 ditambahkan admin setelah SKB-nya terbit — tanggal
   * berbasis kalender lunar (Islam, Saka, Waisak) tidak boleh ditebak di sini.
   */
  blockedDates: [
    holiday('2026-08-17', 'Hari Proklamasi Kemerdekaan RI', 'Indonesian Independence Day'),
    holiday('2026-08-25', 'Maulid Nabi Muhammad SAW', 'Birthday of the Prophet Muhammad'),
    holiday('2026-12-24', 'Cuti Bersama Natal', 'Christmas joint leave'),
    holiday('2026-12-25', 'Hari Raya Natal', 'Christmas Day'),
  ],

  settings: {
    // Admin 1 melayani pertanyaan umum, Admin 2 khusus booking ruang rapat.
    waNumber: '6282262981118',
    waNumberBooking: '6287752556600',
    email: 'menaraoffice.id@gmail.com',
    emailSecondary: 'marketing@menaraoffice.id',
    instagram: 'menaraoffice.id',
    headOffice:
      'Menara Karya Tower (Adaro), Lt 21 Unit G, Jl. H.R. Rasuna Said Blok X-5 Kav. 1-2, Kel. Kuningan Timur, Kec. Setiabudi, Jakarta Selatan 12950',
    bookingOpenHour: 8,
    bookingCloseHour: 20,
    // Sabtu (6) dan Minggu (0) tutup: kantor libur, ruangan tidak disewakan.
    closedWeekdays: [0, 6],
  },
}
