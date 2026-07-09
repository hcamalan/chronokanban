import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useStore } from '../../store/useStore'
import { TaskCardMini } from './TaskCardMini'
import { SwipeToDelete } from './SwipeToDelete'
import { ConfirmDialog } from '../boards/ConfirmDialog'
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
  const deleteTasksWithUndo = useStore((s) => s.deleteTasksWithUndo)
  const [confirming, setConfirming] = useState(false)

  return (
    <>
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
        <SwipeToDelete onRequestDelete={() => setConfirming(true)}>
          <TaskCardMini
            task={task}
            onClick={onClick}
            selectMode={selectMode}
            selected={selected}
            onToggleSelect={onToggleSelect}
          />
        </SwipeToDelete>
      </div>
      {confirming && (
        <ConfirmDialog
          message={`Delete "${task.name || 'this task'}"? You can undo for a few seconds afterward.`}
          onCancel={() => setConfirming(false)}
          onConfirm={() => {
            deleteTasksWithUndo([task.id])
            setConfirming(false)
          }}
        />
      )}
    </>
  )
}
