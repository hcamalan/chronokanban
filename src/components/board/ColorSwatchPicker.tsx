import { useEffect, useRef, useState } from 'react'

export const CATEGORY_COLORS = [
  '#9ca3af',
  '#ef4444',
  '#f97316',
  '#f59e0b',
  '#84cc16',
  '#22c55e',
  '#14b8a6',
  '#06b6d4',
  '#3b82f6',
  '#6366f1',
  '#a855f7',
  '#ec4899',
]

interface ColorSwatchPickerProps {
  value: string
  onChange: (color: string) => void
}

export function ColorSwatchPicker({ value, onChange }: ColorSwatchPickerProps) {
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

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Choose category color"
        className="h-4 w-4 flex-shrink-0 cursor-pointer rounded-full"
        style={{ backgroundColor: value }}
      />
      {open && (
        <div className="absolute z-20 mt-1 grid w-40 grid-cols-6 gap-1 rounded border border-gray-200 bg-white p-1.5 shadow-lg dark:border-gray-700 dark:bg-gray-800">
          {CATEGORY_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => {
                onChange(color)
                setOpen(false)
              }}
              aria-label={`Set color ${color}`}
              className="h-5 w-5 rounded-full"
              style={{ backgroundColor: color, outline: color === value ? '2px solid currentColor' : undefined }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
