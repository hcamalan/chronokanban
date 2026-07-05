import { putActivityLogEntry, getAllActivityLog } from './repository'
import type { ActivityActionType, ActivityLogEntry } from '../types'

const ACTION_LABELS: Record<ActivityActionType, string> = {
  create: 'Create task',
  update: 'Update task',
  'status-change': 'Change status',
  move: 'Move task',
  'timer-start': 'Start timer',
  'timer-pause': 'Pause timer',
  'timer-reset': 'Reset timer',
  delete: 'Delete task',
}

export function logActivity(taskId: string, taskName: string, actionType: ActivityActionType) {
  const entry: ActivityLogEntry = {
    id: crypto.randomUUID(),
    taskId,
    taskName,
    actionType,
    timestamp: Date.now(),
  }
  putActivityLogEntry(entry)
}

function csvEscape(value: string): string {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export async function downloadActivityLogCsv(): Promise<void> {
  const entries = await getAllActivityLog()
  entries.sort((a, b) => a.timestamp - b.timestamp)

  const header = ['Action ID', 'Task name', 'Type of action', 'Datetime']
  const rows = entries.map((e) => [e.id, e.taskName, ACTION_LABELS[e.actionType], new Date(e.timestamp).toISOString()])
  const csv = [header, ...rows].map((row) => row.map(csvEscape).join(',')).join('\r\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `chronokanban-activity-log-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
