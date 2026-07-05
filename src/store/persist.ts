const pendingFlushes: Array<() => void> = []

export function createDebouncer<T>(fn: (arg: T) => void, delayMs: number) {
  const timers = new Map<string, ReturnType<typeof setTimeout>>()
  const pending = new Map<string, T>()

  pendingFlushes.push(() => {
    for (const [key, arg] of pending) {
      clearTimeout(timers.get(key))
      fn(arg)
    }
    timers.clear()
    pending.clear()
  })

  return (key: string, arg: T) => {
    const existing = timers.get(key)
    if (existing) clearTimeout(existing)
    pending.set(key, arg)
    timers.set(
      key,
      setTimeout(() => {
        timers.delete(key)
        pending.delete(key)
        fn(arg)
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
