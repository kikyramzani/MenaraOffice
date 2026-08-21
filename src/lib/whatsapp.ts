/**
 * WhatsApp deep-link builder. The number itself always comes from the
 * admin-editable settings, passed down as a prop so there is a single source of
 * truth; `WA_NUMBER` below is only a build-time fallback for the rare caller
 * that has no server data at hand.
 */
export function waLink(number: string, message: string): string {
  const digits = number.replace(/\D/g, '')
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}

/** Last-resort fallback only — prefer `settings.waNumber` from the store. */
export const WA_NUMBER = process.env.NEXT_PUBLIC_WA_NUMBER ?? '6282262981118'
