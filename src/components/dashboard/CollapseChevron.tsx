interface CollapseChevronProps {
  collapsed: boolean
  onClick: () => void
  label: string
}

export function CollapseChevron({ collapsed, onClick, label }: CollapseChevronProps) {
  return (
    <button
      onClick={onClick}
      aria-label={collapsed ? `Expand ${label}` : `Minimize ${label}`}
      title={collapsed ? 'Expand' : 'Minimize'}
      className="flex-shrink-0 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {collapsed ? <path d="m9 18 6-6-6-6" /> : <path d="m6 9 6 6 6-6" />}
      </svg>
    </button>
  )
}
