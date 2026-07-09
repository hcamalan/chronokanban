import { useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useStore } from '../../store/useStore'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { SortableTaskCardMini } from '../task/SortableTaskCardMini'
import { CompletedSection } from './CompletedSection'
import { ConfirmDialog } from '../boards/ConfirmDialog'
import { bucketWidthClass } from '../../utils/bucketWidth'
import type { Bucket } from '../../types'

interface BucketColumnProps {
  bucket: Bucket
  onOpenTask: (taskId: string) => void
  searchQuery: string
  selectMode: boolean
  selectedTaskIds: Set<string>
  onToggleSelect: (taskId: string) => void
  collapsed: boolean
  onToggleCollapsed: () => void
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
  collapsed,
  onToggleCollapsed,
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
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({ id: bucket.id })

  const taskCount = activeTasks.length + completedTasks.length
  function handleDeleteClick() {
    if (taskCount > 0) setConfirmingDelete(true)
    else deleteBucket(bucket.id)
  }
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
      className={`flex ${isDesktop ? bucketWidthClass(bucketWidth) : 'w-full'} flex-shrink-0 flex-col rounded-lg bg-gray-100 p-3 dark:bg-gray-800/60 ${
        isOver ? 'ring-2 ring-blue-400 dark:ring-blue-500' : ''
      }`}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-1.5">
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
          ) : collapsed ? (
            <button
              onClick={onToggleCollapsed}
              aria-label={`Expand bucket ${bucket.name}`}
              className="flex min-w-0 flex-1 items-center gap-1.5 py-0.5 text-left"
            >
              <span className="truncate text-sm font-medium text-gray-700 dark:text-gray-200">{bucket.name}</span>
              {taskCount > 0 && (
                <span className="flex-shrink-0 rounded-full bg-gray-200 px-1.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                  {taskCount}
                </span>
              )}
            </button>
          ) : (
            <h2
              className="truncate text-sm font-medium text-gray-700 dark:text-gray-200"
              onDoubleClick={() => setEditingName(true)}
            >
              {bucket.name}
            </h2>
          )}
        </div>
        <div className="flex flex-shrink-0 items-center gap-3">
          <button
            onClick={onToggleCollapsed}
            aria-label={collapsed ? `Expand bucket ${bucket.name}` : `Minimize bucket ${bucket.name}`}
            title={collapsed ? 'Expand' : 'Minimize'}
            className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              {collapsed ? <path d="m9 18 6-6-6-6" /> : <path d="m6 9 6 6 6-6" />}
            </svg>
          </button>
          <button
            onClick={handleDeleteClick}
            aria-label={`Delete bucket ${bucket.name}`}
            title="Delete bucket"
            className="text-gray-400 hover:text-red-500"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 6h18" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
          </button>
        </div>
      </div>

      {collapsed ? (
        <div ref={setDroppableRef} className="min-h-[1.5rem] rounded border border-dashed border-gray-300 dark:border-gray-600" />
      ) : (
        <>
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
        </>
      )}

      {confirmingDelete && (
        <ConfirmDialog
          message={`Deleting this bucket will permanently delete its ${taskCount} task${taskCount === 1 ? '' : 's'}. This cannot be undone.`}
          onCancel={() => setConfirmingDelete(false)}
          onConfirm={() => {
            deleteBucket(bucket.id)
            setConfirmingDelete(false)
          }}
        />
      )}
    </div>
  )
}
