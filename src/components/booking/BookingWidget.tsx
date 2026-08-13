'use client'

import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { bookingSchema } from '@/lib/schemas'
import { formatRupiahFull, formatHour } from '@/lib/format'
import { waLink, WA_NUMBER } from '@/lib/whatsapp'
import { clsx } from '@/lib/clsx'
import {
  findDateBlock,
  type BlockReason,
  type DateBlock,
  type DateBlockRule,
} from '@/lib/booking-calendar'
import { Icon } from '@/components/ui/Icon'

export type BookingRoom = {
  id: string
  name: string
  capacity: number
  pricePerHour: number
  locationId: string
}

export type BookingLocation = {
  id: string
  name: string
  city: string
}

type Props = {
  locations: BookingLocation[]
  rooms: BookingRoom[]
  blockedDates: DateBlockRule[]
  closedWeekdays: number[]
}

type Availability = {
  openHour: number
  closeHour: number
  /** Non-null when the whole day is closed (weekend, holiday, internal event). */
  blockedReason: BlockReason | null
  booked: { startHour: number; endHour: number }[]
}

const MONTH_NAMES_ID = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
const MONTH_NAMES_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const DAY_NAMES_ID = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']
const DAY_NAMES_EN = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function toIso(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

const inputClass =
  'w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-text)] focus:border-[var(--brand-500)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-200)]'

export function BookingWidget({ locations, rooms, blockedDates, closedWeekdays }: Props) {
  const t = useTranslations('booking')
  const locale = useLocale()

  const today = useMemo(() => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    return now
  }, [])

  const [locationId, setLocationId] = useState(locations[0]?.id ?? '')
  const roomsForLocation = useMemo(
    () => rooms.filter((room) => room.locationId === locationId),
    [rooms, locationId],
  )
  const [roomId, setRoomId] = useState('')
  const room = roomsForLocation.find((candidate) => candidate.id === roomId) ?? null

  const [viewMonth, setViewMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1))
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [availability, setAvailability] = useState<Availability | null>(null)
  const [loadingAvailability, setLoadingAvailability] = useState(false)

  const [startHour, setStartHour] = useState<number | null>(null)
  const [duration, setDuration] = useState(1)

  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [summary, setSummary] = useState<string>('')

  // Keep the selected room valid whenever the location changes.
  useEffect(() => {
    setRoomId((current) =>
      roomsForLocation.some((candidate) => candidate.id === current)
        ? current
        : (roomsForLocation[0]?.id ?? ''),
    )
  }, [roomsForLocation])

  const blockedFor = useCallback(
    (iso: string) => findDateBlock(iso, locationId, blockedDates, closedWeekdays),
    [locationId, blockedDates, closedWeekdays],
  )

  const blockTitle = useCallback(
    (block: DateBlock) => {
      if (block.label) return locale === 'en' ? block.label.en : block.label.id
      return block.reason === 'weekend' ? t('blockedWeekend') : t('blockedHoliday')
    },
    [locale, t],
  )

  // Switching location can turn the already-picked date into a blocked one (an
  // internal event at the new location), so drop the selection rather than fire
  // an availability request for a day the server will refuse anyway.
  useEffect(() => {
    setSelectedDate((current) => (current && blockedFor(current) ? null : current))
  }, [blockedFor])

  const loadAvailability = useCallback(async (signal?: AbortSignal) => {
    if (!roomId || !selectedDate) return
    setLoadingAvailability(true)
    setAvailability(null)
    try {
      const response = await fetch(
        `/api/availability?roomId=${encodeURIComponent(roomId)}&date=${selectedDate}`,
        { signal },
      )
      const data = (await response.json()) as Availability & { ok: boolean }
      if (data.ok) setAvailability(data)
      setLoadingAvailability(false)
    } catch (error) {
      // An aborted request means a newer room/date selection took over —
      // leave the loading state to that request. Real failures stop the
      // spinner; the submit path re-validates server-side anyway.
      if ((error as Error).name !== 'AbortError') setLoadingAvailability(false)
    }
  }, [roomId, selectedDate])

  useEffect(() => {
    setStartHour(null)
    setDuration(1)
    const controller = new AbortController()
    void loadAvailability(controller.signal)
    // Cancelling on room/date change (or unmount) keeps a slow stale response
    // from overwriting the freshly requested availability.
    return () => controller.abort()
  }, [loadAvailability])

  // ---- calendar grid ----
  const monthNames = locale === 'id' ? MONTH_NAMES_ID : MONTH_NAMES_EN
  const dayNames = locale === 'id' ? DAY_NAMES_ID : DAY_NAMES_EN

  const calendarDays = useMemo(() => {
    const year = viewMonth.getFullYear()
    const month = viewMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    // Monday-first offset.
    const offset = (firstDay.getDay() + 6) % 7
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    const cells: (Date | null)[] = Array.from({ length: offset }, () => null)
    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push(new Date(year, month, day))
    }
    return cells
  }, [viewMonth])

  const canGoPrev =
    viewMonth.getFullYear() > today.getFullYear() ||
    (viewMonth.getFullYear() === today.getFullYear() && viewMonth.getMonth() > today.getMonth())

  // ---- slot grid ----
  const hourIsBooked = useCallback(
    (hour: number) =>
      availability?.booked.some((range) => hour >= range.startHour && hour < range.endHour) ?? false,
    [availability],
  )

  const hours = useMemo(() => {
    if (!availability) return []
    const list: number[] = []
    for (let hour = availability.openHour; hour < availability.closeHour; hour += 1) {
      list.push(hour)
    }
    return list
  }, [availability])

  const maxDuration = useMemo(() => {
    if (startHour === null || !availability) return 1
    let max = 0
    for (let hour = startHour; hour < availability.closeHour; hour += 1) {
      if (hourIsBooked(hour)) break
      max += 1
      if (max >= 8) break
    }
    return Math.max(1, max)
  }, [startHour, availability, hourIsBooked])

  useEffect(() => {
    setDuration((current) => Math.min(current, maxDuration))
  }, [maxDuration])

  const allBooked = availability !== null && hours.length > 0 && hours.every(hourIsBooked)
  const estimate = room && startHour !== null ? room.pricePerHour * duration : null

  // ---- submit ----
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (state === 'sending' || !room || !selectedDate || startHour === null) return
    setError(null)

    const formData = new FormData(event.currentTarget)
    const payload = {
      roomId: room.id,
      date: selectedDate,
      startHour,
      endHour: startHour + duration,
      name: String(formData.get('name') ?? ''),
      phone: String(formData.get('phone') ?? ''),
      email: String(formData.get('email') ?? ''),
      notes: String(formData.get('notes') ?? ''),
      company: String(formData.get('company') ?? ''),
    }

    const parsed = bookingSchema.safeParse(payload)
    if (!parsed.success) {
      setError(t('genericError'))
      return
    }

    setState('sending')
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(parsed.data),
      })

      if (response.status === 409) {
        setError(t('conflict'))
        setState('idle')
        void loadAvailability()
        return
      }
      if (!response.ok) {
        // 400 bodies carry a machine-readable `error`; only blocked_date needs
        // its own copy. The catch matters because a platform-level 500 may not
        // be JSON at all, and an unguarded .json() would throw past setState.
        const body = (await response.json().catch(() => null)) as { error?: string } | null
        setError(body?.error === 'blocked_date' ? t('blockedError') : t('genericError'))
        setState('idle')
        return
      }

      const location = locations.find((candidate) => candidate.id === locationId)
      setSummary(
        `Halo Menara Office, saya sudah mengirim permintaan booking:\n• ${room.name}, ${location?.name ?? ''}\n• ${selectedDate}, ${formatHour(startHour)}-${formatHour(startHour + duration)}\n• Atas nama: ${parsed.data.name}`,
      )
      setState('done')
    } catch {
      setError(t('genericError'))
      setState('idle')
    }
  }

  function reset() {
    setState('idle')
    setSelectedDate(null)
    setStartHour(null)
    setDuration(1)
    setAvailability(null)
    setError(null)
  }

  if (state === 'done') {
    return (
      <div
        role="status"
        className="mx-auto max-w-xl rounded-[var(--radius-lg)] border border-[var(--color-success)]/30 bg-[#f0fdf4] p-10 text-center"
      >
        <span className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-success)] text-white">
          <Icon name="check" className="h-8 w-8" />
        </span>
        <h2 className="mt-5 text-2xl font-extrabold text-[var(--brand-900)]">{t('successTitle')}</h2>
        <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-muted)]">{t('successBody')}</p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-4">
          <a
            href={waLink(WA_NUMBER, summary)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] bg-[var(--wa-600)] px-6 py-3 text-sm font-semibold text-white hover:bg-[var(--wa-700)]"
          >
            <Icon name="whatsapp" className="h-5 w-5" />
            {t('continueWa')}
          </a>
          <button
            type="button"
            onClick={reset}
            className="text-sm font-semibold text-[var(--brand-600)] underline underline-offset-4"
          >
            {t('newBooking')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-8 lg:grid-cols-[1.15fr_1fr]">
      <div className="space-y-8">
        {/* Step 1 — location & room */}
        <fieldset className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-card)]">
          <legend className="flex items-center gap-2.5 px-1 text-sm font-bold text-[var(--brand-900)]">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--brand-700)] text-xs font-bold text-white">1</span>
            {t('stepRoom')}
          </legend>
          {/* min-w-0 lets the selects shrink below their longest option text */}
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="min-w-0">
              <label htmlFor="booking-location" className="mb-1.5 block text-sm font-semibold text-[var(--brand-900)]">
                {t('location')}
              </label>
              <select
                id="booking-location"
                value={locationId}
                onChange={(event) => setLocationId(event.target.value)}
                className={inputClass}
              >
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}, {location.city}
                  </option>
                ))}
              </select>
            </div>
            <div className="min-w-0">
              <label htmlFor="booking-room" className="mb-1.5 block text-sm font-semibold text-[var(--brand-900)]">
                {t('room')}
              </label>
              <select
                id="booking-room"
                value={roomId}
                onChange={(event) => setRoomId(event.target.value)}
                className={inputClass}
              >
                {roomsForLocation.map((candidate) => (
                  <option key={candidate.id} value={candidate.id}>
                    {candidate.name}
                  </option>
                ))}
              </select>
              {room ? (
                <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--color-text-muted)]">
                  <span className="inline-flex items-center gap-1">
                    <Icon name="users" className="h-3.5 w-3.5" />
                    {t('capacity', { count: room.capacity })}
                  </span>
                  <span className="inline-flex items-center gap-1 font-semibold text-[var(--brand-700)]">
                    <Icon name="clock" className="h-3.5 w-3.5" />
                    {t('pricePerHour', { price: formatRupiahFull(room.pricePerHour) })}
                  </span>
                </p>
              ) : null}
            </div>
          </div>
        </fieldset>

        {/* Step 2 — date (full month calendar) */}
        <fieldset className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-card)]">
          <legend className="flex items-center gap-2.5 px-1 text-sm font-bold text-[var(--brand-900)]">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--brand-700)] text-xs font-bold text-white">2</span>
            {t('stepDate')}
          </legend>

          <div className="mt-4 flex items-center justify-between">
            <button
              type="button"
              disabled={!canGoPrev}
              aria-label={t('prevMonth')}
              onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))}
              className="rounded-full p-2 text-[var(--brand-700)] hover:bg-[var(--brand-50)] disabled:opacity-30"
            >
              <Icon name="arrow-right" className="h-5 w-5 rotate-180" />
            </button>
            <p className="text-sm font-bold text-[var(--brand-900)]" aria-live="polite">
              {monthNames[viewMonth.getMonth()]} {viewMonth.getFullYear()}
            </p>
            <button
              type="button"
              aria-label={t('nextMonth')}
              onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))}
              className="rounded-full p-2 text-[var(--brand-700)] hover:bg-[var(--brand-50)]"
            >
              <Icon name="arrow-right" className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-3 grid grid-cols-7 gap-1 text-center">
            {dayNames.map((day) => (
              <span key={day} className="py-1 text-xs font-bold uppercase text-[var(--color-text-muted)]">
                {day}
              </span>
            ))}
            {calendarDays.map((date, index) => {
              if (!date) return <span key={`empty-${index}`} />
              const iso = toIso(date)
              const isPast = date < today
              const block = isPast ? null : blockedFor(iso)
              const isSelected = iso === selectedDate
              return (
                <button
                  key={iso}
                  type="button"
                  disabled={isPast || block !== null}
                  // `title`, never `aria-label`: the accessible name has to stay
                  // the bare day number, otherwise every day-cell selector breaks.
                  title={block ? blockTitle(block) : undefined}
                  aria-pressed={isSelected}
                  onClick={() => setSelectedDate(iso)}
                  className={clsx(
                    'aspect-square rounded-[var(--radius-sm)] text-sm font-semibold transition-colors',
                    isPast && 'cursor-not-allowed text-[var(--color-text-muted)]/40',
                    !isPast &&
                      block !== null &&
                      'cursor-not-allowed bg-[var(--color-surface-alt)] text-[var(--color-text-muted)]/60 line-through',
                    !isPast && !block && !isSelected && 'text-[var(--brand-900)] hover:bg-[var(--brand-100)]',
                    isSelected && 'bg-[var(--brand-700)] text-white shadow-[var(--shadow-card)]',
                  )}
                >
                  {date.getDate()}
                </button>
              )
            })}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[var(--color-text-muted)]">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-3 w-3 rounded bg-[var(--color-surface-alt)]" />
              {t('blockedLegend')}
            </span>
          </div>
        </fieldset>

        {/* Step 3 — time slots */}
        <fieldset className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-card)]">
          <legend className="flex items-center gap-2.5 px-1 text-sm font-bold text-[var(--brand-900)]">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--brand-700)] text-xs font-bold text-white">3</span>
            {t('stepTime')}
          </legend>

          {!selectedDate ? (
            <p className="mt-4 text-sm text-[var(--color-text-muted)]">{t('stepDate')} →</p>
          ) : loadingAvailability ? (
            <p className="mt-4 animate-pulse text-sm text-[var(--color-text-muted)]">…</p>
          ) : availability?.blockedReason ? (
            // Must precede allBooked: a closed day returns booked: [], so
            // allBooked is false and the slot grid would otherwise render as
            // though every hour were free.
            <p className="mt-4 text-sm font-medium text-[var(--color-warning)]">{t('blockedError')}</p>
          ) : allBooked ? (
            <p className="mt-4 text-sm font-medium text-[var(--color-warning)]">{t('noSlots')}</p>
          ) : (
            <>
              <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                {hours.map((hour) => {
                  const booked = hourIsBooked(hour)
                  const selected =
                    startHour !== null && hour >= startHour && hour < startHour + duration
                  return (
                    <button
                      key={hour}
                      type="button"
                      disabled={booked}
                      aria-pressed={startHour === hour}
                      onClick={() => setStartHour(hour)}
                      className={clsx(
                        'rounded-[var(--radius-sm)] border px-2 py-2.5 text-sm font-semibold transition-colors',
                        booked &&
                          'cursor-not-allowed border-transparent bg-[var(--color-surface-alt)] text-[var(--color-text-muted)]/50 line-through',
                        !booked && !selected &&
                          'border-[var(--color-border)] text-[var(--brand-900)] hover:border-[var(--brand-500)]',
                        selected && 'border-[var(--brand-700)] bg-[var(--brand-700)] text-white',
                      )}
                    >
                      {formatHour(hour)}
                    </button>
                  )
                })}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[var(--color-text-muted)]">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded border border-[var(--color-border)] bg-white" />
                  {t('available')}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded bg-[var(--color-surface-alt)]" />
                  {t('booked')}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded bg-[var(--brand-700)]" />
                  {t('selected')}
                </span>
              </div>

              {startHour !== null ? (
                <div className="mt-4">
                  <label htmlFor="booking-duration" className="mb-1.5 block text-sm font-semibold text-[var(--brand-900)]">
                    {t('duration')}
                  </label>
                  <select
                    id="booking-duration"
                    value={duration}
                    onChange={(event) => setDuration(Number(event.target.value))}
                    className={clsx(inputClass, 'max-w-[12rem]')}
                  >
                    {Array.from({ length: maxDuration }, (_, index) => index + 1).map((value) => (
                      <option key={value} value={value}>
                        {t('hours', { count: value })} ({formatHour(startHour)}-{formatHour(startHour + value)})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <p className="mt-4 text-xs text-[var(--color-text-muted)]">{t('selectTimeFirst')}</p>
              )}
            </>
          )}
        </fieldset>
      </div>

      {/* Step 4 — details & submit */}
      <fieldset className="h-fit rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-lift)] lg:sticky lg:top-24">
        <legend className="flex items-center gap-2.5 px-1 text-sm font-bold text-[var(--brand-900)]">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--brand-700)] text-xs font-bold text-white">4</span>
          {t('stepDetails')}
        </legend>

        <div className="absolute -left-[9999px]" aria-hidden="true">
          <label htmlFor="booking-company">Company</label>
          <input id="booking-company" type="text" name="company" tabIndex={-1} autoComplete="off" />
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <label htmlFor="booking-name" className="mb-1.5 block text-sm font-semibold text-[var(--brand-900)]">
              {t('name')}
            </label>
            <input id="booking-name" name="name" type="text" required className={inputClass} />
          </div>
          <div>
            <label htmlFor="booking-phone" className="mb-1.5 block text-sm font-semibold text-[var(--brand-900)]">
              {t('phone')}
            </label>
            <input id="booking-phone" name="phone" type="tel" required placeholder="08xxxxxxxxxx" className={inputClass} />
          </div>
          <div>
            <label htmlFor="booking-email" className="mb-1.5 block text-sm font-semibold text-[var(--brand-900)]">
              {t('email')}
            </label>
            <input id="booking-email" name="email" type="email" required className={inputClass} />
          </div>
          <div>
            <label htmlFor="booking-notes" className="mb-1.5 block text-sm font-semibold text-[var(--brand-900)]">
              {t('notes')}
            </label>
            <textarea id="booking-notes" name="notes" rows={3} placeholder={t('notesPlaceholder')} className={inputClass} />
          </div>
        </div>

        {estimate !== null && selectedDate && startHour !== null ? (
          <dl className="mt-5 space-y-1.5 rounded-[var(--radius-md)] bg-[var(--brand-50)] p-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-[var(--color-text-muted)]">{t('date')}</dt>
              <dd className="font-semibold text-[var(--brand-900)]">{selectedDate}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[var(--color-text-muted)]">{t('stepTime')}</dt>
              <dd className="font-semibold text-[var(--brand-900)]">
                {formatHour(startHour)}-{formatHour(startHour + duration)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-[var(--brand-200)] pt-2">
              <dt className="font-bold text-[var(--brand-900)]">{t('estimate')}</dt>
              <dd className="font-extrabold text-[var(--brand-700)]">{formatRupiahFull(estimate)}</dd>
            </div>
          </dl>
        ) : null}

        {error ? (
          <p role="alert" className="mt-4 rounded-[var(--radius-md)] bg-[#fef2f2] px-4 py-3 text-sm font-medium text-[var(--color-danger)]">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={state === 'sending' || !room || !selectedDate || startHour === null}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-[var(--radius-pill)] bg-[var(--brand-700)] px-6 py-3.5 text-base font-semibold text-white transition-colors hover:bg-[var(--brand-800)] disabled:opacity-50"
        >
          <Icon name="calendar" className="h-5 w-5" />
          {state === 'sending' ? t('submitting') : t('submit')}
        </button>
      </fieldset>
    </form>
  )
}
