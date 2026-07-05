import { useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useStore } from '../../store/useStore'
import { SortableTaskCardMini } from '../task/SortableTaskCardMini'
import { CompletedSection } from './CompletedSection'
import type { Bucket } from '../../types'

interface BucketColumnProps {
  bucket: Bucket
  onOpenTask: (taskId: string) => void
}

export function BucketColumn({ bucket, onOpenTask }: BucketColumnProps) {
  const activeTasks = useStore(
    useShallow((s) =>
      Object.values(s.tasks)
        .filter((t) => t.bucketId === bucket.id && t.status !== 'completed')
        .sort((a, b) => a.order - b.order),
    ),
  )
  const completedTasks = useStore(
    useShallow((s) =>
      Object.values(s.tasks)
        .filter((t) => t.bucketId === bucket.id && t.status === 'completed')
        .sort((a, b) => a.order - b.order),
    ),
  )
  const renameBucket = useStore((s) => s.renameBucket)
  const deleteBucket = useStore((s) => s.deleteBucket)
  const addTask = useStore((s) => s.addTask)
  const [editingName, setEditingName] = useState(false)
  const [name, setName] = useState(bucket.name)
  const [newTaskName, setNewTaskName] = useState('')
  const { setNodeRef } = useDroppable({ id: bucket.id })

  return (
    <div className="flex w-64 flex-shrink-0 flex-col rounded-lg bg-gray-100 p-3 dark:bg-gray-800/60">
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

      <div ref={setNodeRef} className="flex min-h-[2.5rem] flex-col gap-2">
        <SortableContext items={activeTasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {activeTasks.map((task) => (
            <SortableTaskCardMini key={task.id} task={task} onClick={() => onOpenTask(task.id)} />
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
