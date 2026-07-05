export function AboutView() {
  return (
    <div className="mx-auto max-w-3xl p-6 text-gray-700 dark:text-gray-300">
      <h1 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-gray-100">About ChronoKanban</h1>

      <p className="mb-4">
        In my experience, the utility value of a Kanban board can not be understated. Used by teams around the
        world regardless of methodology, it is something so prevalent that we take it for granted. In the end,
        everyone needs a ToDo list.
      </p>

      <p className="mb-4">
        Not only is it beneficial for teams, but also for individuals. In the time that I was working in my last
        job, my personal Kanban board was the thing that kept me sane while I was juggling through seven different
        tasks and more tasks kept coming onto my plate.
      </p>

      <p className="mb-4">
        So when I left my last company and subsequently lost access to my Microsoft Planner instance, I thought
        finding a new tool that works just as well should be easy enough, right? After all, for something that is
        so popular and thoroughly implemented as a Kanban board, there should be no room for further reinvention or
        discovery. Well, I was wrong, because I struggled for a long time to find something powerful, flexible,
        easy to use, free of charge and without any compromise.
      </p>

      <p className="mb-4">
        With the ascent of vibe coding, this was the first problem I wanted to solve - a powerful, free and open
        source Kanban board that doesn't store any user data remotely. With time tracking and dashboard
        functionalities, activity logging and multiple boards, it does slightly more than what a typical Kanban
        board app does. This is ChronoKanban.
      </p>

      <p className="mb-2">But what can you really do with it?</p>

      <ul className="mb-4 list-disc space-y-3 pl-5">
        <li>
          Imagine your boss calls you and asks you about what you've been working on past month. Now imagine that
          you had not been documenting that, so now you have to sit down for an hour and make up some hours on a
          spreadsheet. That would be stressful at the very least. ChronoKanban does this for you automatically, so
          long as you are using the timer function consistently. Just go to the dashboard section, select the
          board and download the .csv logs. Open the .csv file in excel, do some formatting and voila - you have
          your report within minutes.
        </li>
        <li>
          Ever wonder how you've been spending your time amongst all your responsibilities? ChronoKanban has you
          covered with a growing number of dashboards.
        </li>
        <li>
          Applying for too many jobs and now you got a call from one, not knowing what you applied to? Fear not,
          you can make yourself a new board exclusively for tracking job applications. Every time you apply to a
          new job, simply copy-paste the job description and other important details into a new task card. Now you
          still have access to all the key information even if the job page is removed. You can also move the
          task cards between buckets and have better visibility of your efforts.
        </li>
      </ul>

      <p>
        You get all of these benefits for free, without giving any personal data. Of course, in life nothing is
        free - you'll need to invest the time and effort to really get the benefit of all the functionalities. But
        in the end I think it might be worth a try :)
      </p>
    </div>
  )
}
