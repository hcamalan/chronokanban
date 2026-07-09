import { useRef, useState, type ReactNode } from 'react'

interface SwipeToDeleteProps {
  onRequestDelete: () => void
  children: ReactNode
}

const TRIGGER_PX = 80
const MAX_PX = 160

/**
 * iOS-style swipe-left-to-delete for a task card (touch only — mouse never fires these events).
 * Engages only on a quick, horizontal, leftward flick: a slow/held start or a vertical motion is
 * left to the drag sensor and the scroller, so this never fights the press-and-hold drag gesture.
 * Past the trigger distance on release it asks the parent to confirm; otherwise it snaps back.
 */
export function SwipeToDelete({ onRequestDelete, children }: SwipeToDeleteProps) {
  const [dx, setDx] = useState(0)
  const dxRef = useRef(0)
  const startRef = useRef<{ x: number; y: number; t: number } | null>(null)
  const modeRef = useRef<'idle' | 'swiping' | 'ignore'>('idle')

  function setOffset(value: number) {
    dxRef.current = value
    setDx(value)
  }

  function handleTouchStart(e: React.TouchEvent) {
    const touch = e.touches[0]
    startRef.current = { x: touch.clientX, y: touch.clientY, t: Date.now() }
    modeRef.current = 'idle'
  }

  function handleTouchMove(e: React.TouchEvent) {
    const start = startRef.current
    if (!start) return
    const touch = e.touches[0]
    const ddx = touch.clientX - start.x
    const ddy = touch.clientY - start.y

    if (modeRef.current === 'idle') {
      if (Math.abs(ddx) < 8 && Math.abs(ddy) < 8) return
      const heldTooLong = Date.now() - start.t > 250
      if (!heldTooLong && ddx < 0 && Math.abs(ddx) > Math.abs(ddy)) {
        modeRef.current = 'swiping'
      } else {
        modeRef.current = 'ignore'
      }
    }

    if (modeRef.current === 'swiping') {
      e.stopPropagation()
      setOffset(Math.max(-MAX_PX, Math.min(0, ddx)))
    }
  }

  function handleTouchEnd() {
    const triggered = modeRef.current === 'swiping' && dxRef.current <= -TRIGGER_PX
    setOffset(0)
    modeRef.current = 'idle'
    startRef.current = null
    if (triggered) onRequestDelete()
  }

  const armed = dx <= -TRIGGER_PX

  return (
    <div
      className="relative overflow-hidden rounded-md"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      <div
        className={`absolute inset-0 flex items-center justify-end pr-4 text-white ${armed ? 'bg-red-600' : 'bg-red-500'}`}
        aria-hidden="true"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 6h18" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          <line x1="10" y1="11" x2="10" y2="17" />
          <line x1="14" y1="11" x2="14" y2="17" />
        </svg>
      </div>
      <div style={{ transform: `translateX(${dx}px)`, transition: dx === 0 ? 'transform 160ms ease-out' : undefined }}>
        {children}
      </div>
    </div>
  )
}
