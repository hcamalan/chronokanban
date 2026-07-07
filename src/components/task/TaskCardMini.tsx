import type { TaskCard } from '../../types'
import { useStore } from '../../store/useStore'
import { PlayPauseButton } from './PlayPauseButton'
import { formatDuration, formatDateShort } from '../../utils/time'

interface TaskCardMiniProps {
  task: TaskCard
  onClick: () => void
}

const highTagClass = 'rounded-full bg-red-100 px-1.5 py-0.5 font-semibold text-red-700 dark:bg-red-900 dark:text-red-200'

export function TaskCardMini({ task, onClick }: TaskCardMiniProps) {
  const category = useStore((s) => (task.categoryId ? s.categories[task.categoryId] : undefined))
  const startTimer = useStore((s) => s.startTimer)
  const pauseTimer = useStore((s) => s.pauseTimer)
  const completeTask = useStore((s) => s.completeTask)
  const uncompleteTask = useStore((s) => s.uncompleteTask)
  const isCompleted = task.status === 'completed'

  return (
    <div
      onClick={onClick}
      className={`flex cursor-pointer flex-col gap-1.5 rounded-md border border-gray-200 bg-white p-2.5 text-left shadow-sm hover:shadow dark:border-gray-700 dark:bg-gray-900 ${
        isCompleted ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-start gap-2">
        <input
          type="checkbox"
          checked={isCompleted}
          onChange={() => (isCompleted ? uncompleteTask(task.id) : completeTask(task.id))}
          onClick={(e) => e.stopPropagation()}
          aria-label={isCompleted ? 'Mark task incomplete' : 'Mark task complete'}
          className="mt-0.5 h-4 w-4 flex-shrink-0 cursor-pointer"
        />
        <span
          className={`text-sm font-medium text-gray-900 dark:text-gray-100 ${
            isCompleted ? 'text-gray-400 line-through dark:text-gray-500' : ''
          }`}
        >
          {task.name}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-1 text-xs">
        {category && (
          <span
            className="rounded-full px-1.5 py-0.5"
            style={{ backgroundColor: `${category.color}33`, color: category.color }}
          >
            {category.name}
          </span>
        )}
        {task.dueDate && (
          <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
            {formatDateShort(task.dueDate)}
          </span>
        )}
        {task.urgency === 'high' && <span className={highTagClass}>U</span>}
        {task.importance === 'high' && <span className={highTagClass}>I</span>}
      </div>
      {isCompleted ? (
        <span className="font-mono text-xs text-gray-400 dark:text-gray-500">
          {formatDuration(task.timer.elapsedSeconds)}
        </span>
      ) : (
        <PlayPauseButton
          timer={task.timer}
          onStart={() => startTimer(task.id)}
          onPause={() => pauseTimer(task.id)}
        />
      )}
    </div>
  )
}
