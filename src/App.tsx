import { useEffect, useState } from 'react'
import { useStore } from './store/useStore'
import { TopNav } from './components/layout/TopNav'
import { BoardListView } from './components/boards/BoardListView'
import { BoardDetailView } from './components/board/BoardDetailView'
import { DashboardView } from './components/dashboard/DashboardView'
import { TaskDetailModal } from './components/task/TaskDetailModal'

type View = { kind: 'boards' } | { kind: 'board'; boardId: string } | { kind: 'dashboard' }

function App() {
  const [view, setView] = useState<View>({ kind: 'boards' })
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const loaded = useStore((s) => s.loaded)
  const loadFromDB = useStore((s) => s.loadFromDB)

  useEffect(() => {
    loadFromDB()
  }, [loadFromDB])

  if (!loaded) {
    return <div className="p-6 text-gray-500 dark:text-gray-400">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <TopNav
        activeTab={view.kind === 'dashboard' ? 'dashboard' : 'boards'}
        onNavigate={(tab) => setView({ kind: tab })}
      />
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
      {selectedTaskId && (
        <TaskDetailModal taskId={selectedTaskId} onClose={() => setSelectedTaskId(null)} />
      )}
    </div>
  )
}

export default App
