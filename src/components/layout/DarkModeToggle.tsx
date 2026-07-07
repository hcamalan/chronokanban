import { useStore } from '../../store/useStore'
import { ToggleSwitch } from './ToggleSwitch'

export function DarkModeToggle() {
  const darkMode = useStore((s) => s.preferences.darkMode)
  const setPreference = useStore((s) => s.setPreference)

  return (
    <div className="flex items-center justify-between gap-3 px-1 py-1">
      <span className="text-sm text-gray-700 dark:text-gray-200">Dark mode</span>
      <ToggleSwitch
        checked={darkMode}
        onChange={(checked) => setPreference('darkMode', checked)}
        label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      />
    </div>
  )
}
