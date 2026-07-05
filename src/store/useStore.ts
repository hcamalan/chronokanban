import { create } from 'zustand'
import * as repo from '../db/repository'
import { buildExportFile, downloadExportFile } from '../db/exportImport'
import { logActivity, downloadActivityLogCsv } from '../db/activityLog'
import { createDebouncer } from './persist'
import type { Board, Bucket, TaskCard, Category } from '../types'

const debouncedPutTask = createDebouncer((task: TaskCard) => {
  repo.putTask(task)
  logActivity(task.id, task.name, 'update')
}, 450)
const debouncedPutBoard = createDebouncer(repo.putBoard, 450)
const debouncedPutBucket = createDebouncer(repo.putBucket, 450)
const debouncedPutCategory = createDebouncer(repo.putCategory, 450)

interface AppState {
  boards: Record<string, Board>
  buckets: Record<string, Bucket>
  tasks: Record<string, TaskCard>
  categories: Record<string, Category>
  loaded: boolean

  loadFromDB: () => Promise<void>

  addBoard: (name: string) => string
  renameBoard: (id: string, name: string) => void
  deleteBoard: (id: string) => void

  addBucket: (boardId: string, name: string) => string
  renameBucket: (id: string, name: string) => void
  deleteBucket: (id: string) => void

  addTask: (boardId: string, bucketId: string, name: string) => string
  updateTask: (id: string, patch: Partial<TaskCard>) => void
  deleteTask: (id: string) => void
  moveTask: (taskId: string, toBucketId: string, toIndex: number) => void
  moveTaskToBoard: (taskId: string, newBoardId: string) => void

  startTimer: (taskId: string) => void
  pauseTimer: (taskId: string) => void
  resetTimer: (taskId: string) => void

  completeTask: (taskId: string) => void
  uncompleteTask: (taskId: string) => void

  addCategory: (boardId: string, name: string, color: string) => string
  updateCategory: (id: string, patch: Partial<Category>) => void
  deleteCategory: (id: string) => void

  exportData: () => Promise<void>
  downloadActivityLog: () => Promise<void>
}

