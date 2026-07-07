import { useStore } from '../../store/useStore'
import { useTick } from '../../hooks/useTick'
import { isTimerLongRunning } from '../../utils/time'
import type { TaskCard } from '../../types'

interface RunningTimersBannerProps {
  tasks: TaskCard[]
  boardCount?: number
  onPauseAll: () => void
}

export function RunningTimersBanner({ tasks, boardCount, onPauseAll }: RunningTimersBannerProps) {
  const pauseTimer = useStore((s) => s.pauseTimer)
  useTick(tasks.length > 0, 60_000)

  if (tasks.length === 0) return null

  const taskWord = tasks.length === 1 ? 'task' : 'tasks'
  const scopeText =
    boardCount != null ? `from ${boardCount} board${boardCount === 1 ? '' : 's'}` : 'in this board'
  const pauseAllLabel = boardCount != null ? 'Pause all clocks' : 'Pause all clocks in this board'

  const flaggedTasks = tasks.filter((t) => isTimerLongRunning(t.timer))

  return (
    <div className="mb-4 space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-900 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-100">
        <span>
          You are currently working on <strong>{tasks.length}</strong> {taskWord} {scopeText}.
        </span>
        <button onClick={onPauseAll} className="font-medium underline hover:no-underline">
          {pauseAllLabel}
        </button>
      </div>
      {flaggedTasks.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100">
          <span>
            ⚠ <strong>{flaggedTasks.length}</strong> of these {flaggedTasks.length === 1 ? 'has' : 'have'} been
            running for over 8 hours — you may have forgotten to pause{' '}
            {flaggedTasks.length === 1 ? 'it' : 'them'}.
          </span>
          <button
            onClick={() => flaggedTasks.forEach((t) => pauseTimer(t.id))}
            className="font-medium underline hover:no-underline"
          >
            Pause flagged
          </button>
        </div>
      )}
    </div>
  )
}
