import type { Preferences } from '../types'

const STORAGE_KEY = 'chrono-kanban-preferences'

function defaultDarkMode(): boolean {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
}

function defaultPreferences(): Preferences {
  return {
    darkMode: defaultDarkMode(),
    bucketWidth: 'default',
    dateFormat: 'DD/MM',
    colorMode: 'default',
    showDescriptionOnCard: false,
    notificationsEnabled: false,
  }
}

export function loadPreferences(): Preferences {
  const defaults = defaultPreferences()
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return defaults
  try {
    return { ...defaults, ...JSON.parse(raw) }
  } catch {
    return defaults
  }
}

export function savePreferences(preferences: Preferences): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences))
}
