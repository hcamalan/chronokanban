import { useEffect, useState } from 'react'

/** Forces a re-render every `intervalMs` while `active` is true. */
export function useTick(active: boolean, intervalMs: number) {
  const [, forceTick] = useState(0)

  useEffect(() => {
    if (!active) return
    const interval = setInterval(() => forceTick((n) => n + 1), intervalMs)
    return () => clearInterval(interval)
  }, [active, intervalMs])
}
