import type { FocusSession } from '../types'

const STORAGE_KEY = 'chrono-kanban-focus-session'

export const FOCUS_DURATION_MS = 25 * 60 * 1000
export const BREAK_DURATION_MS = 5 * 60 * 1000

export function loadFocusSession(): FocusSession | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    if (typeof parsed?.taskId === 'string' && typeof parsed?.endsAt === 'number' && (parsed.phase === 'focus' || parsed.phase === 'break')) {
      return parsed as FocusSession
    }
  } catch {
    // fall through
  }
  return null
}

export function saveFocusSession(session: FocusSession | null): void {
  if (session) localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  else localStorage.removeItem(STORAGE_KEY)
}
