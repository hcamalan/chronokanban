import { useEffect, useMemo, useRef, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useStore } from '../../store/useStore'
import { MultiSelectDropdown } from './MultiSelectDropdown'
import { SortByDropdown, type SortDirection } from './SortByDropdown'
import { DownloadImageButton } from './DownloadImageButton'
import { CalendarDayCell, type WorkedOnBar, type DueBar } from './CalendarDayCell'
import { buildDailyWorkSummary, type WorkInterval, type DailyWorkSummary } from '../../db/activityLog'
import { isLate } from '../../utils/time'
import { getSemanticColors, remapCategoryColor } from '../../utils/colorPalette'
import {
  CALENDAR_VIEW_OPTIONS,
  getVisibleDates,
  getRangeLabel,
  shiftAnchor,
  todayDateKey,
  type CalendarViewMode,
} from '../../utils/calendarRange'
import type { TaskCard } from '../../types'

interface CalendarViewProps {
  tasks: TaskCard[]
  onOpenTask: (taskId: string) => void
}

type SortField = 'alpha' | 'time' | 'points'

const FILTER_OPTIONS = [
  { value: 'worked-on', label: 'Worked on' },
  { value: 'due', label: 'Due' },
  { value: 'late', label: 'Late' },
]

const SORT_OPTIONS: { value: SortField; label: string }[] = [
  { value: 'alpha', label: 'Alphabetical' },
  { value: 'time', label: 'Time elapsed' },
  { value: 'points', label: 'Story points' },
]

const selectClass =
  'rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100'

