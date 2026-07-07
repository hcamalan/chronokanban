import type { TaskCard } from '../types'

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

/** Formats a YYYY-MM-DD date string as DD/MM for compact display (string split, no timezone conversion). */
export function formatDateShort(dateStr: string): string {
  const [, m, d] = dateStr.split('-')
  return `${d}/${m}`
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
