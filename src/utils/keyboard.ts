import type { KeyboardEvent } from 'react'

/** Blurs (and so commits) a single-line text field when Enter is pressed. */
export function blurOnEnter(e: KeyboardEvent<HTMLInputElement>) {
  if (e.key === 'Enter') e.currentTarget.blur()
}

/** Blurs a multi-line field on Ctrl/Cmd+Enter, leaving plain Enter free to insert a newline. */
export function blurOnCtrlEnter(e: KeyboardEvent<HTMLTextAreaElement>) {
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) e.currentTarget.blur()
}
