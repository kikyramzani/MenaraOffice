import type { ReactNode } from 'react'

import type { OfficeLocation, Room } from '@/lib/data/types'

import { PageHeading, PrintPage } from './PrintPage'
import { printPhoto } from './photos'
import { SECTION, site } from './copy'

type LocationsOverviewPageProps = {
  number: number
  locations: OfficeLocation[]
  roomsByLocation: Map<string, Room[]>
  /** Sheet each branch's own page sits on, keyed by location id. */
  pageByLocation: Record<string, number>
}

export function LocationsOverviewPage({
  number,
  locations,
  roomsByLocation,
  pageByLocation,
}: LocationsOverviewPageProps) {
  return (
    <PrintPage number={number}>
      <PageHeading
        eyebrow={SECTION.locations}
        title={site.locations.title}
        lead={site.locations.subtitle}
      />

      <table className="mt-[8mm] w-full border-collapse text-left">
        <thead>
          <tr className="bg-brand-900 text-white">
            <Th className="w-[7mm] text-center">#</Th>
            <Th>Lokasi</Th>
            <Th>Alamat</Th>
            <Th className="w-[26mm]">Serviced Office</Th>
            <Th className="w-[30mm]">Ruang Rapat</Th>
          </tr>
        </thead>
        <tbody>
          {locations.map((location, index) => {
            const rooms = roomsByLocation.get(location.id) ?? []
            const capacities = location.servicedOfficeCapacities

            return (
              <tr key={location.id} className="border-b border-line align-top">
                <Td className="text-center font-bold text-brand-600">
                  {String(pageByLocation[location.id] ?? index + 1).padStart(2, '0')}
                </Td>
                <Td>
                  <span className="font-bold text-brand-900">{location.name}</span>
                  <span className="mt-[1mm] block text-[8.5pt] text-ink-muted">{location.city}</span>
                </Td>
                <Td className="text-[8.5pt] leading-[1.5] text-ink-muted">{location.address}</Td>
                <Td>
                  {capacities.length ? (
                    capacities.map((pax) => `${pax} pax`).join(' · ')
                  ) : (
                    <span className="text-ink-muted">—</span>
                  )}
                </Td>
                <Td>
                  {rooms.length ? (
                    rooms.map((room) => (
                      <span key={room.id} className="block">
                        {room.name}
                        <span className="text-ink-muted"> · {room.capacity} orang</span>
                      </span>
                    ))
                  ) : (
                    <span className="text-ink-muted">—</span>
                  )}
                </Td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <p className="mt-[6mm] text-[8.5pt] leading-[1.6] text-ink-muted">
        Kolom “#” menunjukkan halaman profil masing-masing cabang di dokumen ini. Seluruh ruang
        rapat dapat dipesan online melalui {site.nav.bookRoom.toLowerCase()} di menaraoffice.id.
      </p>

      <div className="mt-auto grid grid-cols-2 gap-[4mm] pt-[8mm]">
        {['menara-karya', 'bekasi'].map((photo) => (
          <div key={photo} className="h-[42mm] overflow-hidden rounded-[3mm]">
            <img
              src={printPhoto(`/images/locations/${photo}.webp`)}
              alt=""
              width={1600}
              height={1200}
              className="print-img"
            />
          </div>
        ))}
      </div>
    </PrintPage>
  )
}

function Th({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <th
      className={`px-[3mm] py-[3mm] text-[8pt] font-bold tracking-[0.1em] uppercase ${className ?? ''}`}
    >
      {children}
    </th>
  )
}

function Td({ children, className }: { children: ReactNode; className?: string }) {
  return <td className={`px-[3mm] py-[3.5mm] text-[9pt] ${className ?? ''}`}>{children}</td>
}
