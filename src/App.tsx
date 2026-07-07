import { useEffect, useState } from 'react'
import { useStore } from './store/useStore'
import { TopNav } from './components/layout/TopNav'
import { HowToView } from './components/layout/HowToView'
import { AboutView } from './components/layout/AboutView'
import { Footer } from './components/layout/Footer'
import { UndoToast } from './components/layout/UndoToast'
import { BoardListView } from './components/boards/BoardListView'
import { BoardDetailView } from './components/board/BoardDetailView'
import { DashboardView } from './components/dashboard/DashboardView'
import { TaskDetailModal } from './components/task/TaskDetailModal'

type View =
  | { kind: 'boards' }
  | { kind: 'board'; boardId: string }
  | { kind: 'dashboard' }
  | { kind: 'howto' }
  | { kind: 'about' }

function App() {
  const [view, setView] = useState<View>({ kind: 'boards' })
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const loaded = useStore((s) => s.loaded)
  const loadFromDB = useStore((s) => s.loadFromDB)
  const darkMode = useStore((s) => s.preferences.darkMode)

  useEffect(() => {
    loadFromDB()
  }, [loadFromDB])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const tag = (document.activeElement as HTMLElement | null)?.tagName
      const isTyping = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'

      if (e.key === 'Escape') {
        setSelectedTaskId(null)
        return
      }
      if (isTyping) return
      if (e.key === '/') {
        const search = document.getElementById('task-search-input')
        if (search) {
          e.preventDefault()
          search.focus()
        }
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  if (!loaded) {
    return <div className="p-6 text-gray-500 dark:text-gray-400">Loading...</div>
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-950">
      <TopNav
        activeTab={view.kind === 'board' ? 'boards' : view.kind}
        onNavigate={(tab) => setView({ kind: tab })}
      />
      <div className="flex-1">
        {view.kind === 'boards' && (
          <BoardListView onOpenBoard={(boardId) => setView({ kind: 'board', boardId })} />
        )}
        {view.kind === 'board' && (
          <BoardDetailView
            boardId={view.boardId}
            onBack={() => setView({ kind: 'boards' })}
            onOpenTask={(taskId) => setSelectedTaskId(taskId)}
          />
        )}
        {view.kind === 'dashboard' && (
          <DashboardView onOpenTask={(taskId) => setSelectedTaskId(taskId)} />
        )}
        {view.kind === 'howto' && <HowToView />}
        {view.kind === 'about' && <AboutView />}
      </div>
      <Footer />
      {selectedTaskId && (
        <TaskDetailModal taskId={selectedTaskId} onClose={() => setSelectedTaskId(null)} />
      )}
      <UndoToast />
    </div>
  )
}

export default App
