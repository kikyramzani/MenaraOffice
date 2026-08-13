/**
 * WhatsApp deep-link builder. The number comes from NEXT_PUBLIC_WA_NUMBER so
 * both server and client components can compose links; the admin-editable
 * settings value is used where server data is already at hand.
 */
export function waLink(number: string, message: string): string {
  const digits = number.replace(/\D/g, '')
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}

export const WA_NUMBER = process.env.NEXT_PUBLIC_WA_NUMBER ?? '6287752556600'
