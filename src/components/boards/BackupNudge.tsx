import { useState } from 'react'
import { useStore } from '../../store/useStore'
import { getLastExportAt, getSnoozeUntil, snoozeBackupNudge } from '../../store/backupStorage'

const NUDGE_AFTER_DAYS = 14
const SNOOZE_DAYS = 3

export function BackupNudge() {
  const hasBoards = useStore((s) => Object.keys(s.boards).length > 0)
  const exportData = useStore((s) => s.exportData)
  // Read once per mount; exporting or snoozing bumps this state to hide the banner immediately.
  const [dismissed, setDismissed] = useState(false)

  if (!hasBoards || dismissed) return null

  const snoozeUntil = getSnoozeUntil()
  if (snoozeUntil != null && snoozeUntil > Date.now()) return null

  const lastExportAt = getLastExportAt()
  const daysSince = lastExportAt != null ? (Date.now() - lastExportAt) / (24 * 60 * 60 * 1000) : null
  if (daysSince != null && daysSince <= NUDGE_AFTER_DAYS) return null

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100">
      <span>
        Your data lives only in this browser — last backup:{' '}
        <strong>{daysSince != null ? `${Math.floor(daysSince)} days ago` : 'never'}</strong>.
      </span>
      <span className="flex items-center gap-3">
        <button
          onClick={async () => {
            await exportData()
            setDismissed(true)
          }}
          className="font-medium underline hover:no-underline"
        >
          Export now
        </button>
        <button
          onClick={() => {
            snoozeBackupNudge(SNOOZE_DAYS)
            setDismissed(true)
          }}
          className="underline hover:no-underline"
        >
          Remind me later
        </button>
      </span>
    </div>
  )
}
