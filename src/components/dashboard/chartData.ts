import { isLate } from '../../utils/time'
import type { TaskCard, Category, TaskStatus } from '../../types'

export type GroupByDim = 'category' | 'status' | 'importance' | 'urgency' | 'late'
export type Unit = 'count' | 'time' | 'points'
type Level = 'low' | 'medium' | 'high'
type Lateness = 'late' | 'not-late'

/** Sentinel category id for tasks with no category. */
export const UNCATEGORIZED = '__uncat__'
/** Sentinel level for tasks with no urgency/importance set. */
export const NONE_LEVEL = '__none__'
type LevelFilter = Level | typeof NONE_LEVEL

export interface ChartConfig {
  groupBy: GroupByDim
  unit: Unit
  statuses: TaskStatus[]
  categoryIds: string[]
  importances: LevelFilter[]
  urgencies: LevelFilter[]
  lateness: Lateness[]
}

export interface ChartDatum {
  key: string
  label: string
  value: number
  color: string
}

export const GROUP_BY_OPTIONS: { value: GroupByDim; label: string }[] = [
  { value: 'category', label: 'Category' },
  { value: 'status', label: 'Status' },
  { value: 'importance', label: 'Importance' },
  { value: 'urgency', label: 'Urgency' },
  { value: 'late', label: 'Late' },
]

export const UNIT_OPTIONS: { value: Unit; label: string }[] = [
  { value: 'count', label: 'Number of tasks' },
  { value: 'time', label: 'Time spent (hours)' },
  { value: 'points', label: 'Story points' },
]

export const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: 'not-started', label: 'Not started' },
  { value: 'in-progress', label: 'In progress' },
  { value: 'completed', label: 'Completed' },
]

export const LEVEL_OPTIONS: { value: Level; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]

/** Level options plus the "None" (unset) choice, for the Importance/Urgency filter dropdowns. */
export const LEVEL_FILTER_OPTIONS: { value: LevelFilter; label: string }[] = [
  ...LEVEL_OPTIONS,
  { value: NONE_LEVEL, label: 'None' },
]

export const LATE_OPTIONS: { value: Lateness; label: string }[] = [
  { value: 'late', label: 'Yes' },
  { value: 'not-late', label: 'No' },
]

export const UNIT_TOOLTIP_LABEL: Record<Unit, string> = {
  count: 'Tasks',
  time: 'Hours',
  points: 'Story points',
}

// Semantic, CVD-distinct palette (validated — worst adjacent ΔE 21.4). Each mark is always
// paired with a visible label, so gray reads as the neutral "none" state without ambiguity.
const STATUS_COLORS: Record<TaskStatus, string> = {
  'not-started': '#9ca3af',
  'in-progress': '#3b82f6',
  completed: '#22c55e',
}
const LEVEL_COLORS: Record<Level, string> = { low: '#22c55e', medium: '#f59e0b', high: '#ef4444' }
const LATE_COLORS: Record<Lateness, string> = { late: '#ef4444', 'not-late': '#22c55e' }
const UNCATEGORIZED_COLOR = '#9ca3af'
const NONE_LEVEL_COLOR = '#9ca3af'

function taskSeconds(t: TaskCard, now: number): number {
  return t.timer.elapsedSeconds + (t.timer.isRunning && t.timer.startedAt != null ? (now - t.timer.startedAt) / 1000 : 0)
}

function measure(t: TaskCard, unit: Unit, now: number): number {
  if (unit === 'count') return 1
  if (unit === 'points') return t.storyPoints ?? 0
  return taskSeconds(t, now) / 3600
}

function passesFilters(t: TaskCard, config: ChartConfig): boolean {
  if (config.statuses.length && !config.statuses.includes(t.status)) return false
  if (config.importances.length && !config.importances.includes(t.importance ?? NONE_LEVEL)) return false
  if (config.urgencies.length && !config.urgencies.includes(t.urgency ?? NONE_LEVEL)) return false
  if (config.lateness.length && !config.lateness.includes(isLate(t) ? 'late' : 'not-late')) return false
  if (config.categoryIds.length && !config.categoryIds.includes(t.categoryId ?? UNCATEGORIZED)) return false
  return true
}

function groupKey(t: TaskCard, dim: GroupByDim): string {
  switch (dim) {
    case 'status':
      return t.status
    case 'importance':
      return t.importance ?? NONE_LEVEL
    case 'urgency':
      return t.urgency ?? NONE_LEVEL
    case 'late':
      return isLate(t) ? 'late' : 'not-late'
    case 'category':
      return t.categoryId ?? UNCATEGORIZED
  }
}

/** The ordered set of possible buckets for a grouping dimension, with labels and colors. */
function bucketsForDim(dim: GroupByDim, categories: Category[]): { key: string; label: string; color: string }[] {
  switch (dim) {
    case 'status':
      return STATUS_OPTIONS.map((o) => ({ key: o.value, label: o.label, color: STATUS_COLORS[o.value] }))
    case 'importance':
    case 'urgency':
      return [
        ...LEVEL_OPTIONS.map((o) => ({ key: o.value, label: o.label, color: LEVEL_COLORS[o.value] })),
        { key: NONE_LEVEL, label: 'None', color: NONE_LEVEL_COLOR },
      ]
    case 'late':
      return LATE_OPTIONS.map((o) => ({ key: o.value, label: o.label, color: LATE_COLORS[o.value] }))
    case 'category':
      return [
        ...categories.map((c) => ({ key: c.id, label: c.name, color: c.color })),
        { key: UNCATEGORIZED, label: 'Uncategorized', color: UNCATEGORIZED_COLOR },
      ]
  }
}

export function buildChartData(
  tasks: TaskCard[],
  categories: Category[],
  config: ChartConfig,
  now: number = Date.now(),
): ChartDatum[] {
  const totals = new Map<string, number>()
  for (const t of tasks) {
    if (!passesFilters(t, config)) continue
    const key = groupKey(t, config.groupBy)
    totals.set(key, (totals.get(key) ?? 0) + measure(t, config.unit, now))
  }

  return bucketsForDim(config.groupBy, categories)
    .map((b) => ({ ...b, value: Math.round((totals.get(b.key) ?? 0) * 100) / 100 }))
    // Recharts 3.9.2 fails to render any bars if a datum is exactly 0, so empty/zero buckets are dropped.
    .filter((d) => d.value > 0)
}
