import type { OfficeLocation, Room } from '@/lib/data/types'

import { formatRupiahFull } from '@/lib/format'

import { PageHeading, PrintPage } from './PrintPage'
import { printPhoto } from './photos'
import { SECTION, site } from './copy'

type LocationDetailPageProps = {
  number: number
  location: OfficeLocation
  rooms: Room[]
}

export function LocationDetailPage({ number, location, rooms }: LocationDetailPageProps) {
  const capacities = location.servicedOfficeCapacities

  return (
    <PrintPage number={number}>
      <LocationPhotos location={location} />

      <div className="mt-[7mm]">
        <PageHeading eyebrow={`${SECTION.locations} · ${location.city}`} title={location.name} />
      </div>

      <p className="mt-[5mm] text-[10.5pt] leading-[1.6] text-ink">{location.address}</p>

      <div className="mt-[7mm] grid grid-cols-2 gap-[6mm]">
        <div>
          <h3 className="text-[9pt] font-bold tracking-[0.14em] text-brand-500 uppercase">
            {site.locations.facilities}
          </h3>
          <ul className="mt-[3mm] space-y-[2.5mm]">
            {location.facilities.map((facility) => (
              <li key={facility.id} className="flex gap-[3mm] text-[10pt] leading-[1.5] text-ink">
                <span className="mt-[1.6mm] h-[1.8mm] w-[1.8mm] shrink-0 rounded-full bg-accent" />
                {facility.id}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-[4mm]">
          <div className="surface-soft p-[5mm]">
            <h3 className="text-[9pt] font-bold tracking-[0.14em] text-brand-500 uppercase">
              Serviced Office
            </h3>
            {capacities.length ? (
              <p className="mt-[2mm] text-[11pt] font-bold text-brand-900">
                {capacities.map((pax) => `${pax} pax`).join(' · ')}
              </p>
            ) : (
              <p className="mt-[2mm] text-[9.5pt] leading-[1.55] text-ink-muted">
                Belum tersedia di cabang ini. Virtual Office dan meeting room tetap dapat digunakan.
              </p>
            )}
          </div>

          <div className="surface-soft p-[5mm]">
            <h3 className="text-[9pt] font-bold tracking-[0.14em] text-brand-500 uppercase">
              Ruang Rapat
            </h3>
            {rooms.length ? (
              <ul className="mt-[2mm] space-y-[2mm]">
                {rooms.map((room) => (
                  <li key={room.id} className="text-[9.5pt] leading-[1.45]">
                    <span className="font-bold text-brand-900">{room.name}</span>
                    <span className="block text-ink-muted">
                      Kapasitas {room.capacity} orang · {formatRupiahFull(room.pricePerHour)}/jam
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-[2mm] text-[9.5pt] text-ink-muted">—</p>
            )}
          </div>
        </div>
      </div>

      <p className="mt-auto border-t border-line pt-[6mm] text-[9.5pt] leading-[1.6] text-ink-muted">
        Ingin melihat langsung? {site.cta.subtitle}
      </p>
    </PrintPage>
  )
}

/**
 * Asymmetric photo block. MTC Bandung has no gallery in the archive, so a
 * single branch photo fills the band instead of leaving empty frames.
 */
function LocationPhotos({ location }: { location: OfficeLocation }) {
  const [firstExtra, secondExtra] = location.gallery

  if (!firstExtra || !secondExtra) {
    return (
      <div className="h-[100mm] overflow-hidden rounded-[3mm]">
        <img
          src={printPhoto(location.photo)}
          alt=""
          width={1600}
          height={1200}
          className="print-img"
        />
      </div>
    )
  }

  /*
   * `grid-rows-1` is load-bearing: without an explicit row track the row is
   * sized `auto`, the wrappers inherit no definite height, and `print-img`'s
   * `height: 100%` collapses to the photo's natural height — which overflowed
   * the band and printed the branch text on top of the images.
   */
  return (
    <div className="grid h-[100mm] grid-cols-[1fr_54mm] grid-rows-1 gap-[3mm]">
      <div className="overflow-hidden rounded-[3mm]">
        <img
          src={printPhoto(location.photo)}
          alt=""
          width={1600}
          height={1200}
          className="print-img"
        />
      </div>
      <div className="grid grid-rows-2 gap-[3mm]">
        {[firstExtra, secondExtra].map((photo) => (
          <div key={photo} className="overflow-hidden rounded-[3mm]">
            <img src={printPhoto(photo)} alt="" width={1200} height={900} className="print-img" />
          </div>
        ))}
      </div>
    </div>
  )
}
