import { getDB } from './db'

const DIR_HANDLE_KEY = 'autoSyncDirHandle'
const LAST_SYNCED_AT_KEY = 'autoSyncLastSyncedAt'

export async function getStoredDirHandle(): Promise<FileSystemDirectoryHandle | undefined> {
  const db = await getDB()
  return (await db.get('appSettings', DIR_HANDLE_KEY)) as FileSystemDirectoryHandle | undefined
}

export async function saveDirHandle(handle: FileSystemDirectoryHandle): Promise<void> {
  const db = await getDB()
  await db.put('appSettings', handle, DIR_HANDLE_KEY)
}

export async function clearDirHandle(): Promise<void> {
  const db = await getDB()
  await db.delete('appSettings', DIR_HANDLE_KEY)
  await db.delete('appSettings', LAST_SYNCED_AT_KEY)
}

export async function getLastSyncedAt(): Promise<string | undefined> {
  const db = await getDB()
  return (await db.get('appSettings', LAST_SYNCED_AT_KEY)) as string | undefined
}

export async function setLastSyncedAt(iso: string): Promise<void> {
  const db = await getDB()
  await db.put('appSettings', iso, LAST_SYNCED_AT_KEY)
}
