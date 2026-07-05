import { useEffect, useState } from 'react'
import type { TimerState } from '../types'

export function useElapsedTime(timer: TimerState): number {
  const [, forceTick] = useState(0)

  useEffect(() => {
    if (!timer.isRunning) return
    const interval = setInterval(() => forceTick((n) => n + 1), 1000)
    return () => clearInterval(interval)
  }, [timer.isRunning])

  if (timer.isRunning && timer.startedAt != null) {
    return timer.elapsedSeconds + (Date.now() - timer.startedAt) / 1000
  }
  return timer.elapsedSeconds
}
