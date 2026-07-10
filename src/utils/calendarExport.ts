import type { TaskCard } from '../types'

/** Strips common markdown syntax down to plain text for calendar description fields. */
function toPlainText(markdown: string): string {
  return markdown
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1 ($2)')
    .replace(/^[-*]\s+/gm, '')
    .replace(/^#{1,6}\s+/gm, '')
    .trim()
}

/** "YYYY-MM-DD" -> "YYYYMMDD". */
function compactDate(dateStr: string): string {
  return dateStr.replace(/-/g, '')
}

/** The day after a "YYYY-MM-DD" date string, as "YYYYMMDD" (exclusive end for all-day events). */
function nextDayCompact(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(Date.UTC(y, m - 1, d))
  date.setUTCDate(date.getUTCDate() + 1)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}`
}

/** A Google Calendar "create event" URL, prefilled as an all-day event on the task's due date. No auth, no API. */
export function buildGoogleCalendarUrl(task: TaskCard): string | null {
  if (!task.dueDate) return null
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: task.name || 'Untitled task',
    dates: `${compactDate(task.dueDate)}/${nextDayCompact(task.dueDate)}`,
  })
  if (task.description.trim()) params.set('details', toPlainText(task.description))
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

function icsEscape(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/,/g, '\\,').replace(/;/g, '\\;').replace(/\n/g, '\\n')
}

/** A minimal VCALENDAR/VEVENT all-day event, importable into Apple Calendar, Outlook, or any ICS-reading app. */
export function buildIcsFile(task: TaskCard): string | null {
  if (!task.dueDate) return null
  const dtstamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ChronoKanban//EN',
    'BEGIN:VEVENT',
    `UID:${task.id}@chronokanban`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART;VALUE=DATE:${compactDate(task.dueDate)}`,
    `DTEND;VALUE=DATE:${nextDayCompact(task.dueDate)}`,
    `SUMMARY:${icsEscape(task.name || 'Untitled task')}`,
  ]
  if (task.description.trim()) lines.push(`DESCRIPTION:${icsEscape(toPlainText(task.description))}`)
  lines.push('END:VEVENT', 'END:VCALENDAR')
  return lines.join('\r\n')
}

export function downloadIcsFile(task: TaskCard): void {
  const ics = buildIcsFile(task)
  if (!ics) return
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${(task.name || 'task').replace(/[^\w\- ]/g, '').trim() || 'task'}.ics`
  a.click()
  URL.revokeObjectURL(url)
}
