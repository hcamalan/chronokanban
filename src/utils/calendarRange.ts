export type CalendarViewMode = 'day' | '3day' | 'week' | 'month'

export const CALENDAR_VIEW_OPTIONS: { value: CalendarViewMode; label: string }[] = [
  { value: 'day', label: '1 day' },
  { value: '3day', label: '3 days' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
]

export interface DateCell {
  dateKey: string
  /** false for month-view padding days borrowed from the adjacent month */
  inCurrentPeriod: boolean
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

export function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function todayDateKey(): string {
  return toDateKey(new Date())
}

/** Short header for a single day cell, e.g. "Mon 7". */
export function formatDayHeader(dateKey: string): string {
  const d = parseDateKey(dateKey)
  return `${DAY_SHORT[d.getDay()]} ${d.getDate()}`
}

export function getVisibleDates(viewMode: CalendarViewMode, anchorDateKey: string): DateCell[] {
  const anchor = parseDateKey(anchorDateKey)

  if (viewMode === 'day') {
    return [{ dateKey: toDateKey(anchor), inCurrentPeriod: true }]
  }

  if (viewMode === '3day') {
    return Array.from({ length: 3 }, (_, i) => {
      const d = new Date(anchor)
      d.setDate(d.getDate() + i)
      return { dateKey: toDateKey(d), inCurrentPeriod: true }
    })
  }

  if (viewMode === 'week') {
    const start = new Date(anchor)
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7)) // Monday-start, to match ISO week numbers
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start)
      d.setDate(d.getDate() + i)
      return { dateKey: toDateKey(d), inCurrentPeriod: true }
    })
  }

  // month: a fixed 6-week (42-day) grid starting on the Monday on/before the 1st, so the layout
  // height stays consistent across months regardless of how many weeks each one actually spans.
  const firstOfMonth = new Date(anchor.getFullYear(), anchor.getMonth(), 1)
  const startOfGrid = new Date(firstOfMonth)
  startOfGrid.setDate(startOfGrid.getDate() - ((firstOfMonth.getDay() + 6) % 7))
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(startOfGrid)
    d.setDate(d.getDate() + i)
    return { dateKey: toDateKey(d), inCurrentPeriod: d.getMonth() === anchor.getMonth() }
  })
}

/** ISO 8601 week number (Monday-start weeks, year determined by the week's Thursday). */
export function isoWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = (d.getUTCDay() + 6) % 7
  d.setUTCDate(d.getUTCDate() - dayNum + 3)
  const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4))
  const firstDayNum = (firstThursday.getUTCDay() + 6) % 7
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDayNum + 3)
  return 1 + Math.round((d.getTime() - firstThursday.getTime()) / (7 * 24 * 3600 * 1000))
}

export function getRangeLabel(viewMode: CalendarViewMode, anchorDateKey: string): string {
  const anchor = parseDateKey(anchorDateKey)

  if (viewMode === 'month') {
    return `${MONTH_NAMES[anchor.getMonth()]} ${anchor.getFullYear()}`
  }

  const cells = getVisibleDates(viewMode, anchorDateKey)
  const first = parseDateKey(cells[0].dateKey)
  const last = parseDateKey(cells[cells.length - 1].dateKey)
  const full = (d: Date) => `${MONTH_SHORT[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`

  if (viewMode === 'day') return full(first)

  const short = (d: Date) => `${MONTH_SHORT[d.getMonth()]} ${d.getDate()}`
  const range =
    first.getFullYear() === last.getFullYear()
      ? `${short(first)} – ${short(last)}, ${last.getFullYear()}`
      : `${full(first)} – ${full(last)}`

  // `first` is already the Monday that starts the displayed week, so its ISO week number applies
  // to the whole range without adjustment.
  return viewMode === 'week' ? `${range} (CW${isoWeekNumber(first)})` : range
}

export function shiftAnchor(viewMode: CalendarViewMode, anchorDateKey: string, direction: 1 | -1): string {
  const d = parseDateKey(anchorDateKey)
  if (viewMode === 'day') d.setDate(d.getDate() + direction)
  else if (viewMode === '3day') d.setDate(d.getDate() + direction * 3)
  else if (viewMode === 'week') d.setDate(d.getDate() + direction * 7)
  else d.setMonth(d.getMonth() + direction)
  return toDateKey(d)
}
