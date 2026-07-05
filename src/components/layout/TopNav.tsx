import { useRef, useState } from 'react'
import { useStore } from '../../store/useStore'
import { ConfirmDialog } from '../boards/ConfirmDialog'
import { DarkModeToggle } from './DarkModeToggle'

interface TopNavProps {
  activeTab: 'boards' | 'dashboard' | 'howto'
  onNavigate: (tab: 'boards' | 'dashboard' | 'howto') => void
}

export function TopNav({ activeTab, onNavigate }: TopNavProps) {
  const exportData = useStore((s) => s.exportData)
  const importData = useStore((s) => s.importData)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [pendingFile, setPendingFile] = useState<File | null>(null)

  function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) setPendingFile(file)
    e.target.value = ''
  }

  const tabClass = (tab: 'boards' | 'dashboard' | 'howto') =>
    `rounded px-3 py-1.5 text-sm font-medium ${
      activeTab === tab
        ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
        : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
    }`

  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3 dark:border-gray-700 dark:bg-gray-900">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <img src="./logo.svg" alt="" className="h-7 w-7" />
          <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">ChronoKanban</span>
        </div>
        <nav className="flex items-center gap-1">
          <button onClick={() => onNavigate('boards')} className={tabClass('boards')}>
            Boards
          </button>
          <button onClick={() => onNavigate('dashboard')} className={tabClass('dashboard')}>
            Dashboard
          </button>
          <button onClick={() => onNavigate('howto')} className={tabClass('howto')}>
            How to
          </button>
        </nav>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => exportData()}
          className="rounded px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          Export
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="rounded px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          Import
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          onChange={handleFileSelected}
          className="hidden"
        />
        <DarkModeToggle />
      </div>

      {pendingFile && (
        <ConfirmDialog
          message={`Importing "${pendingFile.name}" will permanently replace all current boards, buckets, tasks, categories, and attachments with the contents of this file. This cannot be undone.`}
          confirmLabel="Import"
          onCancel={() => setPendingFile(null)}
          onConfirm={() => {
            const file = pendingFile
            setPendingFile(null)
            importData(file)
          }}
        />
      )}
    </header>
  )
}
