import { create } from 'zustand'
import { useStore } from './useStore'
import { buildExportFile, parseImportFile } from '../db/exportImport'
import { createDebouncer } from './persist'
import {
  getStoredDirHandle,
  saveDirHandle,
  clearDirHandle,
  getLastSyncedAt,
  setLastSyncedAt,
} from '../db/autoSyncStorage'

const FILE_NAME = 'chronokanban-autosync.json'

export const isAutoSyncSupported = typeof window !== 'undefined' && typeof window.showDirectoryPicker === 'function'

export type AutoSyncStatus = 'unsupported' | 'unconfigured' | 'connected' | 'needs-reconnect'

interface AutoSyncState {
  status: AutoSyncStatus
  folderName: string | null
  lastSyncedAt: string | null
  init: () => Promise<void>
  chooseFolder: () => Promise<void>
  reconnect: () => Promise<void>
  disconnect: () => Promise<void>
}

let dirHandle: FileSystemDirectoryHandle | null = null
let unwatchStore: (() => void) | null = null

async function writeSnapshot() {
  if (!dirHandle) return
  const data = await buildExportFile()
  const fileHandle = await dirHandle.getFileHandle(FILE_NAME, { create: true })
  const writable = await fileHandle.createWritable()
  await writable.write(JSON.stringify(data, null, 2))
  await writable.close()
  await setLastSyncedAt(data.exportedAt)
  useAutoSyncStore.setState({ lastSyncedAt: data.exportedAt })
}

const debouncedWrite = createDebouncer<true>(() => {
  void writeSnapshot()
}, 3000)

function watchStoreForChanges() {
  unwatchStore?.()
  unwatchStore = useStore.subscribe((curr, prev) => {
    if (
      curr.boards !== prev.boards ||
      curr.buckets !== prev.buckets ||
      curr.tasks !== prev.tasks ||
      curr.categories !== prev.categories
    ) {
      debouncedWrite('autosync', () => true)
    }
  })
}

/** Reads the file (if any), pulls it in when it's newer than our last known sync, otherwise pushes local data to it. */
async function connectAndSync(handle: FileSystemDirectoryHandle) {
  dirHandle = handle
  const localLastSyncedAt = await getLastSyncedAt()

  let fileData: Awaited<ReturnType<typeof buildExportFile>> | null = null
  try {
    const fileHandle = await handle.getFileHandle(FILE_NAME)
    const file = await fileHandle.getFile()
    fileData = await parseImportFile(file)
  } catch {
    fileData = null
  }

  if (fileData && (!localLastSyncedAt || fileData.exportedAt > localLastSyncedAt)) {
    await useStore.getState().restoreFromSnapshot(fileData)
    await setLastSyncedAt(fileData.exportedAt)
  } else {
    await writeSnapshot()
  }

  watchStoreForChanges()
  useAutoSyncStore.setState({
    status: 'connected',
    folderName: handle.name,
    lastSyncedAt: (await getLastSyncedAt()) ?? null,
  })
}

export const useAutoSyncStore = create<AutoSyncState>((set) => ({
  status: isAutoSyncSupported ? 'unconfigured' : 'unsupported',
  folderName: null,
  lastSyncedAt: null,

  init: async () => {
    if (!isAutoSyncSupported) return
    const handle = await getStoredDirHandle()
    if (!handle) return
    dirHandle = handle
    const permission = await handle.queryPermission({ mode: 'readwrite' })
    if (permission !== 'granted') {
      set({ status: 'needs-reconnect', folderName: handle.name, lastSyncedAt: (await getLastSyncedAt()) ?? null })
      return
    }
    await connectAndSync(handle)
  },

  chooseFolder: async () => {
    if (!window.showDirectoryPicker) return
    let handle: FileSystemDirectoryHandle
    try {
      handle = await window.showDirectoryPicker({ mode: 'readwrite' })
    } catch {
      return // user cancelled the picker
    }
    await saveDirHandle(handle)
    await connectAndSync(handle)
  },

  reconnect: async () => {
    if (!dirHandle) return
    const permission = await dirHandle.requestPermission({ mode: 'readwrite' })
    if (permission === 'granted') await connectAndSync(dirHandle)
  },

  disconnect: async () => {
    unwatchStore?.()
    unwatchStore = null
    dirHandle = null
    await clearDirHandle()
    set({ status: 'unconfigured', folderName: null, lastSyncedAt: null })
  },
}))
