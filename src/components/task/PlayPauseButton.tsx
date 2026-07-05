import { useElapsedTime } from '../../hooks/useElapsedTime'
import { formatDuration } from '../../utils/time'
import type { TimerState } from '../../types'

interface PlayPauseButtonProps {
  timer: TimerState
  onStart: () => void
  onPause: () => void
  size?: 'sm' | 'md'
}

export function PlayPauseButton({ timer, onStart, onPause, size = 'sm' }: PlayPauseButtonProps) {
  const elapsed = useElapsedTime(timer)
  const buttonSize = size === 'sm' ? 'h-6 w-6 text-xs' : 'h-9 w-9 text-base'
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm'

  return (
    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => (timer.isRunning ? onPause() : onStart())}
        aria-label={timer.isRunning ? 'Pause timer' : 'Start timer'}
        className={`flex flex-shrink-0 items-center justify-center rounded-full bg-gray-900 text-white hover:bg-gray-700 dark:bg-gray-100 dark:text-gray-900 ${buttonSize}`}
      >
        {timer.isRunning ? '❚❚' : '▶'}
      </button>
      <span className={`font-mono text-gray-600 dark:text-gray-300 ${textSize}`}>
        {formatDuration(elapsed)}
      </span>
    </div>
  )
}
