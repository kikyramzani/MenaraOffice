import { getStore } from '@/lib/data'
import { saveRoomAction } from '@/app/admin/actions'
import { adminInputClass, Card, PageTitle, StatusBadge } from '@/components/admin/ui'

export default async function AdminRoomsPage() {
  const store = getStore()
  const [rooms, locations] = await Promise.all([store.getRooms(), store.getLocations()])
  const locationName = (locationId: string) =>
    locations.find((location) => location.id === locationId)?.name ?? locationId

  return (
    <>
      <PageTitle
        title="Ruang Rapat"
        subtitle="Kapasitas, tarif per jam, dan status setiap ruangan yang bisa dibooking"
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {rooms.map((room) => (
          <Card key={room.id}>
            <form action={saveRoomAction}>
              <input type="hidden" name="id" value={room.id} />
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--brand-600)]">
                  {locationName(room.locationId)}
                </p>
                <StatusBadge status={room.active ? 'active' : 'inactive'} />
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-[var(--brand-900)]">Nama ruangan</span>
                  <input name="name" defaultValue={room.name} className={adminInputClass} />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-[var(--brand-900)]">Kapasitas (orang)</span>
                  <input name="capacity" type="number" min={1} defaultValue={room.capacity} className={adminInputClass} />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-[var(--brand-900)]">Tarif per jam (Rp)</span>
                  <input name="pricePerHour" type="number" min={0} step={5000} defaultValue={room.pricePerHour} className={adminInputClass} />
                </label>
                <label className="flex items-end gap-2 pb-2 text-sm font-semibold text-[var(--brand-900)]">
                  <input type="checkbox" name="active" defaultChecked={room.active} className="h-4 w-4" />
                  Bisa dibooking
                </label>
              </div>
              <button
                type="submit"
                className="mt-4 rounded-[var(--radius-pill)] bg-[var(--brand-700)] px-5 py-2 text-xs font-semibold text-white transition-colors hover:bg-[var(--brand-800)]"
              >
                Simpan
              </button>
            </form>
          </Card>
        ))}
      </div>
    </>
  )
}
