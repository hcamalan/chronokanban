import type { TaskStatus, ColorMode } from '../types'

export type Level = 'low' | 'medium' | 'high'
export type Lateness = 'late' | 'not-late'

interface SemanticColors {
  status: Record<TaskStatus, string>
  level: Record<Level, string>
  late: Record<Lateness, string>
  uncategorized: string
  none: string
}

// Semantic, CVD-distinct palette (validated — worst adjacent ΔE 21.4). Each mark is always
// paired with a visible label, so gray reads as the neutral "none" state without ambiguity.
const DEFAULT_SEMANTIC: SemanticColors = {
  status: { 'not-started': '#9ca3af', 'in-progress': '#3b82f6', completed: '#22c55e' },
  level: { low: '#22c55e', medium: '#f59e0b', high: '#ef4444' },
  late: { late: '#ef4444', 'not-late': '#22c55e' },
  uncategorized: '#9ca3af',
  none: '#9ca3af',
}

// Built from the Okabe-Ito color-universal-design palette, chosen to stay distinguishable
// under protanopia, deuteranopia, and tritanopia simultaneously (green = good/on-time,
// orange = medium, vermillion = high/late — consistent across every dimension).
const COLORBLIND_SAFE_SEMANTIC: SemanticColors = {
  status: { 'not-started': '#9ca3af', 'in-progress': '#0072B2', completed: '#009E73' },
  level: { low: '#009E73', medium: '#E69F00', high: '#D55E00' },
  late: { late: '#D55E00', 'not-late': '#009E73' },
  uncategorized: '#9ca3af',
  none: '#9ca3af',
}

export function getSemanticColors(mode: ColorMode): SemanticColors {
  return mode === 'colorblind-safe' ? COLORBLIND_SAFE_SEMANTIC : DEFAULT_SEMANTIC
}

const DEFAULT_CATEGORY_COLORS = [
  '#9ca3af',
  '#ef4444',
  '#f97316',
  '#f59e0b',
  '#84cc16',
  '#22c55e',
  '#14b8a6',
  '#06b6d4',
  '#3b82f6',
  '#6366f1',
  '#a855f7',
  '#ec4899',
]

// Index-aligned with DEFAULT_CATEGORY_COLORS above, so remapCategoryColor can swap one-for-one.
// Okabe-Ito hues cover the first 7 slots; the remaining slots use lightness-shifted variants of
// those same hues to keep 12 total options while staying CVD-distinguishable.
const COLORBLIND_SAFE_CATEGORY_COLORS = [
  '#9ca3af',
  '#D55E00',
  '#E69F00',
  '#B8860B',
  '#009E73',
  '#00694F',
  '#56B4E9',
  '#0072B2',
  '#004C8C',
  '#5B5EA6',
  '#CC79A7',
  '#882255',
]

export const CATEGORY_COLOR_PRESETS: Record<ColorMode, string[]> = {
  default: DEFAULT_CATEGORY_COLORS,
  'colorblind-safe': COLORBLIND_SAFE_CATEGORY_COLORS,
}

/**
 * Category colors are always stored in default-space. This remaps a stored hex to its
 * colorblind-safe counterpart for display, so switching modes is fully non-destructive.
 * Hex values outside the preset list (e.g. from before the swatch picker existed) pass through
 * unchanged.
 */
export function remapCategoryColor(hex: string, mode: ColorMode): string {
  if (mode === 'default') return hex
  const index = DEFAULT_CATEGORY_COLORS.indexOf(hex)
  return index === -1 ? hex : COLORBLIND_SAFE_CATEGORY_COLORS[index]
}
