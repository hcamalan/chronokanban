import { useEffect, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useStore } from '../../store/useStore'
import { CategoryPicker } from './CategoryPicker'
import { PlayPauseButton } from './PlayPauseButton'
import { AttachmentList } from './AttachmentList'
import { ConfirmDialog } from '../boards/ConfirmDialog'
import { flushAllDebouncers } from '../../store/persist'
import { formatHHMM, parseHHMM } from '../../utils/time'
import type { Urgency, Importance, TaskStatus, RecurrenceUnit } from '../../types'

interface TaskDetailModalProps {
  taskId: string
  onClose: () => void
}

export function TaskDetailModal({ taskId, onClose }: TaskDetailModalProps) {
  const task = useStore((s) => s.tasks[taskId])
  const boards = useStore(useShallow((s) => Object.values(s.boards).sort((a, b) => a.order - b.order)))
  const assigneeSuggestions = useStore(
    useShallow((s) =>
      Array.from(new Set(Object.values(s.tasks).map((t) => t.assignedTo).filter((a) => a.trim() !== ''))).sort(),
    ),
  )
  const updateTask = useStore((s) => s.updateTask)
  const moveTaskToBoard = useStore((s) => s.moveTaskToBoard)
  const deleteTask = useStore((s) => s.deleteTask)
  const duplicateTask = useStore((s) => s.duplicateTask)
  const startTimer = useStore((s) => s.startTimer)
  const pauseTimer = useStore((s) => s.pauseTimer)
  const resetTimer = useStore((s) => s.resetTimer)
  const setElapsedTime = useStore((s) => s.setElapsedTime)
  const completeTask = useStore((s) => s.completeTask)
  const uncompleteTask = useStore((s) => s.uncompleteTask)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [elapsedText, setElapsedText] = useState(() => formatHHMM(task?.timer.elapsedSeconds ?? 0))
  const [elapsedFocused, setElapsedFocused] = useState(false)
  const [descriptionExpanded, setDescriptionExpanded] = useState(false)
  const [maximized, setMaximized] = useState(false)
  const [newSubtaskText, setNewSubtaskText] = useState('')

  // Re-sync the displayed text whenever the stored elapsed time changes (timer actions, or our own
  // committed edits) — but never while the user is actively focused in the field, so it can't clobber
  // an in-progress edit.
  useEffect(() => {
    if (!elapsedFocused && task) {
      setElapsedText(formatHHMM(task.timer.elapsedSeconds))
    }
  }, [task?.timer.elapsedSeconds, elapsedFocused, task])

  if (!task) return null

  const isCompleted = task.status === 'completed'

  const handleClose = () => {
    flushAllDebouncers()
    onClose()
  }

  function commitElapsedTime() {
    const currentDisplay = formatHHMM(task.timer.elapsedSeconds)
    if (elapsedText === currentDisplay) return // untouched — don't disturb the timer or log anything
    const parsed = parseHHMM(elapsedText)
    if (parsed == null) {
      setElapsedText(currentDisplay) // invalid — revert silently
      return
    }
    setElapsedTime(taskId, parsed)
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4"
      onClick={handleClose}
    >
      <div
        className={`overflow-y-auto rounded-lg bg-white p-6 shadow-xl dark:bg-gray-900 ${
          maximized ? 'h-[95vh] w-[95vw] max-w-none' : 'max-h-[90vh] w-full max-w-2xl'
        }`}
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
          <div className="ml-3 flex flex-shrink-0 items-center gap-1">
            <button
              onClick={handleClose}
              aria-label="Minimize"
              className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
            >
              −
            </button>
            <button
              onClick={() => setMaximized((v) => !v)}
              aria-label={maximized ? 'Restore' : 'Maximize'}
              className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
            >
              {maximized ? '❐' : '□'}
            </button>
            <button
              onClick={handleClose}
              aria-label="Close"
              className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-3">
          {!isCompleted && (
            <PlayPauseButton
              timer={task.timer}
              onStart={() => startTimer(taskId)}
              onPause={() => pauseTimer(taskId)}
              size="md"
            />
          )}
          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            Time elapsed
            <input
              type="text"
              inputMode="numeric"
              placeholder="0:00"
              value={elapsedText}
              onChange={(e) => setElapsedText(e.target.value)}
              onFocus={() => setElapsedFocused(true)}
              onBlur={() => {
                setElapsedFocused(false)
                commitElapsedTime()
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') e.currentTarget.blur()
              }}
              className="w-16 rounded border border-gray-300 px-2 py-1 font-mono dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            />
          </label>
          {!isCompleted && (
            <button
              onClick={() => resetTimer(taskId)}
              className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Reset
            </button>
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
              list="assignee-suggestions"
              className="rounded border border-gray-300 px-2 py-1 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            />
            <datalist id="assignee-suggestions">
              {assigneeSuggestions.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
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
              value={task.urgency ?? ''}
              onChange={(e) => updateTask(taskId, { urgency: e.target.value === '' ? null : (e.target.value as Urgency) })}
              className="rounded border border-gray-300 px-2 py-1 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            >
              <option value="">—</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm text-gray-600 dark:text-gray-300">
            Importance
            <select
              value={task.importance ?? ''}
              onChange={(e) =>
                updateTask(taskId, { importance: e.target.value === '' ? null : (e.target.value as Importance) })
              }
              className="rounded border border-gray-300 px-2 py-1 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            >
              <option value="">—</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm text-gray-600 dark:text-gray-300">
            Repeat
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!task.recurrence}
                disabled={!task.dueDate}
                onChange={(e) =>
                  updateTask(taskId, {
                    recurrence: e.target.checked ? { interval: 1, unit: 'week' } : null,
                  })
                }
                className="h-4 w-4 cursor-pointer disabled:cursor-not-allowed"
              />
              {task.recurrence && (
                <>
                  <input
                    type="number"
                    min={1}
                    value={task.recurrence.interval}
                    onChange={(e) =>
                      updateTask(taskId, {
                        recurrence: { interval: Math.max(1, Number(e.target.value)), unit: task.recurrence!.unit },
                      })
                    }
                    className="w-14 rounded border border-gray-300 px-2 py-1 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                  />
                  <select
                    value={task.recurrence.unit}
                    onChange={(e) =>
                      updateTask(taskId, {
                        recurrence: { interval: task.recurrence!.interval, unit: e.target.value as RecurrenceUnit },
                      })
                    }
                    className="rounded border border-gray-300 px-2 py-1 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                  >
                    <option value="day">Day(s)</option>
                    <option value="week">Week(s)</option>
                    <option value="month">Month(s)</option>
                  </select>
                </>
              )}
            </div>
            {!task.dueDate && <span className="text-xs text-gray-400">Set a due date to enable</span>}
          </label>
        </div>

        <div className="mt-4">
          <h3 className="mb-2 text-sm text-gray-600 dark:text-gray-300">Sub-tasks</h3>
          <div className="flex flex-col gap-1">
            {task.subtasks.map((sub) => (
              <div key={sub.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={sub.done}
                  onChange={() =>
                    updateTask(taskId, {
                      subtasks: task.subtasks.map((s) => (s.id === sub.id ? { ...s, done: !s.done } : s)),
                    })
                  }
                  className="h-4 w-4 flex-shrink-0 cursor-pointer"
                />
                <span
                  className={`flex-1 text-sm ${
                    sub.done ? 'text-gray-400 line-through dark:text-gray-500' : 'text-gray-900 dark:text-gray-100'
                  }`}
                >
                  {sub.text}
                </span>
                <button
                  onClick={() => updateTask(taskId, { subtasks: task.subtasks.filter((s) => s.id !== sub.id) })}
                  aria-label={`Delete sub-task ${sub.text}`}
                  className="text-xs text-gray-400 hover:text-red-500"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (!newSubtaskText.trim()) return
              updateTask(taskId, {
                subtasks: [...task.subtasks, { id: crypto.randomUUID(), text: newSubtaskText.trim(), done: false }],
              })
              setNewSubtaskText('')
            }}
            className="mt-2"
          >
            <input
              value={newSubtaskText}
              onChange={(e) => setNewSubtaskText(e.target.value)}
              placeholder="+ Add sub-task"
              className="w-full rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            />
          </form>
        </div>

        <label className="mt-4 flex flex-col gap-1 text-sm text-gray-600 dark:text-gray-300">
          Description
          <textarea
            value={task.description}
            onChange={(e) => updateTask(taskId, { description: e.target.value })}
            rows={descriptionExpanded ? 16 : 4}
            className="rounded border border-gray-300 px-2 py-1 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />
        </label>
        <div className="flex justify-end">
          <button
            onClick={() => setDescriptionExpanded((v) => !v)}
            className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            {descriptionExpanded ? 'Collapse' : 'Expand'}
          </button>
        </div>

        <AttachmentList taskId={taskId} />

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={() => {
              duplicateTask(taskId)
              handleClose()
            }}
            className="rounded px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Duplicate
          </button>
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
