import 'server-only'

import { LocalStore } from './local-store'
import { SupabaseStore } from './supabase-store'
import { hasSupabaseEnv, type DataStore } from './store'

let store: DataStore | null = null

/**
 * Store selector: Supabase when the env vars exist, otherwise the local
 * seed-backed store (demo mode). Everything here is server-only, so the
 * Supabase client never reaches a client bundle either way.
 */
export function getStore(): DataStore {
  if (!store) {
    store = hasSupabaseEnv() ? new SupabaseStore() : new LocalStore()
  }
  return store
}

export { BookingConflictError } from './store'
export type { NewBooking, NewLead } from './store'
