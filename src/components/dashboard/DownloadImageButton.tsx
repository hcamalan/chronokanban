import { toPng } from 'html-to-image'
import type { RefObject } from 'react'

interface DownloadImageButtonProps {
  targetRef: RefObject<HTMLDivElement | null>
  filename: string
}

export function DownloadImageButton({ targetRef, filename }: DownloadImageButtonProps) {
  async function handleClick() {
    if (!targetRef.current) return
    const dataUrl = await toPng(targetRef.current, { pixelRatio: 2 })
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = filename
    a.click()
  }

  return (
    <button
      onClick={handleClick}
      aria-label="Download as image"
      title="Download as image"
      className="absolute bottom-2 right-2 rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
    >
      ⬇
    </button>
  )
}