export function CalendarView({ tasks, onOpenTask }: CalendarViewProps) {
  const allTasks = useStore((s) => s.tasks)
  const categories = useStore(useShallow((s) => s.categories))
  const colorMode = useStore((s) => s.preferences.colorMode)

  const [viewMode, setViewMode] = useState<CalendarViewMode>('week')
  const [anchorDateKey, setAnchorDateKey] = useState(todayDateKey())
  const [filters, setFilters] = useState<string[]>(['worked-on', 'due', 'late'])
  const [sortField, setSortField] = useState<SortField>('alpha')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [summary, setSummary] = useState<DailyWorkSummary | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  // Debounced so rapid task edits (which update the store on every keystroke) don't trigger a
  // full activity-log re-read on every render — reuses buildDailyWorkSummary rather than
  // duplicating the report's day-splitting logic.
  useEffect(() => {
    let cancelled = false
    const timeoutId = setTimeout(() => {
      const now = Date.now()
      const runningIntervals: WorkInterval[] = Object.values(allTasks)
        .filter((t) => t.timer.isRunning && t.timer.startedAt != null)
        .map((t) => ({ taskId: t.id, taskName: t.name, start: t.timer.startedAt as number, end: now }))
      buildDailyWorkSummary(runningIntervals).then((result) => {
        if (!cancelled) setSummary(result)
      })
    }, 400)
    return () => {
      cancelled = true
      clearTimeout(timeoutId)
    }
  }, [allTasks])

  const visibleDates = useMemo(() => getVisibleDates(viewMode, anchorDateKey), [viewMode, anchorDateKey])
  const rangeLabel = getRangeLabel(viewMode, anchorDateKey)
  const isMonthView = viewMode === 'month'
  const lateColor = getSemanticColors(colorMode).late.late

  const tasksById = useMemo(() => new Map(tasks.map((t) => [t.id, t])), [tasks])

  const showWorkedOn = filters.includes('worked-on')
  const showDue = filters.includes('due')
  const showLate = filters.includes('late')

  function categoryColorFor(task: TaskCard): string {
    const category = task.categoryId ? categories[task.categoryId] : undefined
    if (!category) return getSemanticColors(colorMode).uncategorized
    return remapCategoryColor(category.color, colorMode)
  }

  function handleSortSelect(field: SortField) {
    setSortField(field)
    // Alphabetical defaults to A→Z; the numeric fields default to "most first".
    setSortDirection(field === 'alpha' ? 'asc' : 'desc')
  }

  function handleSortToggle() {
    setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'))
  }

  function sortWorkedOn(bars: WorkedOnBar[]): WorkedOnBar[] {
    const sorted = [...bars].sort((a, b) => {
      if (sortField === 'points') return (a.storyPoints ?? 0) - (b.storyPoints ?? 0)
      if (sortField === 'time') return a.seconds - b.seconds
      return a.taskName.localeCompare(b.taskName)
    })
    return sortDirection === 'desc' ? sorted.reverse() : sorted
  }

  function sortDue(bars: DueBar[]): DueBar[] {
    const sorted = [...bars].sort((a, b) => {
      if (sortField === 'points') return (a.storyPoints ?? 0) - (b.storyPoints ?? 0)
      // "Time elapsed" has no meaning for a bar with nothing logged that day — fall back to name.
      return a.taskName.localeCompare(b.taskName)
    })
    return sortDirection === 'desc' ? sorted.reverse() : sorted
  }

  function workedOnBarsFor(dateKey: string): WorkedOnBar[] {
    if (!showWorkedOn || !summary) return []
    const perTask = summary.seconds.get(dateKey)
    if (!perTask) return []
    const bars: WorkedOnBar[] = []
    for (const [taskId, seconds] of perTask) {
      if (seconds <= 0) continue
      const task = tasksById.get(taskId)
      if (!task) continue
      bars.push({
        taskId,
        taskName: task.name,
        color: categoryColorFor(task),
        seconds,
        storyPoints: task.storyPoints,
      })
    }
    return sortWorkedOn(bars)
  }

  function dueBarsFor(dateKey: string): DueBar[] {
    if (!showDue && !showLate) return []
    const bars: DueBar[] = []
    for (const task of tasks) {
      if (task.dueDate !== dateKey) continue
      const late = isLate(task)
      if (late && !showLate) continue
      if (!late && !showDue) continue
      bars.push({
        taskId: task.id,
        taskName: task.name,
        color: categoryColorFor(task),
        late,
        storyPoints: task.storyPoints,
      })
    }
    return sortDue(bars)
  }

  function handleShowMore(dateKey: string) {
    setViewMode('day')
    setAnchorDateKey(dateKey)
  }

  const gridColsClass = viewMode === 'day' ? 'grid-cols-1' : viewMode === '3day' ? 'grid-cols-3' : 'grid-cols-7'
  // On narrow screens, keep multi-column layouts legible by giving the grid a floor width and letting
  // the calendar scroll sideways instead of squishing each day cell. Desktop is unaffected.
  const gridMinWidthClass =
    viewMode === 'week' || viewMode === 'month' ? 'min-w-[640px]' : viewMode === '3day' ? 'min-w-[320px]' : ''

  return (
    <div ref={cardRef} className="relative rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Calendar</h3>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as CalendarViewMode)}
            className={selectClass}
          >
            {CALENDAR_VIEW_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <MultiSelectDropdown label="Show" options={FILTER_OPTIONS} selected={filters} onChange={setFilters} />
          <SortByDropdown
            label="Sort by"
            options={SORT_OPTIONS}
            field={sortField}
            direction={sortDirection}
            onSelect={handleSortSelect}
            onToggleDirection={handleSortToggle}
          />
        </div>
      </div>

      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setAnchorDateKey(shiftAnchor(viewMode, anchorDateKey, -1))}
            aria-label="Previous"
            className="rounded p-1 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            ←
          </button>
          <button
            onClick={() => setAnchorDateKey(todayDateKey())}
            className="rounded px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Today
          </button>
          <button
            onClick={() => setAnchorDateKey(shiftAnchor(viewMode, anchorDateKey, 1))}
            aria-label="Next"
            className="rounded p-1 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            →
          </button>
        </div>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{rangeLabel}</span>
      </div>

      <div className="overflow-x-auto">
        <div className={`grid gap-2 ${gridColsClass} ${gridMinWidthClass}`}>
          {visibleDates.map(({ dateKey, inCurrentPeriod }) => (
            <CalendarDayCell
              key={dateKey}
              dateKey={dateKey}
              inCurrentPeriod={inCurrentPeriod}
              isMonthView={isMonthView}
              workedOn={workedOnBarsFor(dateKey)}
              due={dueBarsFor(dateKey)}
              lateColor={lateColor}
              onOpenTask={onOpenTask}
              onShowMore={handleShowMore}
            />
          ))}
        </div>
      </div>

      <DownloadImageButton targetRef={cardRef} filename="chronokanban-calendar.png" />
    </div>
  )
}
