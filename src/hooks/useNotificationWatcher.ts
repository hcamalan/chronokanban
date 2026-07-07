import { useEffect, useRef } from 'react'
import { useStore } from '../store/useStore'
import { sendNotification } from '../utils/notifications'
import { isTimerLongRunning, isLate } from '../utils/time'
import { todayDateKey } from '../utils/calendarRange'

const DUE_NOTIFIED_KEY = 'chrono-kanban-due-notified'

/**
 * While notifications are enabled: warns about timers running past the long-running threshold
 * (once per task-run) and posts a once-a-day summary of tasks due today / overdue.
 * No server means this only fires while the app is open in a tab.
 */
export function useNotificationWatcher() {
  const enabled = useStore((s) => s.preferences.notificationsEnabled)
  const loaded = useStore((s) => s.loaded)
  // Task-runs already notified about, keyed `taskId:startedAt` so a re-started timer re-arms.
  const notifiedRuns = useRef(new Set<string>())

  useEffect(() => {
    if (!enabled || !loaded) return

    function checkLongRunning() {
      for (const t of Object.values(useStore.getState().tasks)) {
        if (!isTimerLongRunning(t.timer) || t.timer.startedAt == null) continue
        const key = `${t.id}:${t.timer.startedAt}`
        if (notifiedRuns.current.has(key)) continue
        notifiedRuns.current.add(key)
        sendNotification(
          'Timer still running',
          `"${t.name || 'Unnamed task'}" has been running for over 8 hours — did you forget to pause it?`,
        )
      }
    }

    function checkDueToday() {
      const today = todayDateKey()
      if (localStorage.getItem(DUE_NOTIFIED_KEY) === today) return
      const tasks = Object.values(useStore.getState().tasks).filter((t) => t.status !== 'completed')
      const dueToday = tasks.filter((t) => t.dueDate === today).length
      const overdue = tasks.filter((t) => isLate(t)).length
      localStorage.setItem(DUE_NOTIFIED_KEY, today)
      if (dueToday === 0 && overdue === 0) return
      const parts = []
      if (dueToday > 0) parts.push(`${dueToday} task${dueToday === 1 ? '' : 's'} due today`)
      if (overdue > 0) parts.push(`${overdue} overdue`)
      sendNotification('ChronoKanban', parts.join(', '))
    }

    checkLongRunning()
    checkDueToday()
    const interval = setInterval(() => {
      checkLongRunning()
      checkDueToday() // re-checks daily key, so it also fires after midnight in a long-lived tab
    }, 60_000)
    return () => clearInterval(interval)
  }, [enabled, loaded])
}
