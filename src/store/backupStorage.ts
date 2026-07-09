const LAST_EXPORT_KEY = 'chrono-kanban-last-export'
const SNOOZE_KEY = 'chrono-kanban-backup-snooze'
const REMINDER_DISMISSED_KEY = 'chrono-kanban-backup-reminder-dismissed'

export const SNOOZE_DAYS = 3

/** One-time onboarding reminder to back up, shown until the user exports once or dismisses it. */
export function isBackupReminderDismissed(): boolean {
  return localStorage.getItem(REMINDER_DISMISSED_KEY) === 'true'
}

export function dismissBackupReminder(): void {
  localStorage.setItem(REMINDER_DISMISSED_KEY, 'true')
}

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
