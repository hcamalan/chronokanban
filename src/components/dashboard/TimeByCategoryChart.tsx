import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import type { TaskCard, Category } from '../../types'

interface TimeByCategoryChartProps {
  tasks: TaskCard[]
  categories: Category[]
}

export function TimeByCategoryChart({ tasks, categories }: TimeByCategoryChartProps) {
  const data = categories
    .map((c) => ({
      name: c.name,
      hours: Number(
        (
          tasks.filter((t) => t.categoryId === c.id).reduce((sum, t) => sum + t.timer.elapsedSeconds, 0) / 3600
        ).toFixed(2),
      ),
    }))
    // Recharts (3.9.2) fails to render any bars at all when a data point's value is exactly 0,
    // so categories with no tracked time yet are dropped rather than showing a broken chart.
    .filter((d) => d.hours > 0)

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
      <h3 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">Time spent by category (hours)</h3>
      {data.length === 0 ? (
        <p className="text-sm text-gray-400">No tracked time yet</p>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data}>
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="hours" fill="#6366f1" isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
