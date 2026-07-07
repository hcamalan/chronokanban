import { useStore } from '../../store/useStore'

export function UndoToast() {
  const label = useStore((s) => s.pendingDeletion?.label)
  const undoDelete = useStore((s) => s.undoDelete)

  if (!label) return null

  return (
    <div className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-lg bg-gray-900 px-4 py-2.5 text-sm text-white shadow-lg dark:bg-gray-100 dark:text-gray-900">
      <span>{label}</span>
      <button
        onClick={undoDelete}
        className="font-medium text-blue-400 hover:text-blue-300 dark:text-blue-700 dark:hover:text-blue-800"
      >
        Undo
      </button>
    </div>
  )
}
