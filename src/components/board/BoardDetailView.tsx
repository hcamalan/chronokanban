import { useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { useStore } from '../../store/useStore'
import { BucketColumn } from './BucketColumn'
import { CategoryManager } from './CategoryManager'
import { completedDroppableId } from './CompletedSection'
import { TaskCardMini } from '../task/TaskCardMini'

interface BoardDetailViewProps {
  boardId: string
  onBack: () => void
  onOpenTask: (taskId: string) => void
}

export function BoardDetailView({ boardId, onBack, onOpenTask }: BoardDetailViewProps) {
  const board = useStore((s) => s.boards[boardId])
  const buckets = useStore(
    useShallow((s) =>
      Object.values(s.buckets)
        .filter((b) => b.boardId === boardId)
        .sort((a, b) => a.order - b.order),
    ),
  )
  const tasks = useStore((s) => s.tasks)
  const renameBoard = useStore((s) => s.renameBoard)
  const addBucket = useStore((s) => s.addBucket)
  const moveTask = useStore((s) => s.moveTask)
  const [editingName, setEditingName] = useState(false)
  const [name, setName] = useState(board?.name ?? '')
  const [newBucketName, setNewBucketName] = useState('')
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  function handleDragStart(event: DragStartEvent) {
    setActiveTaskId(String(event.active.id))
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveTaskId(null)
    const { active, over } = event
    if (!over) return

    const draggedTaskId = String(active.id)
    const draggedTask = tasks[draggedTaskId]
    if (!draggedTask) return
    const draggedIsCompleted = draggedTask.status === 'completed'

    const overId = String(over.id)
    const overTask = tasks[overId]

    let toBucketId: string
    let toIsCompletedZone: boolean
    let overTaskIdForIndex: string | null = null

    if (overTask) {
      toBucketId = overTask.bucketId
      toIsCompletedZone = overTask.status === 'completed'
      overTaskIdForIndex = overTask.id
    } else if (buckets.some((b) => completedDroppableId(b.id) === overId)) {
      toBucketId = overId.slice(0, -'::completed'.length)
      toIsCompletedZone = true
    } else if (buckets.some((b) => b.id === overId)) {
      toBucketId = overId
      toIsCompletedZone = false
    } else {
      return
    }

    // Dragging never changes completion status — only checking/unchecking the checkbox does.
    if (toIsCompletedZone !== draggedIsCompleted) return

    const destinationTasks = Object.values(tasks)
      .filter(
        (t) =>
          t.bucketId === toBucketId && t.id !== draggedTaskId && (t.status === 'completed') === draggedIsCompleted,
      )
      .sort((a, b) => a.order - b.order)

    let toIndex = destinationTasks.length
    if (overTaskIdForIndex) {
      const overIndex = destinationTasks.findIndex((t) => t.id === overTaskIdForIndex)
      if (overIndex !== -1) toIndex = overIndex
    }

    moveTask(draggedTaskId, toBucketId, toIndex)
  }

  if (!board) return null

  return (
    <div className="flex h-full flex-col p-6">
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={onBack}
          aria-label="Back to boards"
          className="rounded p-1 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          ←
        </button>
        {editingName ? (
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => {
              setEditingName(false)
              if (name.trim()) renameBoard(boardId, name.trim())
              else setName(board.name)
            }}
            onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
            className="rounded border border-gray-300 px-2 text-xl font-semibold outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />
        ) : (
          <h1
            className="text-xl font-semibold text-gray-900 dark:text-gray-100"
            onDoubleClick={() => setEditingName(true)}
          >
            {board.name}
          </h1>
        )}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-1 gap-4 overflow-x-auto pb-4">
          {buckets.map((bucket) => (
            <BucketColumn key={bucket.id} bucket={bucket} onOpenTask={onOpenTask} />
          ))}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (!newBucketName.trim()) return
              addBucket(boardId, newBucketName.trim())
              setNewBucketName('')
            }}
            className="flex h-fit w-64 flex-shrink-0 flex-col gap-2 rounded-lg border-2 border-dashed border-gray-300 p-3 dark:border-gray-600"
          >
            <input
              value={newBucketName}
              onChange={(e) => setNewBucketName(e.target.value)}
              placeholder="New bucket name"
              className="rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            />
            <button
              type="submit"
              className="rounded bg-gray-900 px-3 py-1 text-sm text-white hover:bg-gray-700 dark:bg-gray-100 dark:text-gray-900"
            >
              Add bucket
            </button>
          </form>
        </div>
        <DragOverlay>
          {activeTaskId && tasks[activeTaskId] ? (
            <TaskCardMini task={tasks[activeTaskId]} onClick={() => {}} />
          ) : null}
        </DragOverlay>
      </DndContext>

      <CategoryManager boardId={boardId} />
    </div>
  )
}
