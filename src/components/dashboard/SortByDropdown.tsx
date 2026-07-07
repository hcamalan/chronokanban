import { useEffect, useRef, useState } from 'react'

export type SortDirection = 'asc' | 'desc'

interface SortOption<T extends string> {
  value: T
  label: string
}

interface SortByDropdownProps<T extends string> {
  label: string
  options: SortOption<T>[]
  field: T
  direction: SortDirection
  /** A different option was clicked; the caller decides that field's starting direction. */
  onSelect: (value: T) => void
  /** The already-active option was clicked again; flip its direction. */
  onToggleDirection: () => void
}

export function SortByDropdown<T extends string>({
  label,
  options,
  field,
  direction,
  onSelect,
  onToggleDirection,
}: SortByDropdownProps<T>) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  const activeLabel = options.find((o) => o.value === field)?.label ?? ''
  const arrow = direction === 'asc' ? '↑' : '↓'

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 rounded border border-gray-300 px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
      >
        <span className="font-medium">{label}:</span>
        <span>{activeLabel}</span>
        <span className="text-gray-400">{arrow}</span>
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-1 min-w-[10rem] rounded border border-gray-200 bg-white p-1 shadow-lg dark:border-gray-700 dark:bg-gray-800">
          {options.map((o) => (
            <button
              key={o.value}
              onClick={() => {
                if (o.value === field) onToggleDirection()
                else onSelect(o.value)
                setOpen(false)
              }}
              className="flex w-full items-center justify-between gap-2 rounded px-2 py-1 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              <span>{o.label}</span>
              {o.value === field && <span className="text-gray-400">{arrow}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
