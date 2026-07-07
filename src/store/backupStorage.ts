const LAST_EXPORT_KEY = 'chrono-kanban-last-export'
const SNOOZE_KEY = 'chrono-kanban-backup-snooze'

export const SNOOZE_DAYS = 3

export function getLastExportAt(): number | null {
  const raw = localStorage.getItem(LAST_EXPORT_KEY)
  const parsed = raw ? Number(raw) : NaN
  return Number.isFinite(parsed) ? parsed : null
}

export function markExported(): void {
  localStorage.setItem(LAST_EXPORT_KEY, String(Date.now()))
}

export function getSnoozeUntil(): number | null {
  const raw = localStorage.getItem(SNOOZE_KEY)
  const parsed = raw ? Number(raw) : NaN
  return Number.isFinite(parsed) ? parsed : null
}

export function snoozeBackupNudge(days: number): void {
  localStorage.setItem(SNOOZE_KEY, String(Date.now() + days * 24 * 60 * 60 * 1000))
}

/** First-ever visit (no export, no snooze recorded yet) gets a grace period before any nudge can show. */
export function ensureInitialGracePeriod(): void {
  if (getLastExportAt() == null && getSnoozeUntil() == null) {
    snoozeBackupNudge(SNOOZE_DAYS)
  }
}
