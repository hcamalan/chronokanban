import { useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useStore } from '../../store/useStore'
import { CATEGORY_COLORS, ColorSwatchPicker } from './ColorSwatchPicker'
import { blurOnEnter } from '../../utils/keyboard'

interface CategoryManagerProps {
  boardId: string
}

export function CategoryManager({ boardId }: CategoryManagerProps) {
  const categories = useStore(
    useShallow((s) => Object.values(s.categories).filter((c) => c.boardId === boardId)),
  )
  const addCategory = useStore((s) => s.addCategory)
  const updateCategory = useStore((s) => s.updateCategory)
  const deleteCategory = useStore((s) => s.deleteCategory)
  const [newName, setNewName] = useState('')

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-gray-200 pt-3 dark:border-gray-700">
      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Categories</span>
      {categories.map((c) => (
        <div
          key={c.id}
          className="flex items-center gap-1 rounded-full border border-gray-200 px-2 py-1 dark:border-gray-700"
        >
          <ColorSwatchPicker value={c.color} onChange={(color) => updateCategory(c.id, { color })} />
          <input
            value={c.name}
            onChange={(e) => updateCategory(c.id, { name: e.target.value })}
            onKeyDown={blurOnEnter}
            className="w-24 bg-transparent text-sm outline-none dark:text-gray-100"
          />
          <button
            onClick={() => deleteCategory(c.id)}
            className="text-xs text-gray-400 hover:text-red-500"
            aria-label={`Delete category ${c.name}`}
          >
            ×
          </button>
        </div>
      ))}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (!newName.trim()) return
          addCategory(boardId, newName.trim(), CATEGORY_COLORS[0])
          setNewName('')
        }}
        className="flex gap-2"
      >
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New category"
          className="rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
        />
        <button
          type="submit"
          className="rounded bg-gray-900 px-3 py-1 text-sm text-white hover:bg-gray-700 dark:bg-gray-100 dark:text-gray-900"
        >
          Add
        </button>
      </form>
    </div>
  )
}
