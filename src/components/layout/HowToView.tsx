export function HowToView() {
  return (
    <div className="mx-auto max-w-3xl p-6 text-gray-700 dark:text-gray-300">
      <h1 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-gray-100">How to use ChronoKanban</h1>

      <p className="mb-6">
        ChronoKanban is a Kanban board for tracking how much time you spend on your tasks. It runs entirely in your
        browser — there's no account, no server, and nothing is sent anywhere. Your data lives only on this device.
      </p>

      <section className="mb-6">
        <h2 className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">The basics: Boards, Buckets, Tasks</h2>
        <p>
          A <strong>board</strong> is a project or area of your life (e.g. "Work" or "Home"). Each board has
          <strong> buckets</strong> — columns like "To Do", "In Progress", "Done" — and each bucket holds
          <strong> task cards</strong>. Drag a card between buckets on the same board to move it along. To move a
          task to a <em>different</em> board, open the task and change its "Board" field instead.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">Tracking time</h2>
        <p>
          Every task card has a play button. Click it to start the clock; click it again (now a pause button) to
          pause. The elapsed time keeps counting even if you close the tab and come back later. To reset a task's
          time back to zero, open the task's extended view — it's the only place with a Reset control.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">Completing tasks</h2>
        <p>
          Check a task's checkbox (on the card or in its extended view) to mark it done. Completed tasks get
          greyed out with a strikethrough, their timer stops automatically, and they move into the bucket's
          collapsed "Completed (X)" section — click that text to expand or collapse it.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">Categories</h2>
        <p>
          Categories are per-board labels with a color, used to group and chart your tasks (e.g. "Work", "Family",
          "Health"). Manage a board's categories at the bottom of its page, and assign one to a task from its
          extended view.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">The Dashboard</h2>
        <p>
          The Dashboard tab shows analytics: completed and incomplete tasks by category, time spent by category,
          late (overdue, unfinished) tasks, and two effectiveness numbers — your on-time completion rate and story
          points completed per hour tracked. Pick a specific board from the dropdown to see its category
          breakdowns; late tasks and effectiveness are also available across all boards combined.
        </p>
        <p className="mt-2">
          <strong>Download logs</strong> exports a CSV activity log of everything that's happened across your
          tasks — created, updated, status changes, moves, timer events, and deletions — with a timestamp for
          each entry.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">Backing up your data</h2>
        <p>
          Since everything is stored locally, clearing your browser data would erase it. Use <strong>Export</strong>{' '}
          any time to download a full backup as a JSON file, and <strong>Import</strong> to restore it later or move
          it to another browser or device. Importing replaces everything currently in the app, so use it carefully.
        </p>
      </section>
    </div>
  )
}
