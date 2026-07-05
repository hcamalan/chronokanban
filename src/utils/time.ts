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
