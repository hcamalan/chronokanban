import { useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useStore } from '../../store/useStore'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { SortableTaskCardMini } from '../task/SortableTaskCardMini'
import { CompletedSection } from './CompletedSection'
import { bucketWidthClass } from '../../utils/bucketWidth'
import type { Bucket } from '../../types'

interface BucketColumnProps {
  bucket: Bucket
  onOpenTask: (taskId: string) => void
  searchQuery: string
  selectMode: boolean
  selectedTaskIds: Set<string>
  onToggleSelect: (taskId: string) => void
}

// Distinct from the bucket's own id (which is the droppable zone for tasks dropped into it) —
// this is the bucket-as-a-draggable-card's own identity, so the two don't collide in dnd-kit's registry.
export const bucketSortableId = (bucketId: string) => `${bucketId}::bucket`

export function BucketColumn({
  bucket,
  onOpenTask,
  searchQuery,
  selectMode,
  selectedTaskIds,
  onToggleSelect,
}: BucketColumnProps) {
  const query = searchQuery.trim().toLowerCase()
  const activeTasks = useStore(
    useShallow((s) =>
      Object.values(s.tasks)
        .filter(
          (t) => t.bucketId === bucket.id && t.status !== 'completed' && t.name.toLowerCase().includes(query),
        )
        .sort((a, b) => a.order - b.order),
    ),
  )
  const completedTasks = useStore(
    useShallow((s) =>
      Object.values(s.tasks)
        .filter(
          (t) => t.bucketId === bucket.id && t.status === 'completed' && t.name.toLowerCase().includes(query),
        )
        .sort((a, b) => a.order - b.order),
    ),
  )
  const renameBucket = useStore((s) => s.renameBucket)
  const deleteBucket = useStore((s) => s.deleteBucket)
  const addTask = useStore((s) => s.addTask)
  const bucketWidth = useStore((s) => s.preferences.bucketWidth)
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const [editingName, setEditingName] = useState(false)
  const [name, setName] = useState(bucket.name)
  const [newTaskName, setNewTaskName] = useState('')
  const { setNodeRef: setDroppableRef } = useDroppable({ id: bucket.id })
  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: bucketSortableId(bucket.id) })

  return (
    <div
      ref={setSortableRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition ?? undefined,
        opacity: isDragging ? 0.4 : 1,
      }}
      {...attributes}
      {...listeners}
      className={`flex ${isDesktop ? bucketWidthClass(bucketWidth) : 'w-full'} flex-shrink-0 flex-col rounded-lg bg-gray-100 p-3 dark:bg-gray-800/60`}
    >
      <div className="mb-2 flex items-center justify-between">
        {editingName ? (
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => {
              setEditingName(false)
              if (name.trim()) renameBucket(bucket.id, name.trim())
              else setName(bucket.name)
            }}
            onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
            className="w-full rounded border border-gray-300 px-1 text-sm font-medium outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
          />
        ) : (
          <h2
            className="text-sm font-medium text-gray-700 dark:text-gray-200"
            onDoubleClick={() => setEditingName(true)}
          >
            {bucket.name}
          </h2>
        )}
        <button
          onClick={() => deleteBucket(bucket.id)}
          aria-label={`Delete bucket ${bucket.name}`}
          className="text-xs text-gray-400 hover:text-red-500"
        >
          ×
        </button>
      </div>

      <div ref={setDroppableRef} className="flex min-h-[2.5rem] flex-col gap-2">
        <SortableContext items={activeTasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {activeTasks.map((task) => (
            <SortableTaskCardMini
              key={task.id}
              task={task}
              onClick={() => onOpenTask(task.id)}
              selectMode={selectMode}
              selected={selectedTaskIds.has(task.id)}
              onToggleSelect={() => onToggleSelect(task.id)}
            />
          ))}
        </SortableContext>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (!newTaskName.trim()) return
          addTask(bucket.boardId, bucket.id, newTaskName.trim())
          setNewTaskName('')
        }}
        className="mt-2"
      >
        <input
          value={newTaskName}
          onChange={(e) => setNewTaskName(e.target.value)}
          placeholder="+ Add task"
          className="w-full rounded border border-transparent bg-white px-2 py-1 text-sm outline-none focus:border-gray-300 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-gray-600"
        />
      </form>

      <CompletedSection bucketId={bucket.id} tasks={completedTasks} onOpenTask={onOpenTask} />
    </div>
  )
}
