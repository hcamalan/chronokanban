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
    <div className="group relative flex h-28 flex-col justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
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
          className="w-full rounded border border-gray-300 px-1 text-lg font-medium outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
        />
      ) : (
        <button
          className="text-left text-lg font-medium text-gray-900 hover:underline dark:text-gray-100"
          onClick={onOpen}
          onDoubleClick={() => setEditing(true)}
        >
          {board.name}
        </button>
      )}
      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <span>
          {taskCount} task{taskCount === 1 ? '' : 's'}
        </span>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100">
          <button onClick={onDuplicate} className="hover:text-gray-700 dark:hover:text-gray-200" aria-label={`Duplicate board ${board.name}`}>
            Duplicate
          </button>
          <button onClick={onDeleteRequest} className="hover:text-red-500" aria-label={`Delete board ${board.name}`}>
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
