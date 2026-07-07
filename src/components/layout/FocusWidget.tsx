import { useEffect, useState } from 'react'
import { useStore } from '../../store/useStore'
import { BREAK_DURATION_MS } from '../../store/focusSession'
import { sendNotification } from '../../utils/notifications'
import { formatDuration } from '../../utils/time'

export function FocusWidget() {
  const session = useStore((s) => s.focusSession)
  const task = useStore((s) => (session ? s.tasks[session.taskId] : undefined))
  const setFocusSession = useStore((s) => s.setFocusSession)
  const [, forceTick] = useState(0)

  useEffect(() => {
    if (!session) return
    const interval = setInterval(() => {
      forceTick((n) => n + 1)
      const current = useStore.getState().focusSession
      if (!current) return
      // Task deleted mid-session — nothing left to focus on.
      if (!useStore.getState().tasks[current.taskId]) {
        useStore.getState().setFocusSession(null)
        return
      }
      if (Date.now() < current.endsAt) return
      if (current.phase === 'focus') {
        useStore.getState().pauseTimer(current.taskId)
        sendNotification('Focus session complete', 'Nice work — take a 5-minute break.')
        useStore.getState().setFocusSession({ ...current, phase: 'break', endsAt: Date.now() + BREAK_DURATION_MS })
      } else {
        sendNotification("Break's over", 'Ready for another focus session?')
        useStore.getState().setFocusSession(null)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [session != null]) // oxlint-disable-line react-hooks/exhaustive-deps

  if (!session || !task) return null

  const remaining = Math.max(0, (session.endsAt - Date.now()) / 1000)
  const isFocus = session.phase === 'focus'

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-full border px-4 py-2 text-sm shadow-lg ${
        isFocus
          ? 'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-100'
          : 'border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950 dark:text-green-100'
      }`}
    >
      <span className="font-medium">{isFocus ? 'Focus' : 'Break'}</span>
      {isFocus && <span className="max-w-40 truncate">{task.name || 'Unnamed task'}</span>}
      <span className="font-mono font-semibold">{formatDuration(remaining)}</span>
      {/* Stop ends the ritual, not the work — the task timer keeps running (pause it on the card). */}
      <button onClick={() => setFocusSession(null)} aria-label="Stop focus session" className="underline hover:no-underline">
        Stop
      </button>
    </div>
  )
}
