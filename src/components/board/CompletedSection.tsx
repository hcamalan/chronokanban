import { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { SortableTaskCardMini } from '../task/SortableTaskCardMini'
import type { TaskCard } from '../../types'

interface CompletedSectionProps {
  bucketId: string
  tasks: TaskCard[]
  onOpenTask: (taskId: string) => void
}

export const completedDroppableId = (bucketId: string) => `${bucketId}::completed`

export function CompletedSection({ bucketId, tasks, onOpenTask }: CompletedSectionProps) {
  const [expanded, setExpanded] = useState(false)
  const { setNodeRef } = useDroppable({ id: completedDroppableId(bucketId) })

  return (
    <div className="mt-2 border-t border-gray-200 pt-2 dark:border-gray-700">
      <button
        onClick={() => setExpanded((e) => !e)}
        className="text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        Completed ({tasks.length})
      </button>
      {expanded && (
        <div ref={setNodeRef} className="mt-2 flex min-h-[2.5rem] flex-col gap-2">
          <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            {tasks.map((task) => (
              <SortableTaskCardMini key={task.id} task={task} onClick={() => onOpenTask(task.id)} />
            ))}
          </SortableContext>
        </div>
      )}
    </div>
  )
}
