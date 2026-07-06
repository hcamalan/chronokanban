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
  const glyphSize = size === 'sm' ? 'text-base' : 'text-xl'
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm'

  return (
    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => (timer.isRunning ? onPause() : onStart())}
        aria-label={timer.isRunning ? 'Pause timer' : 'Start timer'}
        className={`flex flex-shrink-0 items-center justify-center leading-none text-gray-900 hover:text-gray-600 dark:text-gray-100 dark:hover:text-gray-400 ${glyphSize}`}
      >
        {timer.isRunning ? '❚❚' : '▶'}
      </button>
      <span className={`font-mono text-gray-600 dark:text-gray-300 ${textSize}`}>
        {formatDuration(elapsed)}
      </span>
    </div>
  )
}
