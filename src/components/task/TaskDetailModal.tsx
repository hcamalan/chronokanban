import { useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useStore } from '../../store/useStore'
import { CategoryPicker } from './CategoryPicker'
import { PlayPauseButton } from './PlayPauseButton'
import { AttachmentList } from './AttachmentList'
import { ConfirmDialog } from '../boards/ConfirmDialog'
import { flushAllDebouncers } from '../../store/persist'
import { formatDuration } from '../../utils/time'
import type { Urgency, Importance, TaskStatus } from '../../types'

interface TaskDetailModalProps {
  taskId: string
  onClose: () => void
}

export function TaskDetailModal({ taskId, onClose }: TaskDetailModalProps) {
  const task = useStore((s) => s.tasks[taskId])
  const boards = useStore(useShallow((s) => Object.values(s.boards).sort((a, b) => a.order - b.order)))
  const updateTask = useStore((s) => s.updateTask)
  const moveTaskToBoard = useStore((s) => s.moveTaskToBoard)
  const deleteTask = useStore((s) => s.deleteTask)
  const startTimer = useStore((s) => s.startTimer)
  const pauseTimer = useStore((s) => s.pauseTimer)
  const resetTimer = useStore((s) => s.resetTimer)
  const completeTask = useStore((s) => s.completeTask)
  const uncompleteTask = useStore((s) => s.uncompleteTask)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  if (!task) return null

  const isCompleted = task.status === 'completed'

  const handleClose = () => {
    flushAllDebouncers()
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4"
      onClick={handleClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl dark:bg-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between">
          <div className="flex w-full items-start gap-2">
            <input
              type="checkbox"
              checked={isCompleted}
              onChange={() => (isCompleted ? uncompleteTask(taskId) : completeTask(taskId))}
              aria-label={isCompleted ? 'Mark task incomplete' : 'Mark task complete'}
              className="mt-2 h-4 w-4 flex-shrink-0 cursor-pointer"
            />
            <input
              value={task.name}
              onChange={(e) => updateTask(taskId, { name: e.target.value })}
              className={`w-full rounded border border-transparent px-1 text-xl font-semibold outline-none focus:border-gray-300 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-gray-600 ${
                isCompleted ? 'text-gray-400 line-through dark:text-gray-500' : ''
              }`}
            />
          </div>
          <button
            onClick={handleClose}
            aria-label="Close"
            className="ml-3 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
          >
            ✕
          </button>
        </div>

        <div className="mb-4 flex items-center gap-3">
          {isCompleted ? (
            <span className="font-mono text-sm text-gray-400 dark:text-gray-500">
              {formatDuration(task.timer.elapsedSeconds)}
            </span>
          ) : (
            <>
              <PlayPauseButton
                timer={task.timer}
                onStart={() => startTimer(taskId)}
                onPause={() => pauseTimer(taskId)}
                size="md"
              />
              <button
                onClick={() => resetTimer(taskId)}
                className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Reset
              </button>
            </>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1 text-sm text-gray-600 dark:text-gray-300">
            Board
            <select
              value={task.boardId}
              onChange={(e) => moveTaskToBoard(taskId, e.target.value)}
              className="rounded border border-gray-300 px-2 py-1 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            >
              {boards.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm text-gray-600 dark:text-gray-300">
            Category
            <CategoryPicker
              boardId={task.boardId}
              value={task.categoryId}
              onChange={(categoryId) => updateTask(taskId, { categoryId })}
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-gray-600 dark:text-gray-300">
            Status
            <select
              value={task.status}
              onChange={(e) => {
                const newStatus = e.target.value as TaskStatus
                if (newStatus === 'completed') {
                  completeTask(taskId)
                } else {
                  if (task.status === 'completed') uncompleteTask(taskId)
                  updateTask(taskId, { status: newStatus })
                }
              }}
              className="rounded border border-gray-300 px-2 py-1 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            >
              <option value="not-started">Not started</option>
              <option value="in-progress">In progress</option>
              <option value="completed">Completed</option>
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm text-gray-600 dark:text-gray-300">
            Assigned to
            <input
              value={task.assignedTo}
              onChange={(e) => updateTask(taskId, { assignedTo: e.target.value })}
              className="rounded border border-gray-300 px-2 py-1 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-gray-600 dark:text-gray-300">
            Due date
            <input
              type="date"
              value={task.dueDate ?? ''}
              onChange={(e) => updateTask(taskId, { dueDate: e.target.value || null })}
              className="rounded border border-gray-300 px-2 py-1 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-gray-600 dark:text-gray-300">
            Story points
            <input
              type="number"
              min={0}
              value={task.storyPoints ?? ''}
              onChange={(e) =>
                updateTask(taskId, {
                  storyPoints: e.target.value === '' ? null : Number(e.target.value),
                })
              }
              className="rounded border border-gray-300 px-2 py-1 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-gray-600 dark:text-gray-300">
            Urgency
            <select
              value={task.urgency}
              onChange={(e) => updateTask(taskId, { urgency: e.target.value as Urgency })}
              className="rounded border border-gray-300 px-2 py-1 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm text-gray-600 dark:text-gray-300">
            Importance
            <select
              value={task.importance}
              onChange={(e) => updateTask(taskId, { importance: e.target.value as Importance })}
              className="rounded border border-gray-300 px-2 py-1 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>
        </div>

        <label className="mt-4 flex flex-col gap-1 text-sm text-gray-600 dark:text-gray-300">
          Description
          <textarea
            value={task.description}
            onChange={(e) => updateTask(taskId, { description: e.target.value })}
            rows={4}
            className="rounded border border-gray-300 px-2 py-1 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />
        </label>

        <AttachmentList taskId={taskId} />

        <div className="mt-6 flex justify-end">
          <button
            onClick={() => setConfirmingDelete(true)}
            className="rounded px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
          >
            Delete task
          </button>
        </div>
      </div>

      {confirmingDelete && (
        <ConfirmDialog
          message={`Delete "${task.name}"? This cannot be undone.`}
          onCancel={() => setConfirmingDelete(false)}
          onConfirm={() => {
            deleteTask(taskId)
            setConfirmingDelete(false)
            onClose()
          }}
        />
      )}
    </div>
  )
}