export const useStore = create<AppState>((set, get) => ({
  boards: {},
  buckets: {},
  tasks: {},
  categories: {},
  loaded: false,

  loadFromDB: async () => {
    const [boards, buckets, tasks, categories] = await Promise.all([
      repo.getAllBoards(),
      repo.getAllBuckets(),
      repo.getAllTasks(),
      repo.getAllCategories(),
    ])
    set({
      boards: Object.fromEntries(boards.map((b) => [b.id, b])),
      buckets: Object.fromEntries(buckets.map((b) => [b.id, b])),
      tasks: Object.fromEntries(tasks.map((t) => [t.id, t])),
      categories: Object.fromEntries(categories.map((c) => [c.id, c])),
      loaded: true,
    })
  },

  addBoard: (name) => {
    const id = crypto.randomUUID()
    const order = Object.keys(get().boards).length
    const board: Board = { id, name, order, createdAt: Date.now() }
    set((state) => ({ boards: { ...state.boards, [id]: board } }))
    repo.putBoard(board)
    return id
  },
  renameBoard: (id, name) => {
    set((state) => {
      const board = state.boards[id]
      if (!board) return state
      return { boards: { ...state.boards, [id]: { ...board, name } } }
    })
    debouncedPutBoard(id, () => get().boards[id])
  },
  deleteBoard: (id) => {
    const affectedTasks = Object.values(get().tasks).filter((t) => t.boardId === id)
    set((state) => {
      const boards = { ...state.boards }
      delete boards[id]
      const buckets = Object.fromEntries(Object.entries(state.buckets).filter(([, b]) => b.boardId !== id))
      const tasks = Object.fromEntries(Object.entries(state.tasks).filter(([, t]) => t.boardId !== id))
      const categories = Object.fromEntries(Object.entries(state.categories).filter(([, c]) => c.boardId !== id))
      return { boards, buckets, tasks, categories }
    })
    repo.deleteBoardCascade(id)
    for (const t of affectedTasks) logActivity(t.id, t.name, 'delete')
  },

  addBucket: (boardId, name) => {
    const id = crypto.randomUUID()
    const order = Object.values(get().buckets).filter((b) => b.boardId === boardId).length
    const bucket: Bucket = { id, boardId, name, order }
    set((state) => ({ buckets: { ...state.buckets, [id]: bucket } }))
    repo.putBucket(bucket)
    return id
  },
  renameBucket: (id, name) => {
    set((state) => {
      const bucket = state.buckets[id]
      if (!bucket) return state
      return { buckets: { ...state.buckets, [id]: { ...bucket, name } } }
    })
    debouncedPutBucket(id, () => get().buckets[id])
  },
  deleteBucket: (id) => {
    const affectedTasks = Object.values(get().tasks).filter((t) => t.bucketId === id)
    set((state) => {
      const buckets = { ...state.buckets }
      delete buckets[id]
      const tasks = Object.fromEntries(Object.entries(state.tasks).filter(([, t]) => t.bucketId !== id))
      return { buckets, tasks }
    })
    repo.deleteBucketCascade(id)
    for (const t of affectedTasks) logActivity(t.id, t.name, 'delete')
  },

  addTask: (boardId, bucketId, name) => {
    const id = crypto.randomUUID()
    const order = Object.values(get().tasks).filter((t) => t.bucketId === bucketId).length
    const task: TaskCard = {
      id,
      boardId,
      bucketId,
      name,
      categoryId: null,
      status: 'not-started',
      assignedTo: '',
      dueDate: null,
      urgency: 'medium',
      importance: 'medium',
      description: '',
      storyPoints: null,
      order,
      timer: { isRunning: false, elapsedSeconds: 0, startedAt: null },
      createdAt: Date.now(),
      completedAt: null,
    }
    set((state) => ({ tasks: { ...state.tasks, [id]: task } }))
    repo.putTask(task)
    logActivity(id, name, 'create')
    return id
  },
  updateTask: (id, patch) => {
    set((state) => {
      const task = state.tasks[id]
      if (!task) return state
      return { tasks: { ...state.tasks, [id]: { ...task, ...patch } } }
    })
    if ('name' in patch || 'description' in patch) {
      debouncedPutTask(id, () => get().tasks[id])
    } else {
      const updated = get().tasks[id]
      if (updated) {
        repo.putTask(updated)
        logActivity(id, updated.name, 'status' in patch ? 'status-change' : 'update')
      }
    }
  },
  deleteTask: (id) => {
    const taskName = get().tasks[id]?.name
    set((state) => {
      const tasks = { ...state.tasks }
      delete tasks[id]
      return { tasks }
    })
    repo.deleteTask(id)
    if (taskName != null) logActivity(id, taskName, 'delete')
  },
  moveTask: (taskId, toBucketId, toIndex) => {
    const state = get()
    const task = state.tasks[taskId]
    if (!task) return
    const fromBucketId = task.bucketId
    const isCompleted = task.status === 'completed'

    // Active and completed tasks keep separate order sequences within a bucket, since the
    // completed section is a visually distinct sub-list (collapsed by default).
    const targetTasks = Object.values(state.tasks)
      .filter((t) => t.bucketId === toBucketId && t.id !== taskId && (t.status === 'completed') === isCompleted)
      .sort((a, b) => a.order - b.order)
    targetTasks.splice(toIndex, 0, task)

    const updates: Record<string, TaskCard> = {}
    targetTasks.forEach((t, index) => {
      updates[t.id] = { ...t, bucketId: toBucketId, order: index }
    })

    set((s) => ({ tasks: { ...s.tasks, ...updates } }))
    Object.values(updates).forEach((t) => repo.putTask(t))

    if (fromBucketId !== toBucketId) {
      const remaining = Object.values(get().tasks)
        .filter((t) => t.bucketId === fromBucketId && (t.status === 'completed') === isCompleted)
        .sort((a, b) => a.order - b.order)
      const resequenced: Record<string, TaskCard> = {}
      remaining.forEach((t, index) => {
        if (t.order !== index) resequenced[t.id] = { ...t, order: index }
      })
      if (Object.keys(resequenced).length > 0) {
        set((s) => ({ tasks: { ...s.tasks, ...resequenced } }))
        Object.values(resequenced).forEach((t) => repo.putTask(t))
      }
      logActivity(taskId, task.name, 'move')
    }
  },
  moveTaskToBoard: (taskId, newBoardId) => {
    const task = get().tasks[taskId]
    if (!task) return
    const targetBuckets = Object.values(get().buckets)
      .filter((b) => b.boardId === newBoardId)
      .sort((a, b) => a.order - b.order)
    if (targetBuckets.length === 0) return
    const newBucketId = targetBuckets[0].id
    const order = Object.values(get().tasks).filter((t) => t.bucketId === newBucketId).length
    const updated: TaskCard = { ...task, boardId: newBoardId, bucketId: newBucketId, categoryId: null, order }
    set((state) => ({ tasks: { ...state.tasks, [taskId]: updated } }))
    repo.putTask(updated)
    logActivity(taskId, task.name, 'move')
  },

  startTimer: (taskId) => {
    const task = get().tasks[taskId]
    if (!task || task.timer.isRunning) return
    const updated: TaskCard = {
      ...task,
      status: task.status === 'not-started' ? 'in-progress' : task.status,
      timer: { ...task.timer, isRunning: true, startedAt: Date.now() },
    }
    set((state) => ({ tasks: { ...state.tasks, [taskId]: updated } }))
    repo.putTask(updated)
    logActivity(taskId, task.name, 'timer-start')
  },
  pauseTimer: (taskId) => {
    const task = get().tasks[taskId]
    if (!task || !task.timer.isRunning || task.timer.startedAt == null) return
    const elapsedSeconds = task.timer.elapsedSeconds + (Date.now() - task.timer.startedAt) / 1000
    const updated: TaskCard = { ...task, timer: { isRunning: false, elapsedSeconds, startedAt: null } }
    set((state) => ({ tasks: { ...state.tasks, [taskId]: updated } }))
    repo.putTask(updated)
    logActivity(taskId, task.name, 'timer-pause')
  },
  resetTimer: (taskId) => {
    const task = get().tasks[taskId]
    if (!task) return
    const updated: TaskCard = { ...task, timer: { isRunning: false, elapsedSeconds: 0, startedAt: null } }
    set((state) => ({ tasks: { ...state.tasks, [taskId]: updated } }))
    repo.putTask(updated)
    logActivity(taskId, task.name, 'timer-reset')
  },

  completeTask: (taskId) => {
    const task = get().tasks[taskId]
    if (!task) return
    let timer = task.timer
    if (timer.isRunning && timer.startedAt != null) {
      const elapsedSeconds = timer.elapsedSeconds + (Date.now() - timer.startedAt) / 1000
      timer = { isRunning: false, elapsedSeconds, startedAt: null }
    }
    const updated: TaskCard = { ...task, status: 'completed', completedAt: Date.now(), timer }
    set((state) => ({ tasks: { ...state.tasks, [taskId]: updated } }))
    repo.putTask(updated)
    logActivity(taskId, task.name, 'status-change')
  },
  uncompleteTask: (taskId) => {
    const task = get().tasks[taskId]
    if (!task) return
    const updated: TaskCard = { ...task, status: 'not-started', completedAt: null }
    set((state) => ({ tasks: { ...state.tasks, [taskId]: updated } }))
    repo.putTask(updated)
    logActivity(taskId, task.name, 'status-change')
  },

  addCategory: (boardId, name, color) => {
    const id = crypto.randomUUID()
    const category: Category = { id, boardId, name, color }
    set((state) => ({ categories: { ...state.categories, [id]: category } }))
    repo.putCategory(category)
    return id
  },
  updateCategory: (id, patch) => {
    set((state) => {
      const category = state.categories[id]
      if (!category) return state
      return { categories: { ...state.categories, [id]: { ...category, ...patch } } }
    })
    if ('name' in patch) {
      debouncedPutCategory(id, () => get().categories[id])
    } else {
      const updated = get().categories[id]
      if (updated) repo.putCategory(updated)
    }
  },
  deleteCategory: (id) => {
    const affectedTaskIds = Object.values(get().tasks)
      .filter((t) => t.categoryId === id)
      .map((t) => t.id)

    set((state) => {
      const categories = { ...state.categories }
      delete categories[id]
      const tasks = { ...state.tasks }
      for (const taskId of affectedTaskIds) {
        tasks[taskId] = { ...tasks[taskId], categoryId: null }
      }
      return { categories, tasks }
    })

    repo.deleteCategory(id)
    for (const taskId of affectedTaskIds) {
      const task = get().tasks[taskId]
      if (task) repo.putTask(task)
    }
  },

  exportData: async () => {
    const data = await buildExportFile()
    downloadExportFile(data)
  },
  downloadActivityLog: async () => {
    await downloadActivityLogCsv()
  },
}))
