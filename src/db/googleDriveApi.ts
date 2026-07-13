const FOLDER_NAME = 'ChronoKanban'
const FILE_NAME = 'chronokanban-sync.json'
const API_BASE = 'https://www.googleapis.com/drive/v3'
const UPLOAD_BASE = 'https://www.googleapis.com/upload/drive/v3'

/** Carries the HTTP status so callers can tell "file deleted / access revoked" (404/403) apart from other failures. */
export class DriveApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function driveFetch(url: string, token: string, init?: RequestInit): Promise<Response> {
  const res = await fetch(url, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, ...(init?.headers ?? {}) },
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new DriveApiError(res.status, `Drive API error ${res.status}: ${text}`)
  }
  return res
}

/** True for "the file is gone or you no longer have access to it" — reconnecting won't fix this. */
export function isFileGoneError(err: unknown): boolean {
  return err instanceof DriveApiError && (err.status === 404 || err.status === 403)
}

/** Finds the app's "ChronoKanban" folder in Drive, creating it if it doesn't exist yet. */
export async function findOrCreateFolder(token: string): Promise<string> {
  const query = encodeURIComponent(
    `name='${FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
  )
  const listRes = await driveFetch(`${API_BASE}/files?q=${query}&fields=files(id)&spaces=drive`, token)
  const listData = (await listRes.json()) as { files: { id: string }[] }
  if (listData.files.length > 0) return listData.files[0].id

  const createRes = await driveFetch(`${API_BASE}/files`, token, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: FOLDER_NAME, mimeType: 'application/vnd.google-apps.folder' }),
  })
  const createData = (await createRes.json()) as { id: string }
  return createData.id
}

/** Finds the sync file inside the given folder, if one already exists there. */
export async function findSyncFile(token: string, folderId: string): Promise<string | null> {
  const query = encodeURIComponent(`name='${FILE_NAME}' and '${folderId}' in parents and trashed=false`)
  const res = await driveFetch(`${API_BASE}/files?q=${query}&fields=files(id)&spaces=drive`, token)
  const data = (await res.json()) as { files: { id: string }[] }
  return data.files[0]?.id ?? null
}

/** Cheap metadata-only check, used for polling without downloading the whole file each time. */
export async function getFileModifiedTime(token: string, fileId: string): Promise<string> {
  const res = await driveFetch(`${API_BASE}/files/${fileId}?fields=modifiedTime`, token)
  const data = (await res.json()) as { modifiedTime: string }
  return data.modifiedTime
}

export async function downloadFileContent(token: string, fileId: string): Promise<string> {
  const res = await driveFetch(`${API_BASE}/files/${fileId}?alt=media`, token)
  return res.text()
}

/**
 * Creates the sync file (if `fileId` is null) or overwrites its content in place. Returns the
 * file's id and Drive's own server-assigned `modifiedTime` (used for comparisons instead of any
 * device's local clock, which could be skewed).
 */
export async function writeFileContent(
  token: string,
  folderId: string | null,
  fileId: string | null,
  json: string,
): Promise<{ id: string; modifiedTime: string }> {
  if (fileId) {
    const res = await driveFetch(`${UPLOAD_BASE}/files/${fileId}?uploadType=media&fields=id,modifiedTime`, token, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: json,
    })
    return (await res.json()) as { id: string; modifiedTime: string }
  }
  if (!folderId) {
    throw new Error('Cannot create a new sync file without a destination folder')
  }

  const boundary = 'chronokanban-sync-boundary'
  const metadata = JSON.stringify({ name: FILE_NAME, parents: [folderId] })
  const body =
    `--${boundary}\r\n` +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    `${metadata}\r\n` +
    `--${boundary}\r\n` +
    'Content-Type: application/json\r\n\r\n' +
    `${json}\r\n` +
    `--${boundary}--`

  const res = await driveFetch(`${UPLOAD_BASE}/files?uploadType=multipart&fields=id,modifiedTime`, token, {
    method: 'POST',
    headers: { 'Content-Type': `multipart/related; boundary=${boundary}` },
    body,
  })
  return (await res.json()) as { id: string; modifiedTime: string }
}
