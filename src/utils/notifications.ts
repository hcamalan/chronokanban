/** Requests browser notification permission; resolves true if granted. */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  return (await Notification.requestPermission()) === 'granted'
}

/** Fires a browser notification; silently no-ops when unsupported or not permitted. */
export function sendNotification(title: string, body: string): void {
  if (!('Notification' in window) || Notification.permission !== 'granted') return
  try {
    new Notification(title, { body, icon: './logo.svg' })
  } catch {
    // Some platforms (notably Android Chrome) disallow the constructor — nothing to do without a SW push setup.
  }
}
