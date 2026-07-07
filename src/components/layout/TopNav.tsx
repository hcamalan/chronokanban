import { useRef, useState } from 'react'
import { useStore } from '../../store/useStore'
import { ImportConflictDialog } from '../boards/ImportConflictDialog'
import { SettingsPanel } from './SettingsPanel'
import { HotkeysPanel } from './HotkeysPanel'
import { DonatePanel } from './DonatePanel'
import {
  parseImportFile,
  findBoardConflicts,
  mergeImportFile,
  type BoardConflict,
  type ConflictDecision,
} from '../../db/exportImport'

interface TopNavProps {
  activeTab: 'boards' | 'dashboard' | 'howto'
  onNavigate: (tab: 'boards' | 'dashboard' | 'howto') => void
  hotkeysOpen: boolean
  onHotkeysOpenChange: (open: boolean) => void
}

interface ImportFlow {
  data: Awaited<ReturnType<typeof parseImportFile>>
  conflicts: BoardConflict[]
  currentIndex: number
  decisions: Record<string, ConflictDecision>
}

export function TopNav({ activeTab, onNavigate, hotkeysOpen, onHotkeysOpenChange }: TopNavProps) {
  const exportData = useStore((s) => s.exportData)
  const loadFromDB = useStore((s) => s.loadFromDB)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importFlow, setImportFlow] = useState<ImportFlow | null>(null)

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    let data
    try {
      data = await parseImportFile(file)
    } catch {
      window.alert('This file could not be read as a ChronoKanban export.')
      return
    }

    const existingBoards = Object.values(useStore.getState().boards)
    const conflicts = findBoardConflicts(data, existingBoards)

    if (conflicts.length === 0) {
      await mergeImportFile(data, [], {})
      await loadFromDB()
      return
    }
    setImportFlow({ data, conflicts, currentIndex: 0, decisions: {} })
  }

  async function handleConflictDecision(decision: ConflictDecision) {
    if (!importFlow) return
    const conflict = importFlow.conflicts[importFlow.currentIndex]
    const decisions = { ...importFlow.decisions, [conflict.incoming.id]: decision }
    const nextIndex = importFlow.currentIndex + 1

    if (nextIndex >= importFlow.conflicts.length) {
      await mergeImportFile(importFlow.data, importFlow.conflicts, decisions)
      await loadFromDB()
      setImportFlow(null)
    } else {
      setImportFlow({ ...importFlow, decisions, currentIndex: nextIndex })
    }
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
        <button
          onClick={() => onNavigate('boards')}
          className="flex items-center gap-2 rounded hover:opacity-80"
          aria-label="Go to boards"
        >
          <img src="./logo.svg" alt="" className="h-7 w-7" />
          <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">ChronoKanban</span>
        </button>
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
        <DonatePanel />
        <a
          href="mailto:chronokanban@pm.me?subject=ChronoKanban feedback"
          className="rounded px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          Send feedback
        </a>
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
        <HotkeysPanel open={hotkeysOpen} onOpenChange={onHotkeysOpenChange} />
        <SettingsPanel onDataDeleted={() => onNavigate('boards')} />
      </div>

      {importFlow && (
        <ImportConflictDialog
          boardName={importFlow.conflicts[importFlow.currentIndex].incoming.name}
          onDecision={handleConflictDecision}
        />
      )}
    </header>
  )
}
