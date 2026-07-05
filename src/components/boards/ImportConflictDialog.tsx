import type { ConflictDecision } from '../../db/exportImport'

interface ImportConflictDialogProps {
  boardName: string
  onDecision: (decision: ConflictDecision) => void
}

export function ImportConflictDialog({ boardName, onDecision }: ImportConflictDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-5 shadow-xl dark:bg-gray-800">
        <p className="text-sm text-gray-700 dark:text-gray-200">
          A board named "{boardName}" already exists, and the imported file also has a board named "{boardName}".
          Overwrite the existing "{boardName}" with the imported one?
        </p>
        <div className="mt-4 flex flex-wrap justify-end gap-2">
          <button
            onClick={() => onDecision('skip')}
            className="rounded px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Skip
          </button>
          <button
            onClick={() => onDecision('keep-both')}
            className="rounded px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            No, keep both
          </button>
          <button
            onClick={() => onDecision('overwrite')}
            className="rounded bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700"
          >
            Yes, overwrite
          </button>
        </div>
      </div>
    </div>
  )
}
