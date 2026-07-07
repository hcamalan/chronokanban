import type { ReactNode } from 'react'

interface ChapterProps {
  title: string
  children: ReactNode
}

function Chapter({ title, children }: ChapterProps) {
  return (
    <details className="mb-3 rounded-lg border border-gray-200 dark:border-gray-700">
      <summary className="cursor-pointer select-none rounded-lg px-4 py-3 text-lg font-medium text-gray-900 hover:bg-gray-50 dark:text-gray-100 dark:hover:bg-gray-800">
        {title}
      </summary>
      <div className="space-y-3 border-t border-gray-200 px-4 py-3 dark:border-gray-700">{children}</div>
    </details>
  )
}

function SubChapter({ title, children }: ChapterProps) {
  return (
    <div>
      <h3 className="mb-1 font-medium text-gray-800 dark:text-gray-200">{title}</h3>
      <div>{children}</div>
    </div>
  )
}

export function HowToView() {
  return (
    <div className="mx-auto max-w-3xl p-6 text-sm text-gray-700 dark:text-gray-300">
      <h1 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-gray-100">How to use ChronoKanban</h1>

      <p className="mb-6">
        ChronoKanban is the task tracking tool you didn't know you needed. It's a Kanban board with built-in time
        tracking, analytics dashboards, and a calendar view - running entirely in your browser, with no account,
        no server, and nothing ever sent anywhere.
      </p>

      <p className="mb-6">
        ChronoKanban is built for individual use, not for coordinating a team. Because all data lives only in your
        own browser with nothing shared or synced, there's no practical way for multiple people to see or work
        from the same board - trying to use it as a team's shared tracker won't work the way a server-backed tool
        would. The <strong>Assignee</strong> field on task cards is still there, though - not as a step toward
        team features, but simply to give you the flexibility to use it however suits you, even on a personal
        board.
      </p>

      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">Use cases</h2>
        <ul className="list-disc space-y-3 pl-5">
          <li>
            <strong>Effortless time reports.</strong> Asked what you worked on last month with nothing to show for
            it? Track your tasks as you go and let ChronoKanban build the report for you - open the Dashboard,
            pick a board, and download a ready-to-share CSV timesheet in seconds.
          </li>
          <li>
            <strong>See where your time actually goes.</strong> The Dashboard's configurable chart and calendar
            view turn weeks of scattered work into a clear picture of how your time is split across categories,
            statuses, and priorities.
          </li>
          <li>
            <strong>A tracker for anything with moving parts.</strong> Job applications, house projects, side
            hustles, errands - spin up a dedicated board in seconds, capture every detail on a card, and always
            know exactly where things stand.
          </li>
          <li>
            <strong>Private by design.</strong> No sign-up, no account, no data ever leaving your browser - and it
            keeps working with no internet connection at all once it's loaded.
          </li>
        </ul>
      </section>

      <Chapter title="The example board">
        <p>
          The first time you open ChronoKanban, you'll see a worked example board ("Software Engineering (Sample
          board)") with dozens of realistic tasks already tracked, so the dashboard and calendar aren't staring
          back at you empty. It's a normal board - delete it like any other whenever you're ready to start your
          own. If you ever use Settings → <strong>Delete all my data</strong> to wipe everything, it comes back
          automatically.
        </p>
      </Chapter>
      
      <Chapter title="Boards, buckets & tasks">
        <p>
          A <strong>board</strong> is a project or area of your life (e.g. "Work" or "Home"). Each board has{' '}
          <strong>buckets</strong> - columns like "To Do", "In Progress", "Done" - and each bucket holds{' '}
          <strong>task cards</strong>.
        </p>
        <p>
          Drag a card between buckets on the same board to move it along, and drag boards or buckets themselves to
          reorder them. To move a task to a <em>different</em> board, open the task and change its "Board" field
          instead.
        </p>
      </Chapter>

      <Chapter title="Tracking time">
        <SubChapter title="Starting and pausing">
          <p>
            Every task card has a play button. Click it to start the clock; click it again (now a pause button) to
            pause. The elapsed time keeps counting even if you close the tab and come back later.
          </p>
        </SubChapter>
        <SubChapter title="Correcting elapsed time">
          <p>
            Forgot to start or stop the timer? A task's extended view has an editable <strong>Time elapsed</strong>{' '}
            field (H:MM) - type in the correct total and it's applied immediately. The difference is credited to
            today in the timesheet download, so your report stays accurate even after a correction.
          </p>
        </SubChapter>
        <SubChapter title="Resetting">
          <p>To reset a task's time back to zero, open its extended view - it's the only place with a Reset control.</p>
        </SubChapter>
        <SubChapter title="Estimates">
          <p>
            Give a task an <strong>Estimated hours</strong> value and ChronoKanban shows how tracked time compares
            - inline in the task view (red when you've gone over), and on the Dashboard as an average across
            completed tasks, so you learn how accurate your estimates really are.
          </p>
        </SubChapter>
      </Chapter>

      <Chapter title="Organizing & finding tasks">
        <SubChapter title="Categories">
          <p>
            Categories are per-board labels with a color, used to group and chart your tasks (e.g. "Work",
            "Family", "Health"). Manage a board's categories at the bottom of its page, and assign one to a task
            from its extended view.
          </p>
        </SubChapter>
        <SubChapter title="Urgency & importance">
          <p>Tag a task's urgency and importance from its extended view to prioritize and filter by them later.</p>
        </SubChapter>
        <SubChapter title="Sub-tasks">
          <p>Break a task down into a checklist of smaller steps from its extended view.</p>
        </SubChapter>
        <SubChapter title="Descriptions">
          <p>
            Task descriptions support <strong>markdown</strong> - links, bold, and lists render automatically, and
            links open in a new tab. Click the rendered text to edit it.
          </p>
        </SubChapter>
        <SubChapter title="Assignee">
          <p>
            Assign a task to someone in its extended view - names you've used before are suggested as you type.
          </p>
        </SubChapter>
        <SubChapter title="Recurring due dates">
          <p>
            Turn on "Repeat" on a task's due date to have it recur on a fixed interval (e.g. every 2 weeks) once
            completed.
          </p>
        </SubChapter>
        <SubChapter title="Search & bulk actions">
          <p>
            Press <strong>/</strong> or use the search box on a board to filter its tasks instantly. Click{' '}
            <strong>Select</strong> to check off multiple tasks at once and move, complete, or delete them
            together.
          </p>
        </SubChapter>
      </Chapter>

      <Chapter title="Completing tasks">
        <p>
          Check a task's checkbox (on the card or in its extended view) to mark it done. Completed tasks get
          greyed out with a strikethrough, their timer stops automatically, and they move into the bucket's
          collapsed "Completed (X)" section - click that text to expand or collapse it.
        </p>
      </Chapter>

      <Chapter title="Today view">
        <p>
          The <strong>Today</strong> tab (or the <strong>T</strong> key) is your daily agenda across all boards:
          what's running right now, what's due today, what's overdue, what you've already completed today - and a
          live total of the time you've tracked so far. If any timers are running, a banner at the top lets you
          pause all of them (or just the ones that have been running unusually long) in one click.
        </p>
      </Chapter>

      <Chapter title="Dashboard & Calendar">
        <SubChapter title="Effectiveness tiles">
          <p>
            Three headline numbers: your on-time completion rate, story points completed per hour tracked, and how
            your tracked time compares to your estimates.
          </p>
        </SubChapter>
        <SubChapter title="Configurable chart">
          <p>
            Choose what to <strong>measure</strong> (number of tasks, time spent, or story points), what to{' '}
            <strong>group by</strong> (category, status, importance, urgency, or late), and which tasks to include
            via the filter dropdowns - then view it as a bar or pie chart. Pick a specific board to break down by
            category; grouping by status/urgency/importance/late also works across all boards combined.
          </p>
        </SubChapter>
        <SubChapter title="Calendar view">
          <p>
            Switch to day, 3-day, week, or month view to see bars for what you worked on, what's due, and what's
            overdue, laid out on a real calendar.
          </p>
        </SubChapter>
        <SubChapter title="Exporting">
          <p>
            Download the chart or calendar as a PNG image directly from their own download button, or use{' '}
            <strong>Download report</strong> to export a full CSV timesheet - one row per day and task you tracked
            time on, with hours spent and the task's status at the end of that day. (Only time tracked with the
            timer is included, from when this feature was added onward.)
          </p>
        </SubChapter>
      </Chapter>

      <Chapter title="Keyboard shortcuts">
        <p>
          ChronoKanban has a full set of keyboard shortcuts for creating boards/buckets/tasks, navigating, undo,
          and more. Click <strong>Hotkeys</strong> in the top bar, or press <strong>?</strong>, to see the full
          list at any time.
        </p>
      </Chapter>

      <Chapter title="Preferences">
        <p>
          Open <strong>Settings</strong> in the top bar to adjust dark mode, bucket width, date format, a
          colorblind-safe color mode, and whether task descriptions show directly on their cards.
        </p>
        <p>
          You can also enable <strong>desktop notifications</strong> there: ChronoKanban will warn you when a
          timer has been running for over 8 hours, and give you a once-a-day summary of tasks due today or
          overdue. Since there's no server, notifications only fire while the app is open in a tab.
        </p>
      </Chapter>

      <Chapter title="Backing up your data">
        <p>
          Since everything is stored locally, clearing your browser data would erase it. Use <strong>Export</strong>{' '}
          any time to download a full backup as a JSON file, and <strong>Import</strong> to restore it later or move
          it to another browser or device. Importing replaces everything currently in the app, so use it carefully.
        </p>
        <p>
          If it's been more than a week since your last export, the Boards page shows a gentle reminder (after a
          few days' grace period on a brand-new install) - take it seriously: a browser cleanup can wipe local
          data without asking.
        </p>
      </Chapter>

      <Chapter title="Working offline">
        <p>
          ChronoKanban makes no network calls of any kind - all your data lives in this browser's local storage.
          Once you've loaded it here, it keeps working with no internet connection at all, and it can be installed
          like an app from your browser's menu.
        </p>
        <p>
          To run it on a machine with no internet access whatsoever, download the source, run{' '}
          <code className="rounded bg-gray-100 px-1 dark:bg-gray-800">npm run build</code>, and serve the resulting{' '}
          <code className="rounded bg-gray-100 px-1 dark:bg-gray-800">dist/</code> folder locally - no further
          setup or connection is required.
        </p>
      </Chapter>
    </div>
  )
}
