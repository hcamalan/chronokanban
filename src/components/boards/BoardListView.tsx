import { useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, rectSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { useStore } from '../../store/useStore'
import { SortableBoardCard } from './SortableBoardCard'
import { ConfirmDialog } from './ConfirmDialog'

interface BoardListViewProps {
  onOpenBoard: (boardId: string) => void
}

export function BoardListView({ onOpenBoard }: BoardListViewProps) {
  const boards = useStore(useShallow((s) => Object.values(s.boards).sort((a, b) => a.order - b.order)))
  const tasks = useStore((s) => s.tasks)
  const addBoard = useStore((s) => s.addBoard)
  const renameBoard = useStore((s) => s.renameBoard)
  const deleteBoard = useStore((s) => s.deleteBoard)
  const duplicateBoard = useStore((s) => s.duplicateBoard)
  const reorderBoards = useStore((s) => s.reorderBoards)
  const [newName, setNewName] = useState('')
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  const taskCountFor = (boardId: string) =>
    Object.values(tasks).filter((t) => t.boardId === boardId).length

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = boards.findIndex((b) => b.id === active.id)
    const newIndex = boards.findIndex((b) => b.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return
    reorderBoards(arrayMove(boards, oldIndex, newIndex).map((b) => b.id))
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-gray-100">Boards</h1>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={boards.map((b) => b.id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {boards.map((board) => (
              <SortableBoardCard
                key={board.id}
                board={board}
                taskCount={taskCountFor(board.id)}
                onOpen={() => onOpenBoard(board.id)}
                onRename={(name) => renameBoard(board.id, name)}
                onDeleteRequest={() => setPendingDeleteId(board.id)}
                onDuplicate={() => duplicateBoard(board.id)}
              />
            ))}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (!newName.trim()) return
                addBoard(newName.trim())
                setNewName('')
              }}
              className="flex h-28 flex-col justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 p-4 dark:border-gray-600"
            >
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="New board name"
                className="rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              />
              <button
                type="submit"
                className="rounded bg-gray-900 px-3 py-1 text-sm text-white hover:bg-gray-700 dark:bg-gray-100 dark:text-gray-900"
              >
                Add board
              </button>
            </form>
          </div>
        </SortableContext>
      </DndContext>

      {pendingDeleteId && (
        <ConfirmDialog
          message="Deleting this board will permanently delete everything inside it, including all buckets and tasks. This cannot be undone."
          onCancel={() => setPendingDeleteId(null)}
          onConfirm={() => {
            deleteBoard(pendingDeleteId)
            setPendingDeleteId(null)
          }}
        />
      )}
    </div>
  )
}
