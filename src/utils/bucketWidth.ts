import type { BucketWidth } from '../types'

export const BUCKET_WIDTH_OPTIONS: { value: BucketWidth; label: string; className: string }[] = [
  { value: 'narrow', label: 'Narrow', className: 'w-56' },
  { value: 'default', label: 'Default', className: 'w-64' },
  { value: 'wide', label: 'Wide', className: 'w-80' },
  { value: 'xwide', label: 'Extra wide', className: 'w-96' },
]

export function bucketWidthClass(width: BucketWidth): string {
  return BUCKET_WIDTH_OPTIONS.find((o) => o.value === width)?.className ?? 'w-64'
}
