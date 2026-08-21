/** Small derivations shared by the profile pages. */

const DAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'] as const

/**
 * Cities served, counted the way the brand states it: "3 kota" — Jakarta,
 * Bekasi, Bandung. Branch records carry the administrative city ("Jakarta
 * Selatan", "Jakarta Pusat"), so counting them raw would claim four.
 */
export function countCities(cities: string[]): number {
  const merged = cities.map((city) => (city.startsWith('Jakarta') ? 'Jakarta' : city))
  return new Set(merged).size
}

/**
 * Human label for the weekdays that take no bookings, e.g. `[0, 6]` →
 * "Sabtu & Minggu tutup". Derived from settings rather than hardcoded so the
 * document follows the admin panel if the closing days ever change.
 */
export function closedDaysLabel(closedWeekdays: number[]): string {
  // Sunday is 0 in the data but reads last in Indonesian: "Sabtu & Minggu".
  const weekOrder = (day: number) => (day === 0 ? 7 : day)

  const names = [...closedWeekdays]
    .sort((a, b) => weekOrder(a) - weekOrder(b))
    .map((day) => DAY_NAMES[day])
    .filter((name): name is (typeof DAY_NAMES)[number] => Boolean(name))

  if (!names.length) return 'Buka setiap hari'

  return `${names.join(' & ')} tutup`
}
