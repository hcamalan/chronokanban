import { formatDayHeader, parseDateKey, todayDateKey } from '../../utils/calendarRange'

export interface WorkedOnBar {
  taskId: string
  taskName: string
  color: string
  seconds: number
}

export interface DueBar {
  taskId: string
  taskName: string
  color: string
  late: boolean
}

interface CalendarDayCellProps {
  dateKey: string
  inCurrentPeriod: boolean
  isMonthView: boolean
  workedOn: WorkedOnBar[]
  due: DueBar[]
  lateColor: string
  onOpenTask: (taskId: string) => void
  onShowMore: (dateKey: string) => void
}

const MAX_MONTH_BARS = 3

function formatHours(seconds: number): string {
  const hours = seconds / 3600
  return hours >= 10 ? `${Math.round(hours)}h` : `${Math.round(hours * 10) / 10}h`
}

export function CalendarDayCell({
  dateKey,
  inCurrentPeriod,
  isMonthView,
  workedOn,
  due,
  lateColor,
  onOpenTask,
  onShowMore,
}: CalendarDayCellProps) {
  const isToday = dateKey === todayDateKey()
  const dayLabel = isMonthView ? String(parseDateKey(dateKey).getDate()) : formatDayHeader(dateKey)

  const bars = [
    ...workedOn.map((w) => ({ kind: 'worked-on' as const, bar: w })),
    ...due.map((d) => ({ kind: 'due' as const, bar: d })),
  ]
  const visibleBars = isMonthView ? bars.slice(0, MAX_MONTH_BARS) : bars
  const overflowCount = bars.length - visibleBars.length

  return (
    <div
      className={`flex min-h-[5rem] flex-col gap-1 rounded-md border p-1.5 ${
        inCurrentPeriod
          ? 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900'
          : 'border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/40'
      }`}
    >
      <span
        className={`text-xs font-medium ${
          isToday
            ? 'w-fit rounded-full bg-gray-900 px-1.5 text-white dark:bg-gray-100 dark:text-gray-900'
            : inCurrentPeriod
              ? 'text-gray-500 dark:text-gray-400'
              : 'text-gray-300 dark:text-gray-600'
        }`}
      >
        {dayLabel}
      </span>
      <div className="flex flex-col gap-1">
        {visibleBars.map(({ kind, bar }) =>
          kind === 'worked-on' ? (
            <button
              key={`w-${bar.taskId}`}
              onClick={() => onOpenTask(bar.taskId)}
              title={`${bar.taskName} — ${formatHours(bar.seconds)}`}
              className="truncate rounded px-1.5 py-0.5 text-left text-xs text-white"
              style={{ backgroundColor: bar.color }}
            >
              {bar.taskName}
            </button>
          ) : (
            <button
              key={`d-${bar.taskId}`}
              onClick={() => onOpenTask(bar.taskId)}
              title={bar.taskName}
              className="flex items-center gap-1 truncate rounded border-2 bg-transparent px-1 py-0.5 text-left text-xs"
              style={{ borderColor: bar.color, color: bar.color }}
            >
              {bar.late && (
                <span className="font-bold" style={{ color: lateColor }}>
                  !
                </span>
              )}
              <span className="truncate">{bar.taskName}</span>
            </button>
          ),
        )}
        {overflowCount > 0 && (
          <button
            onClick={() => onShowMore(dateKey)}
            className="text-left text-xs text-gray-500 hover:underline dark:text-gray-400"
          >
            +{overflowCount} more
          </button>
        )}
      </div>
    </div>
  )
}
