// Ambient declarations for the non-standard "beforeinstallprompt" API (Chromium PWA install).
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

interface WindowEventMap {
  beforeinstallprompt: BeforeInstallPromptEvent
}

interface Window {
  deferredInstallPrompt?: BeforeInstallPromptEvent
}
