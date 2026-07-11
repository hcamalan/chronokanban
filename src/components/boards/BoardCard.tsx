import { useState } from 'react'
import type { Board } from '../../types'

interface BoardCardProps {
  board: Board
  taskCount: number
  onOpen: () => void
  onRename: (name: string) => void
  onDeleteRequest: () => void
  onDuplicate: () => void
}

export function BoardCard({ board, taskCount, onOpen, onRename, onDeleteRequest, onDuplicate }: BoardCardProps) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(board.name)

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Open board ${board.name}`}
      onClick={() => {
        if (!editing) onOpen()
      }}
      onKeyDown={(e) => {
        if (!editing && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          onOpen()
        }
      }}
      className="group relative flex h-28 cursor-pointer flex-col justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
    >
      {editing ? (
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => {
            setEditing(false)
            if (name.trim()) onRename(name.trim())
            else setName(board.name)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.currentTarget.blur()
          }}
          onClick={(e) => e.stopPropagation()}
          className="w-full rounded border border-gray-300 px-1 text-lg font-medium outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
        />
      ) : (
        <span
          className="break-words text-left text-lg font-medium text-gray-900 dark:text-gray-100"
          onDoubleClick={(e) => {
            e.stopPropagation()
            setEditing(true)
          }}
        >
          {board.name}
        </span>
      )}
      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <span>
          {taskCount} task{taskCount === 1 ? '' : 's'}
        </span>
        <div className="flex items-center gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDuplicate()
            }}
            title="Duplicate board"
            aria-label={`Duplicate board ${board.name}`}
            className="text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-200"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDeleteRequest()
            }}
            title="Delete board"
            aria-label={`Delete board ${board.name}`}
            className="text-gray-400 hover:text-red-500 dark:text-gray-500"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 6h18" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
