import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Chrome fires beforeinstallprompt early (often before React mounts), so stash it globally for the
// InstallPrompt banner to pick up. Capturing it also suppresses the browser's default mini-infobar.
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  window.deferredInstallPrompt = e
})

// Best-effort request to exempt this origin from automatic storage eviction under pressure.
// Doesn't override an explicit browser setting like "clear site data on exit" — only pressure-based
// cleanup — and only Chromium reliably honors it, but it's free and strictly better than not asking.
navigator.storage?.persist?.()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
