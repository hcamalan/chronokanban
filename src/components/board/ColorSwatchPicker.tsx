import { useEffect, useRef, useState } from 'react'
import { useStore } from '../../store/useStore'
import { CATEGORY_COLOR_PRESETS, remapCategoryColor } from '../../utils/colorPalette'

export const CATEGORY_COLORS = CATEGORY_COLOR_PRESETS.default

interface ColorSwatchPickerProps {
  value: string
  onChange: (color: string) => void
}

export function ColorSwatchPicker({ value, onChange }: ColorSwatchPickerProps) {
  const colorMode = useStore((s) => s.preferences.colorMode)
  const swatches = CATEGORY_COLOR_PRESETS[colorMode]
  const displayValue = remapCategoryColor(value, colorMode)
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
        style={{ backgroundColor: displayValue }}
      />
      {open && (
        <div className="absolute z-20 mt-1 grid w-40 grid-cols-6 gap-1 rounded border border-gray-200 bg-white p-1.5 shadow-lg dark:border-gray-700 dark:bg-gray-800">
          {swatches.map((color, i) => (
            <button
              key={color}
              type="button"
              onClick={() => {
                onChange(CATEGORY_COLOR_PRESETS.default[i])
                setOpen(false)
              }}
              aria-label={`Set color ${color}`}
              className="h-5 w-5 rounded-full"
              style={{ backgroundColor: color, outline: color === displayValue ? '2px solid currentColor' : undefined }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
