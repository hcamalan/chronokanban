import { useEffect, useRef, useState } from 'react'
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
  activeTab: 'boards' | 'today' | 'dashboard' | 'howto'
  onNavigate: (tab: 'boards' | 'today' | 'dashboard' | 'howto') => void
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
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [menuOpen])

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

  const tabClass = (tab: 'boards' | 'today' | 'dashboard' | 'howto') =>
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
        <nav className="hidden items-center gap-1 md:flex">
          <button onClick={() => onNavigate('boards')} className={tabClass('boards')}>
            Boards
          </button>
          <button onClick={() => onNavigate('dashboard')} className={tabClass('dashboard')}>
            Dashboard
          </button>
          <button onClick={() => onNavigate('today')} className={tabClass('today')}>
            Today
          </button>
          <button onClick={() => onNavigate('howto')} className={tabClass('howto')}>
            How to
          </button>
        </nav>
      </div>
      <div className="flex items-center gap-2">
        {/* Desktop action cluster */}
        <div className="hidden items-center gap-2 md:flex">
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
          <HotkeysPanel open={hotkeysOpen} onOpenChange={onHotkeysOpenChange} />
        </div>

        {/* Settings stays visible at every width */}
        <SettingsPanel onDataDeleted={() => onNavigate('boards')} />

        {/* Mobile hamburger */}
        <div ref={menuRef} className="relative md:hidden">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Menu"
            aria-expanded={menuOpen}
            className="rounded px-3 py-1.5 text-lg text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            ☰
          </button>
          {menuOpen && (
            <div className="absolute right-0 z-30 mt-1 flex w-56 flex-col rounded border border-gray-200 bg-white p-1 shadow-lg dark:border-gray-700 dark:bg-gray-800">
              {(['boards', 'dashboard', 'today', 'howto'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    onNavigate(tab)
                    setMenuOpen(false)
                  }}
                  className={`rounded px-3 py-2 text-left text-sm font-medium ${
                    activeTab === tab
                      ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {tab === 'boards' ? 'Boards' : tab === 'dashboard' ? 'Dashboard' : tab === 'today' ? 'Today' : 'How to'}
                </button>
              ))}
              <div className="my-1 border-t border-gray-200 dark:border-gray-700" />
              <a
                href="https://paypal.me/HuseyinCamalan"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMenuOpen(false)}
                className="rounded px-3 py-2 text-left text-sm text-pink-700 hover:bg-pink-50 dark:text-pink-300 dark:hover:bg-pink-950"
              >
                ♥ Donate
              </a>
              <a
                href="mailto:chronokanban@pm.me?subject=ChronoKanban feedback"
                onClick={() => setMenuOpen(false)}
                className="rounded px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                Send feedback
              </a>
              <button
                onClick={() => {
                  exportData()
                  setMenuOpen(false)
                }}
                className="rounded px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                Export
              </button>
              <button
                onClick={() => {
                  fileInputRef.current?.click()
                  setMenuOpen(false)
                }}
                className="rounded px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                Import
              </button>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          onChange={handleFileSelected}
          className="hidden"
        />
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
