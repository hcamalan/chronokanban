import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import type { TaskCard, Category } from '../../types'

interface CategoryPieProps {
  title: string
  tasks: TaskCard[]
  categories: Category[]
}

export function CategoryPie({ title, tasks, categories }: CategoryPieProps) {
  const data = categories
    .map((c) => ({
      name: c.name,
      value: tasks.filter((t) => t.categoryId === c.id).length,
      color: c.color,
    }))
    .filter((d) => d.value > 0)

  const uncategorizedCount = tasks.filter((t) => !t.categoryId).length
  if (uncategorizedCount > 0) {
    data.push({ name: 'Uncategorized', value: uncategorizedCount, color: '#9ca3af' })
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
      <h3 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
      {data.length === 0 ? (
        <p className="text-sm text-gray-400">No tasks</p>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            {/* isAnimationActive disabled: Recharts 3.9.2's entrance animation fails to resolve to a
                rendered state for Pie, leaving sectors empty. Cell (not `shape`) is what feeds the
                Legend its per-slice colors, so it's kept despite being soft-deprecated pre-v4. */}
            <Pie data={data} dataKey="value" nameKey="name" outerRadius={80} label isAnimationActive={false}>
              {data.map((d) => (
                <Cell key={d.name} fill={d.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
