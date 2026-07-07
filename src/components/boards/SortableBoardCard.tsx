import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { BoardCard } from './BoardCard'
import type { Board } from '../../types'

interface SortableBoardCardProps {
  board: Board
  taskCount: number
  onOpen: () => void
  onRename: (name: string) => void
  onDeleteRequest: () => void
  onDuplicate: () => void
}

export function SortableBoardCard({
  board,
  taskCount,
  onOpen,
  onRename,
  onDeleteRequest,
  onDuplicate,
}: SortableBoardCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: board.id })

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
      <BoardCard
        board={board}
        taskCount={taskCount}
        onOpen={onOpen}
        onRename={onRename}
        onDeleteRequest={onDeleteRequest}
        onDuplicate={onDuplicate}
      />
    </div>
  )
}
