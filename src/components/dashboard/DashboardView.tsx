import { useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useStore } from '../../store/useStore'
import { BoardFilterSelect } from './BoardFilterSelect'
import { ConfigurableChart } from './ConfigurableChart'
import { LateTasksList } from './LateTasksList'
import { EffectivenessTiles } from './EffectivenessTiles'

interface DashboardViewProps {
  onOpenTask: (taskId: string) => void
}

export function DashboardView({ onOpenTask }: DashboardViewProps) {
  const [scope, setScope] = useState<string>('all')
  const tasks = useStore(useShallow((s) => Object.values(s.tasks)))
  const categories = useStore(useShallow((s) => Object.values(s.categories)))
  const downloadActivityLog = useStore((s) => s.downloadActivityLog)

  const scopedTasks = tasks.filter((t) => scope === 'all' || t.boardId === scope)
  const boardCategories = categories.filter((c) => c.boardId === scope)

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Dashboard</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => downloadActivityLog()}
            className="rounded px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Download report
          </button>
          <BoardFilterSelect value={scope} onChange={setScope} />
        </div>
      </div>

      <div className="mb-6">
        <EffectivenessTiles tasks={scopedTasks} />
      </div>

      <div className="mb-6">
        <ConfigurableChart tasks={scopedTasks} categories={boardCategories} categoryEnabled={scope !== 'all'} />
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
        <h3 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">Late tasks</h3>
        <LateTasksList tasks={scopedTasks} onOpenTask={onOpenTask} />
      </div>
    </div>
  )
}
