import { useShallow } from 'zustand/react/shallow'
import { useStore } from '../../store/useStore'

interface BoardFilterSelectProps {
  value: string
  onChange: (value: string) => void
}

export function BoardFilterSelect({ value, onChange }: BoardFilterSelectProps) {
  const boards = useStore(useShallow((s) => Object.values(s.boards).sort((a, b) => a.order - b.order)))

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
    >
      <option value="all">All boards</option>
      {boards.map((b) => (
        <option key={b.id} value={b.id}>
          {b.name}
        </option>
      ))}
    </select>
  )
}
