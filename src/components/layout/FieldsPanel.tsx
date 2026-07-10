import { useStore } from '../../store/useStore'

interface FieldsPanelProps {
  onClose: () => void
}

const HIDEABLE_FIELDS: { key: string; label: string }[] = [
  { key: 'assignedTo', label: 'Assigned to' },
  { key: 'dueDate', label: 'Due date (also hides Repeat and Add to calendar)' },
  { key: 'storyPoints', label: 'Story points' },
  { key: 'estimatedHours', label: 'Estimated hours' },
  { key: 'urgency', label: 'Urgency' },
  { key: 'importance', label: 'Importance' },
  { key: 'subtasks', label: 'Sub-tasks' },
  { key: 'description', label: 'Description' },
]

export function FieldsPanel({ onClose }: FieldsPanelProps) {
  const preferences = useStore((s) => s.preferences)
  const setPreference = useStore((s) => s.setPreference)
  const hiddenFields = preferences.hiddenFields

  function toggleField(key: string, visible: boolean) {
    setPreference('hiddenFields', visible ? hiddenFields.filter((k) => k !== key) : [...hiddenFields, key])
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-lg bg-white p-5 shadow-xl dark:bg-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-1 text-sm font-medium text-gray-900 dark:text-gray-100">Fields</h3>
        <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
          Choose which optional fields show up on tasks. Task name, Board, Category, and Status are always shown.
        </p>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
            <input
              type="checkbox"
              checked={preferences.timeTrackingEnabled}
              onChange={(e) => setPreference('timeTrackingEnabled', e.target.checked)}
            />
            Time tracking
          </label>
          {HIDEABLE_FIELDS.map((f) => (
            <label key={f.key} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
              <input
                type="checkbox"
                checked={!hiddenFields.includes(f.key)}
                onChange={(e) => toggleField(f.key, e.target.checked)}
              />
              {f.label}
            </label>
          ))}
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="rounded bg-gray-900 px-3 py-1.5 text-sm text-white hover:bg-gray-700 dark:bg-gray-100 dark:text-gray-900"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
