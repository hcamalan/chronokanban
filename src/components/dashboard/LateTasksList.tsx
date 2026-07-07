import { useStore } from '../../store/useStore'
import { isLate, formatDate } from '../../utils/time'
import { getSemanticColors } from '../../utils/colorPalette'
import type { TaskCard } from '../../types'

interface LateTasksListProps {
  tasks: TaskCard[]
  onOpenTask: (taskId: string) => void
}

export function LateTasksList({ tasks, onOpenTask }: LateTasksListProps) {
  const boards = useStore((s) => s.boards)
  const buckets = useStore((s) => s.buckets)
  const dateFormat = useStore((s) => s.preferences.dateFormat)
  const colorMode = useStore((s) => s.preferences.colorMode)
  const lateColor = getSemanticColors(colorMode).late.late
  const lateTasks = tasks.filter((t) => isLate(t)).sort((a, b) => (a.dueDate ?? '').localeCompare(b.dueDate ?? ''))

  if (lateTasks.length === 0) {
    return <p className="text-sm text-gray-500 dark:text-gray-400">No late tasks.</p>
  }

  return (
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="text-gray-500 dark:text-gray-400">
          <th className="pb-2">Task</th>
          <th className="pb-2">Board</th>
          <th className="pb-2">Bucket</th>
          <th className="pb-2">Due date</th>
        </tr>
      </thead>
      <tbody>
        {lateTasks.map((t) => (
          <tr
            key={t.id}
            onClick={() => onOpenTask(t.id)}
            className="cursor-pointer border-t border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800"
          >
            <td className="py-2 text-gray-900 dark:text-gray-100">{t.name}</td>
            <td className="py-2 text-gray-600 dark:text-gray-300">{boards[t.boardId]?.name}</td>
            <td className="py-2 text-gray-600 dark:text-gray-300">{buckets[t.bucketId]?.name}</td>
            <td className="py-2" style={{ color: lateColor }}>
              {t.dueDate && formatDate(t.dueDate, dateFormat)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
