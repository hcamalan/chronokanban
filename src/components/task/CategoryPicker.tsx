import { useShallow } from 'zustand/react/shallow'
import { useStore } from '../../store/useStore'

interface CategoryPickerProps {
  boardId: string
  value: string | null
  onChange: (categoryId: string | null) => void
}

export function CategoryPicker({ boardId, value, onChange }: CategoryPickerProps) {
  const categories = useStore(
    useShallow((s) => Object.values(s.categories).filter((c) => c.boardId === boardId)),
  )

  return (
    <select
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value || null)}
      className="rounded border border-gray-300 px-2 py-1 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
    >
      <option value="">No category</option>
      {categories.map((c) => (
        <option key={c.id} value={c.id}>
          {c.name}
        </option>
      ))}
    </select>
  )
}
