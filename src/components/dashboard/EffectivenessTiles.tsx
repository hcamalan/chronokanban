import type { TaskCard } from '../../types'

interface EffectivenessTilesProps {
  tasks: TaskCard[]
}

export function EffectivenessTiles({ tasks }: EffectivenessTilesProps) {
  const completed = tasks.filter((t) => t.status === 'completed')
  const completedWithDueDate = completed.filter((t) => t.dueDate)
  const onTime = completedWithDueDate.filter(
    (t) => t.completedAt != null && new Date(`${t.dueDate}T23:59:59`).getTime() >= t.completedAt,
  )
  const onTimeRate = completedWithDueDate.length > 0 ? (onTime.length / completedWithDueDate.length) * 100 : null

  const totalStoryPoints = completed.reduce((sum, t) => sum + (t.storyPoints ?? 0), 0)
  const totalHours = completed.reduce((sum, t) => sum + t.timer.elapsedSeconds / 3600, 0)
  const pointsPerHour = totalHours > 0 ? totalStoryPoints / totalHours : null

  const withEstimates = completed.filter(
    (t) => t.estimatedHours != null && t.estimatedHours > 0 && t.timer.elapsedSeconds > 0,
  )
  const estimateRatio =
    withEstimates.length > 0
      ? (withEstimates.reduce((sum, t) => sum + t.timer.elapsedSeconds / 3600 / (t.estimatedHours as number), 0) /
          withEstimates.length) *
        100
      : null

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
        <div className="text-xs text-gray-500 dark:text-gray-400">On-time completion rate</div>
        <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          {onTimeRate != null ? `${onTimeRate.toFixed(0)}%` : '—'}
        </div>
        <div className="text-xs text-gray-400">
          {completedWithDueDate.length} completed task{completedWithDueDate.length === 1 ? '' : 's'} with a due date
        </div>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
        <div className="text-xs text-gray-500 dark:text-gray-400">Story points per hour tracked</div>
        <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          {pointsPerHour != null ? pointsPerHour.toFixed(2) : '—'}
        </div>
        <div className="text-xs text-gray-400">
          {totalStoryPoints} point{totalStoryPoints === 1 ? '' : 's'} over {totalHours.toFixed(1)}h
        </div>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
        <div className="text-xs text-gray-500 dark:text-gray-400">Actual vs estimate</div>
        <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          {estimateRatio != null ? `${estimateRatio.toFixed(0)}%` : '—'}
        </div>
        <div className="text-xs text-gray-400">
          {withEstimates.length} completed task{withEstimates.length === 1 ? '' : 's'} with estimates
        </div>
      </div>
    </div>
  )
}
