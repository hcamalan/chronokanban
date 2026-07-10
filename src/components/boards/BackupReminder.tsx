import { useState } from 'react'
import { useStore } from '../../store/useStore'
import { getLastExportAt, isBackupReminderDismissed, dismissBackupReminder } from '../../store/backupStorage'

/**
 * A one-time, from-the-start reminder that data lives only in this browser and should be backed up.
 * Shown to users who have never exported; disappears for good once they export once or dismiss it.
 * The recurring "last backup was N days ago" nudge (BackupNudge) takes over after the first export.
 */
export function BackupReminder() {
  const hasBoards = useStore((s) => Object.keys(s.boards).length > 0)
  const exportData = useStore((s) => s.exportData)
  const [dismissed, setDismissed] = useState(() => isBackupReminderDismissed() || getLastExportAt() != null)

  if (!hasBoards || dismissed) return null

  function close() {
    dismissBackupReminder()
    setDismissed(true)
  }

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100">
      <span>
        Heads up: ChronoKanban keeps your data only in this browser. Browser settings like Chrome's "Clear
        cookies and site data when you close all windows" can wipe it without warning — export a backup now and
        then (the <strong>Export</strong> button is up in the top bar), or install the app for more durable
        storage.
      </span>
      <span className="flex items-center gap-3">
        <button
          onClick={async () => {
            await exportData()
            close()
          }}
          className="font-medium underline hover:no-underline"
        >
          Export now
        </button>
        <button onClick={close} className="underline hover:no-underline">
          Got it
        </button>
      </span>
    </div>
  )
}
