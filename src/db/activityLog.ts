import { putActivityLogEntry, getAllActivityLog } from './repository'
import type { ActivityActionType, ActivityLogEntry, TaskStatus } from '../types'

const STATUS_LABELS: Record<TaskStatus, string> = {
  'not-started': 'Not started',
  'in-progress': 'In progress',
  completed: 'Completed',
}

export function logActivity(
  taskId: string,
  taskName: string,
  actionType: ActivityActionType,
  status: TaskStatus,
  segmentStart?: number,
  adjustmentSeconds?: number,
) {
  const entry: ActivityLogEntry = {
    id: crypto.randomUUID(),
    taskId,
    taskName,
    actionType,
    timestamp: Date.now(),
    status,
    segmentStart,
    adjustmentSeconds,
  }
  putActivityLogEntry(entry)
}

function csvEscape(value: string): string {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

/** Local YYYY-MM-DD for a given epoch ms. */
function localDateKey(ms: number): string {
  const d = new Date(ms)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** End of the local calendar day (23:59:59.999) that contains `ms`, as epoch ms. */
function endOfLocalDay(ms: number): number {
  const d = new Date(ms)
  d.setHours(23, 59, 59, 999)
  return d.getTime()
}

/** Start of the local calendar day after the one containing `ms`, as epoch ms. */
function startOfNextLocalDay(ms: number): number {
  const d = new Date(ms)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + 1)
  return d.getTime()
}

/** A finished (or in-progress, ending "now") work interval to attribute across days. */
export interface WorkInterval {
  taskId: string
  taskName: string
  start: number
  end: number
}

/**
 * Splits a work interval at local midnight and adds each day's seconds to `seconds[dateKey][taskId]`.
 * A session that runs past midnight is credited to both days.
 */
function accumulateInterval(
  interval: WorkInterval,
  seconds: Map<string, Map<string, number>>,
  taskNames: Map<string, string>,
) {
  if (interval.end <= interval.start) return
  taskNames.set(interval.taskId, interval.taskName)

  let cursor = interval.start
  while (cursor < interval.end) {
    const dayEnd = endOfLocalDay(cursor)
    const chunkEnd = Math.min(interval.end, dayEnd)
    const dateKey = localDateKey(cursor)
    const perTask = seconds.get(dateKey) ?? new Map<string, number>()
    perTask.set(interval.taskId, (perTask.get(interval.taskId) ?? 0) + (chunkEnd - cursor) / 1000)
    seconds.set(dateKey, perTask)
    cursor = startOfNextLocalDay(cursor)
  }
}

/** Status of a task as of the end of the local day `dateKey`, from the latest entry on or before then. */
function statusAtEndOfDay(taskEntries: ActivityLogEntry[], dateKey: string): string {
  const cutoff = endOfLocalDay(new Date(`${dateKey}T12:00:00`).getTime())
  let latest: ActivityLogEntry | null = null
  for (const e of taskEntries) {
    if (e.timestamp <= cutoff && e.status != null && (!latest || e.timestamp > latest.timestamp)) {
      latest = e
    }
  }
  return latest?.status ? STATUS_LABELS[latest.status] : ''
}

/**
 * Builds a daily timesheet: one row per (local date, task) that had tracked time that day.
 * `runningIntervals` are virtual segments for timers still running at export time (so today's
 * in-progress work counts).
 */
export async function buildTimesheetCsv(runningIntervals: WorkInterval[]): Promise<string> {
  const entries = await getAllActivityLog()

  const seconds = new Map<string, Map<string, number>>()
  const taskNames = new Map<string, string>()

  for (const e of entries) {
    if (e.segmentStart != null) {
      accumulateInterval(
        { taskId: e.taskId, taskName: e.taskName, start: e.segmentStart, end: e.timestamp },
        seconds,
        taskNames,
      )
    } else if (e.actionType === 'manual-adjustment' && e.adjustmentSeconds != null) {
      // Additive to whatever real segments already landed on this day — never rewrites them.
      // Credited to the entry's own date (i.e. the day the edit was made), per the locked-in design.
      taskNames.set(e.taskId, e.taskName)
      const dateKey = localDateKey(e.timestamp)
      const perTask = seconds.get(dateKey) ?? new Map<string, number>()
      perTask.set(e.taskId, (perTask.get(e.taskId) ?? 0) + e.adjustmentSeconds)
      seconds.set(dateKey, perTask)
    }
  }
  for (const interval of runningIntervals) {
    accumulateInterval(interval, seconds, taskNames)
  }

  const entriesByTask = new Map<string, ActivityLogEntry[]>()
  for (const e of entries) {
    const list = entriesByTask.get(e.taskId) ?? []
    list.push(e)
    entriesByTask.set(e.taskId, list)
  }

  const rows: string[][] = []
  for (const [dateKey, perTask] of seconds) {
    for (const [taskId, secs] of perTask) {
      if (secs <= 0) continue
      const hours = Math.round((secs / 3600) * 100) / 100
      const status = statusAtEndOfDay(entriesByTask.get(taskId) ?? [], dateKey)
      rows.push([dateKey, taskNames.get(taskId) ?? '', String(hours), status])
    }
  }

  rows.sort((a, b) => a[0].localeCompare(b[0]) || a[1].localeCompare(b[1]))

  const header = ['Date', 'Task name', 'Hours spent', 'Status']
  return [header, ...rows].map((row) => row.map(csvEscape).join(',')).join('\r\n')
}

export async function downloadTimesheetCsv(runningIntervals: WorkInterval[]): Promise<void> {
  const csv = await buildTimesheetCsv(runningIntervals)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `chronokanban-timesheet-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
