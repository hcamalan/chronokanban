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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
