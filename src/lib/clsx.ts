type ClassValue = string | number | null | undefined | false | ClassValue[]

/**
 * Minimal class-name joiner — a dependency would add a package for ~10 lines
 * we fully control. No Tailwind conflict resolution is attempted.
 */
export function clsx(...values: ClassValue[]): string {
  const out: string[] = []

  for (const value of values) {
    if (!value) continue
    if (Array.isArray(value)) {
      const nested = clsx(...value)
      if (nested) out.push(nested)
    } else {
      out.push(String(value))
    }
  }

  return out.join(' ')
}
