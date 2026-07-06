export type Urgency = 'low' | 'medium' | 'high'
export type Importance = 'low' | 'medium' | 'high'
export type TaskStatus = 'not-started' | 'in-progress' | 'completed'

export interface Category {
  id: string
  boardId: string
  name: string
  color: string
}

export interface Board {
  id: string
  name: string
  order: number
  createdAt: number
}

export interface Bucket {
  id: string
  boardId: string
  name: string
  order: number
}

export interface TimerState {
  isRunning: boolean
  /** accumulated time NOT counting the current running segment */
  elapsedSeconds: number
  /** epoch ms when the current running segment began; null if paused */
  startedAt: number | null
}

export interface TaskCard {
  id: string
  boardId: string
  bucketId: string
  name: string
  categoryId: string | null
  status: TaskStatus
  assignedTo: string
  dueDate: string | null
  urgency: Urgency | null
  importance: Importance | null
  description: string
  storyPoints: number | null
  /** position within its bucket */
  order: number
  timer: TimerState
  createdAt: number
  completedAt: number | null
}

export interface Attachment {
  id: string
  taskId: string
  fileName: string
  mimeType: string
  size: number
  blob: Blob
  createdAt: number
}

export type ActivityActionType =
  | 'create'
  | 'update'
  | 'status-change'
  | 'move'
  | 'timer-start'
  | 'timer-pause'
  | 'timer-reset'
  | 'delete'
  | 'manual-adjustment'

export interface ActivityLogEntry {
  id: string
  taskId: string
  /** denormalized so history survives the task itself being deleted */
  taskName: string
  actionType: ActivityActionType
  timestamp: number
  /** the task's status at the moment of this event; used to reconstruct end-of-day status */
  status?: TaskStatus
  /** epoch ms a work segment began; set only on entries that CLOSE a segment (pause / complete-while-running) */
  segmentStart?: number
  /** signed seconds delta from a manual "Time elapsed" edit; credited to this entry's own (today's) date */
  adjustmentSeconds?: number
}
