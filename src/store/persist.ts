const pendingFlushes: Array<() => void> = []

export function createDebouncer<T>(fn: (arg: T) => void, delayMs: number) {
  const timers = new Map<string, ReturnType<typeof setTimeout>>()
  const pending = new Map<string, () => T | undefined>()

  pendingFlushes.push(() => {
    for (const [key, getArg] of pending) {
      clearTimeout(timers.get(key))
      const arg = getArg()
      if (arg !== undefined) fn(arg)
    }
    timers.clear()
    pending.clear()
  })

  // Takes a getter rather than a value so a flush (natural or forced) always writes
  // whatever is current at that moment, not a stale snapshot from when typing paused —
  // otherwise a later change to the same record (e.g. marking it complete) could get
  // silently overwritten once the pending text write finally lands. Returning undefined
  // (e.g. the record was deleted since) skips the write instead of persisting garbage.
  return (key: string, getArg: () => T | undefined) => {
    const existing = timers.get(key)
    if (existing) clearTimeout(existing)
    pending.set(key, getArg)
    timers.set(
      key,
      setTimeout(() => {
        timers.delete(key)
        pending.delete(key)
        const arg = getArg()
        if (arg !== undefined) fn(arg)
      }, delayMs),
    )
  }
}

/** Immediately runs any debounced writes still pending, so a fast reload/close doesn't lose the latest edit. */
export function flushAllDebouncers() {
  for (const flush of pendingFlushes) flush()
}

if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', flushAllDebouncers)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushAllDebouncers()
  })
}
