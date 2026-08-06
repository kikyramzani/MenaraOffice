import 'server-only'

/**
 * Fixed-window rate limiter backed by process memory.
 *
 * Sufficient for a single serverless instance; a horizontally scaled
 * deployment multiplies the effective limit by the instance count, which is
 * an acceptable bound for spam protection on public forms. Swap the Map for
 * Redis/Upstash if hard guarantees are ever needed — same signature.
 */

type Bucket = { count: number; resetAt: number; limit?: number }

const buckets = new Map<string, Bucket>()

function prune(now: number): void {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key)
  }
}

export type RateLimitResult = {
  allowed: boolean
  /** Seconds until the window resets. Zero when the request was allowed. */
  retryAfter: number
}

/** Read-only check — does NOT consume an attempt. */
export function peekRateLimit(key: string): RateLimitResult {
  const now = Date.now()
  const existing = buckets.get(key)
  if (!existing || existing.resetAt <= now) return { allowed: true, retryAfter: 0 }
  if (existing.count >= (existing.limit ?? Infinity)) {
    return { allowed: false, retryAfter: Math.ceil((existing.resetAt - now) / 1000) }
  }
  return { allowed: true, retryAfter: 0 }
}

export function checkRateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number },
): RateLimitResult {
  const now = Date.now()

  if (buckets.size > 500) prune(now)

  const existing = buckets.get(key)

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs, limit })
    return { allowed: true, retryAfter: 0 }
  }
  existing.limit = limit

  if (existing.count >= limit) {
    return { allowed: false, retryAfter: Math.ceil((existing.resetAt - now) / 1000) }
  }

  existing.count += 1
  return { allowed: true, retryAfter: 0 }
}
