import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { TaskCardMini } from './TaskCardMini'
import type { TaskCard } from '../../types'

interface SortableTaskCardMiniProps {
  task: TaskCard
  onClick: () => void
  selectMode?: boolean
  selected?: boolean
  onToggleSelect?: () => void
}

export function SortableTaskCardMini({
  task,
  onClick,
  selectMode,
  selected,
  onToggleSelect,
}: SortableTaskCardMiniProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition ?? undefined,
        opacity: isDragging ? 0.4 : 1,
      }}
      {...attributes}
      {...listeners}
    >
      <TaskCardMini
        task={task}
        onClick={onClick}
        selectMode={selectMode}
        selected={selected}
        onToggleSelect={onToggleSelect}
      />
    </div>
  )
}
