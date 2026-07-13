import { useState } from 'react'
import { useGoogleDriveSyncStore } from '../../store/useGoogleDriveSyncStore'

export function GoogleDriveSyncBanner() {
  const newerVersionAvailable = useGoogleDriveSyncStore((s) => s.newerVersionAvailable)
  const pullLatest = useGoogleDriveSyncStore((s) => s.pullLatest)
  const [dismissed, setDismissed] = useState(false)

  if (!newerVersionAvailable || dismissed) return null

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100">
      <span>
        A newer version was saved to Google Drive from elsewhere. It wasn't pulled in automatically since you have
        unsynced local changes.
      </span>
      <span className="flex items-center gap-3">
        <button onClick={() => void pullLatest()} className="font-medium underline hover:no-underline">
          Pull latest version
        </button>
        <button onClick={() => setDismissed(true)} className="underline hover:no-underline">
          Dismiss
        </button>
      </span>
    </div>
  )
}
