import type { TaskCard, DateFormat, RecurrenceUnit, TimerState } from '../types'

export function formatDuration(totalSeconds: number): string {
  const seconds = Math.max(0, Math.floor(totalSeconds))
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`
}

export function isLate(task: TaskCard, now: number = Date.now()): boolean {
  if (task.status === 'completed' || !task.dueDate) return false
  return new Date(`${task.dueDate}T23:59:59`).getTime() < now
}

export const LONG_RUNNING_THRESHOLD_SECONDS = 8 * 60 * 60

/** Flags a timer whose current, uninterrupted run has gone on unusually long (likely forgotten). */
export function isTimerLongRunning(timer: TimerState): boolean {
  if (!timer.isRunning || timer.startedAt == null) return false
  return (Date.now() - timer.startedAt) / 1000 > LONG_RUNNING_THRESHOLD_SECONDS
}

/** Formats a YYYY-MM-DD date string per the given display preference (string split, no timezone conversion). */
export function formatDate(dateStr: string, format: DateFormat): string {
  const [y, m, d] = dateStr.split('-')
  switch (format) {
    case 'DD/MM':
      return `${d}/${m}`
    case 'MM/DD':
      return `${m}/${d}`
    case 'DD/MM/YYYY':
      return `${d}/${m}/${y}`
    case 'MM/DD/YYYY':
      return `${m}/${d}/${y}`
    case 'YYYY-MM-DD':
      return `${y}-${m}-${d}`
  }
}

/** Advances a YYYY-MM-DD date string by the given recurrence interval. Uses noon UTC to avoid DST/timezone edge cases. */
export function addToDateString(dateStr: string, interval: number, unit: RecurrenceUnit): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(Date.UTC(y, m - 1, d, 12))
  if (unit === 'day') date.setUTCDate(date.getUTCDate() + interval)
  else if (unit === 'week') date.setUTCDate(date.getUTCDate() + interval * 7)
  else date.setUTCMonth(date.getUTCMonth() + interval)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`
}

/** Minute-precision H:MM for the editable "Time elapsed" field (unbounded hours). */
export function formatHHMM(totalSeconds: number): string {
  const totalMinutes = Math.round(Math.max(0, totalSeconds) / 60)
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  return `${h}:${String(m).padStart(2, '0')}`
}

/** Strict H:MM parse to seconds, or null if invalid. No minus sign accepted, so this never returns negative. */
export function parseHHMM(text: string): number | null {
  const match = text.trim().match(/^(\d+):([0-5]?\d)$/)
  if (!match) return null
  const h = Number(match[1])
  const m = Number(match[2])
  return (h * 60 + m) * 60
}
