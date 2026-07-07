import { Fragment, useEffect, useRef } from 'react'

interface HotkeysPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const SHORTCUTS: { key: string; action: string }[] = [
  { key: 'Shift+T', action: 'New task (on a board)' },
  { key: 'Shift+K', action: 'New bucket (on a board)' },
  { key: 'Shift+B', action: 'New board' },
  { key: '[ / ]', action: 'Previous / next board' },
  { key: '1-9', action: 'Open that board (on the Boards list)' },
  { key: 'B', action: 'Go to Boards' },
  { key: 'D', action: 'Go to Dashboard' },
  { key: 'Ctrl/Cmd+Z', action: 'Undo last delete' },
  { key: '/', action: 'Focus task search' },
  { key: 'Esc', action: 'Close the open task' },
  { key: 'Enter', action: 'Save & unfocus a text field' },
  { key: 'Ctrl/Cmd+Enter', action: 'Save & unfocus the Description box' },
  { key: '?', action: 'Open this panel' },
]

export function HotkeysPanel({ open, onOpenChange }: HotkeysPanelProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onOpenChange(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open, onOpenChange])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => onOpenChange(!open)}
        aria-label="Hotkeys"
        className="rounded px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        Hotkeys
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-1 w-72 rounded border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">Hotkeys</h3>
          <div className="grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-1.5 text-sm">
            {SHORTCUTS.map((s) => (
              <Fragment key={s.key}>
                <span className="rounded bg-gray-100 px-1.5 py-0.5 text-center font-mono text-xs text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                  {s.key}
                </span>
                <span className="text-gray-600 dark:text-gray-300">{s.action}</span>
              </Fragment>
            ))}
          </div>
          <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">Inactive while typing in a text field.</p>
        </div>
      )}
    </div>
  )
}
