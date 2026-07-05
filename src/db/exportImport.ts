import { getDB } from './db'
import { clearAllStores, bulkPutAll, getAllBoards, getAllBuckets, getAllTasks, getAllCategories } from './repository'
import type { Board, Bucket, TaskCard, Category, Attachment } from '../types'

export interface ExportFile {
  version: 1
  exportedAt: string
  boards: Board[]
  buckets: Bucket[]
  tasks: TaskCard[]
  categories: Category[]
  attachments: {
    id: string
    taskId: string
    fileName: string
    mimeType: string
    size: number
    dataBase64: string
  }[]
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

async function base64ToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl)
  return res.blob()
}

export async function buildExportFile(): Promise<ExportFile> {
  const db = await getDB()
  const [boards, buckets, tasks, categories, allAttachments] = await Promise.all([
    getAllBoards(),
    getAllBuckets(),
    getAllTasks(),
    getAllCategories(),
    db.getAll('attachments'),
  ])
  const attachments = await Promise.all(
    allAttachments.map(async (a) => ({
      id: a.id,
      taskId: a.taskId,
      fileName: a.fileName,
      mimeType: a.mimeType,
      size: a.size,
      dataBase64: await blobToBase64(a.blob),
    })),
  )
  return { version: 1, exportedAt: new Date().toISOString(), boards, buckets, tasks, categories, attachments }
}

export function downloadExportFile(data: ExportFile) {
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `chronokanban-export-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function isValidExportFile(data: unknown): data is ExportFile {
  if (typeof data !== 'object' || data === null) return false
  const d = data as Record<string, unknown>
  return (
    d.version === 1 &&
    Array.isArray(d.boards) &&
    Array.isArray(d.buckets) &&
    Array.isArray(d.tasks) &&
    Array.isArray(d.categories) &&
    Array.isArray(d.attachments)
  )
}

export async function parseImportFile(file: File): Promise<ExportFile> {
  const text = await file.text()
  const data: unknown = JSON.parse(text)
  if (!isValidExportFile(data)) {
    throw new Error('Invalid export file format')
  }
  return data
}

export async function applyImportFile(data: ExportFile): Promise<void> {
  const attachments: Attachment[] = await Promise.all(
    data.attachments.map(async (a) => ({
      id: a.id,
      taskId: a.taskId,
      fileName: a.fileName,
      mimeType: a.mimeType,
      size: a.size,
      blob: await base64ToBlob(a.dataBase64),
      createdAt: Date.now(),
    })),
  )
  await clearAllStores()
  await bulkPutAll({
    boards: data.boards,
    buckets: data.buckets,
    tasks: data.tasks,
    categories: data.categories,
    attachments,
  })
}
