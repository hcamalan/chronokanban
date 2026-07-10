import { useEffect, useRef, useState } from 'react'
import { useStore } from '../../store/useStore'
import { DarkModeToggle } from './DarkModeToggle'
import { ConfirmDialog } from '../boards/ConfirmDialog'
import { FieldsPanel } from './FieldsPanel'
import { BUCKET_WIDTH_OPTIONS } from '../../utils/bucketWidth'
import { requestNotificationPermission } from '../../utils/notifications'
import type { DateFormat, ColorMode } from '../../types'

interface SettingsPanelProps {
  onDataDeleted: () => void
}

const DATE_FORMAT_OPTIONS: { value: DateFormat; label: string }[] = [
  { value: 'DD/MM', label: 'DD/MM (05/03)' },
  { value: 'MM/DD', label: 'MM/DD (03/05)' },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (05/03/2026)' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (03/05/2026)' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (2026-03-05)' },
]

const COLOR_MODE_OPTIONS: { value: ColorMode; label: string }[] = [
  { value: 'default', label: 'Off' },
  { value: 'colorblind-safe', label: 'Colorblind-safe' },
]

const selectClass =
  'rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100'

export function SettingsPanel({ onDataDeleted }: SettingsPanelProps) {
  const [open, setOpen] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [fieldsOpen, setFieldsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const preferences = useStore((s) => s.preferences)
  const setPreference = useStore((s) => s.setPreference)
  const deleteAllData = useStore((s) => s.deleteAllData)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  const bucketWidthIndex = BUCKET_WIDTH_OPTIONS.findIndex((o) => o.value === preferences.bucketWidth)
  const bucketWidthLabel = BUCKET_WIDTH_OPTIONS[bucketWidthIndex]?.label ?? 'Default'

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Settings"
        className="rounded px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        ⚙️
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-1 w-64 rounded border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-2 px-1 text-xs font-medium text-gray-500 dark:text-gray-400">Preferences</h3>

          <DarkModeToggle />

          <div className="mt-3 px-1">
            <label className="mb-1 flex items-center justify-between text-sm text-gray-700 dark:text-gray-200">
              Bucket width
              <span className="text-xs text-gray-500 dark:text-gray-400">{bucketWidthLabel}</span>
            </label>
            <input
              type="range"
              min={0}
              max={BUCKET_WIDTH_OPTIONS.length - 1}
              step={1}
              value={bucketWidthIndex}
              onChange={(e) => setPreference('bucketWidth', BUCKET_WIDTH_OPTIONS[Number(e.target.value)].value)}
              className="w-full"
            />
          </div>

          <label className="mt-3 flex flex-col gap-1 px-1 text-sm text-gray-700 dark:text-gray-200">
            Date format
            <select
              value={preferences.dateFormat}
              onChange={(e) => setPreference('dateFormat', e.target.value as DateFormat)}
              className={selectClass}
            >
              {DATE_FORMAT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>

          <label className="mt-3 flex flex-col gap-1 px-1 text-sm text-gray-700 dark:text-gray-200">
            Colorblind mode
            <select
              value={preferences.colorMode}
              onChange={(e) => setPreference('colorMode', e.target.value as ColorMode)}
              className={selectClass}
            >
              {COLOR_MODE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>

          <label className="mt-3 flex items-center gap-2 px-1 text-sm text-gray-700 dark:text-gray-200">
            <input
              type="checkbox"
              checked={preferences.showDescriptionOnCard}
              onChange={(e) => setPreference('showDescriptionOnCard', e.target.checked)}
            />
            Show description on card
          </label>

          <label className="mt-3 flex items-center gap-2 px-1 text-sm text-gray-700 dark:text-gray-200">
            <input
              type="checkbox"
              checked={preferences.notificationsEnabled}
              onChange={async (e) => {
                if (e.target.checked) {
                  const granted = await requestNotificationPermission()
                  if (!granted) {
                    window.alert('Notifications are blocked for this site — allow them in your browser settings first.')
                    return
                  }
                }
                setPreference('notificationsEnabled', e.target.checked)
              }}
            />
            Desktop notifications
          </label>

          <div className="mt-3 border-t border-gray-200 pt-3 dark:border-gray-700">
            <button
              onClick={() => {
                setOpen(false)
                setFieldsOpen(true)
              }}
              className="w-full rounded px-1 py-1 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              Fields…
            </button>
          </div>

          <div className="mt-3 border-t border-gray-200 pt-3 dark:border-gray-700">
            <button
              onClick={() => {
                setOpen(false)
                setConfirmingDelete(true)
              }}
              className="w-full rounded px-1 py-1 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
            >
              Delete all my data
            </button>
          </div>
        </div>
      )}

      {fieldsOpen && <FieldsPanel onClose={() => setFieldsOpen(false)} />}

      {confirmingDelete && (
        <ConfirmDialog
          message="This permanently deletes every board, bucket, task, and category stored in this browser. This cannot be undone — if you haven't already, back up your data first with Export. Are you sure?"
          confirmLabel="Delete everything"
          onCancel={() => setConfirmingDelete(false)}
          onConfirm={async () => {
            await deleteAllData()
            setConfirmingDelete(false)
            onDataDeleted()
          }}
        />
      )}
    </div>
  )
}
