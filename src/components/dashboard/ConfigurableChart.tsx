import { useEffect, useMemo, useState } from 'react'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { MultiSelectDropdown } from './MultiSelectDropdown'
import {
  buildChartData,
  GROUP_BY_OPTIONS,
  UNIT_OPTIONS,
  STATUS_OPTIONS,
  LEVEL_FILTER_OPTIONS,
  LATE_OPTIONS,
  UNIT_TOOLTIP_LABEL,
  UNCATEGORIZED,
  type ChartConfig,
  type GroupByDim,
  type Unit,
} from './chartData'
import type { TaskCard, Category, TaskStatus } from '../../types'

interface ConfigurableChartProps {
  tasks: TaskCard[]
  categories: Category[]
  categoryEnabled: boolean
}

const selectClass =
  'rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100'

export function ConfigurableChart({ tasks, categories, categoryEnabled }: ConfigurableChartProps) {
  const [chartType, setChartType] = useState<'bar' | 'pie'>('bar')
  const [config, setConfig] = useState<ChartConfig>({
    groupBy: 'status',
    unit: 'count',
    statuses: [],
    categoryIds: [],
    importances: [],
    urgencies: [],
    lateness: [],
  })

  // Category is per-board: when viewing All boards, fall back off category grouping.
  useEffect(() => {
    if (!categoryEnabled && config.groupBy === 'category') {
      setConfig((c) => ({ ...c, groupBy: 'status' }))
    }
  }, [categoryEnabled, config.groupBy])

  const groupByOptions = categoryEnabled ? GROUP_BY_OPTIONS : GROUP_BY_OPTIONS.filter((o) => o.value !== 'category')
  const categoryFilterOptions = [
    ...categories.map((c) => ({ value: c.id, label: c.name })),
    { value: UNCATEGORIZED, label: 'Uncategorized' },
  ]

  const data = useMemo(
    () => buildChartData(tasks, categories, { ...config, categoryIds: categoryEnabled ? config.categoryIds : [] }),
    [tasks, categories, config, categoryEnabled],
  )

  const unitLabel = UNIT_TOOLTIP_LABEL[config.unit]
  const groupByLabel = GROUP_BY_OPTIONS.find((o) => o.value === config.groupBy)?.label ?? ''

  const update = <K extends keyof ChartConfig>(key: K, value: ChartConfig[K]) =>
    setConfig((c) => ({ ...c, [key]: value }))

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
          Measure
          <select
            value={config.unit}
            onChange={(e) => update('unit', e.target.value as Unit)}
            className={selectClass}
          >
            {UNIT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
          Group by
          <select
            value={config.groupBy}
            onChange={(e) => update('groupBy', e.target.value as GroupByDim)}
            className={selectClass}
          >
            {groupByOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>

        <MultiSelectDropdown
          label="Status"
          options={STATUS_OPTIONS}
          selected={config.statuses}
          onChange={(v) => update('statuses', v as TaskStatus[])}
        />
        {categoryEnabled && (
          <MultiSelectDropdown
            label="Category"
            options={categoryFilterOptions}
            selected={config.categoryIds}
            onChange={(v) => update('categoryIds', v)}
          />
        )}
        <MultiSelectDropdown
          label="Importance"
          options={LEVEL_FILTER_OPTIONS}
          selected={config.importances}
          onChange={(v) => update('importances', v as ChartConfig['importances'])}
        />
        <MultiSelectDropdown
          label="Urgency"
          options={LEVEL_FILTER_OPTIONS}
          selected={config.urgencies}
          onChange={(v) => update('urgencies', v as ChartConfig['urgencies'])}
        />
        <MultiSelectDropdown
          label="Late"
          options={LATE_OPTIONS}
          selected={config.lateness}
          onChange={(v) => update('lateness', v as ('late' | 'not-late')[])}
        />

        <div className="ml-auto flex overflow-hidden rounded border border-gray-300 dark:border-gray-600">
          {(['bar', 'pie'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setChartType(type)}
              className={`px-3 py-1 text-sm capitalize ${
                chartType === type
                  ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <h3 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
        {unitLabel} by {groupByLabel}
      </h3>

      {data.length === 0 ? (
        <p className="py-12 text-center text-sm text-gray-400">No data for this selection</p>
      ) : chartType === 'bar' ? (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} allowDecimals={config.unit !== 'count'} />
            <Tooltip formatter={(value) => [value, unitLabel]} />
            <Bar dataKey="value" isAnimationActive={false}>
              {data.map((d) => (
                <Cell key={d.key} fill={d.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="label" outerRadius={100} label isAnimationActive={false}>
              {data.map((d) => (
                <Cell key={d.key} fill={d.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [value, unitLabel]} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
