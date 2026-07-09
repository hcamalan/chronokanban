import { useState } from 'react'
import { useStore } from '../../store/useStore'
import { getLastExportAt, getSnoozeUntil, snoozeBackupNudge, SNOOZE_DAYS } from '../../store/backupStorage'

const NUDGE_AFTER_DAYS = 7

export function BackupNudge() {
  const hasBoards = useStore((s) => Object.keys(s.boards).length > 0)
  const exportData = useStore((s) => s.exportData)
  // Read once per mount; exporting or snoozing bumps this state to hide the banner immediately.
  const [dismissed, setDismissed] = useState(false)

  if (!hasBoards || dismissed) return null

  const snoozeUntil = getSnoozeUntil()
  if (snoozeUntil != null && snoozeUntil > Date.now()) return null

  // Never-exported users are handled by the one-time BackupReminder; this recurring nudge only
  // fires once someone has exported at least once and then let it go stale.
  const lastExportAt = getLastExportAt()
  if (lastExportAt == null) return null
  const daysSince = (Date.now() - lastExportAt) / (24 * 60 * 60 * 1000)
  if (daysSince <= NUDGE_AFTER_DAYS) return null

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100">
      <span>
        Your data lives only in this browser — last backup:{' '}
        <strong>{Math.floor(daysSince)} days ago</strong>.
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
