import { GOOGLE_CLIENT_ID, GOOGLE_DRIVE_SCOPE } from '../config/googleDrive'

const GIS_SCRIPT_SRC = 'https://accounts.google.com/gsi/client'
const SILENT_TIMEOUT_MS = 6000

let scriptLoadPromise: Promise<void> | null = null
let tokenClient: GoogleTokenClient | null = null
let accessToken: string | null = null
let tokenExpiresAt = 0
let pendingResolve: ((token: string) => void) | null = null
let pendingReject: ((err: Error) => void) | null = null

function loadGisScript(): Promise<void> {
  if (scriptLoadPromise) return scriptLoadPromise
  scriptLoadPromise = new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = GIS_SCRIPT_SRC
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Google Identity Services'))
    document.head.appendChild(script)
  })
  return scriptLoadPromise
}

async function getTokenClient(): Promise<GoogleTokenClient> {
  await loadGisScript()
  if (!tokenClient) {
    if (!window.google) throw new Error('Google Identity Services failed to load')
    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: GOOGLE_DRIVE_SCOPE,
      callback: (response) => {
        if (response.error) {
          pendingReject?.(new Error(response.error_description || response.error))
        } else {
          accessToken = response.access_token
          tokenExpiresAt = Date.now() + response.expires_in * 1000
          pendingResolve?.(response.access_token)
        }
        pendingResolve = null
        pendingReject = null
      },
    })
  }
  return tokenClient
}

/**
 * Resolves with a valid access token, reusing the in-memory one if it isn't close to expiring.
 * `silent: true` attempts a non-interactive refresh (no popup) and times out after a few seconds
 * if Google never calls back (undocumented/inconsistent behavior when there's no existing
 * session) — callers should fall back to `silent: false` in that case. `silent: false` may show
 * Google's consent/account-picker popup.
 */
export async function getAccessToken({ silent }: { silent: boolean }): Promise<string> {
  if (accessToken && Date.now() < tokenExpiresAt - 60_000) {
    return accessToken
  }

  const client = await getTokenClient()

  return new Promise((resolve, reject) => {
    let settled = false
    const timeoutId = silent
      ? setTimeout(() => {
          if (settled) return
          settled = true
          pendingResolve = null
          pendingReject = null
          reject(new Error('Silent token request timed out'))
        }, SILENT_TIMEOUT_MS)
      : null

    pendingResolve = (token) => {
      if (settled) return
      settled = true
      if (timeoutId) clearTimeout(timeoutId)
      resolve(token)
    }
    pendingReject = (err) => {
      if (settled) return
      settled = true
      if (timeoutId) clearTimeout(timeoutId)
      reject(err)
    }

    client.requestAccessToken(silent ? { prompt: '' } : {})
  })
}

export function clearAccessToken(): void {
  accessToken = null
  tokenExpiresAt = 0
}
