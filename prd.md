### Summary
A Kanban board app that works on the browser locally, tracks time on each task and displays elaborate dashboards and reports to show how much time was spent on each task.

Original intention is for a single user to track their own time.

### Requirements
- The hierarchy is as follows: board, bucket, task card. A bucket may contain from zero to multiple task cards. A board can contain from zero to multiple buckets. The tool itself contains at least one board, or more. 
- Task cards have the following fields: task name, task color/category, task status, person assigned to, due date, urgency (low, medium, high), importance (low, medium, high), description, attachments, story points, board it is assigned to.
- Clicking on a task card will provide an extensive view. On the top right of this window is an X button, which closes this extensive view.
- A task card has a play button on it, both in the minimal and extended view. Once the play button is clicked, a chronometer starts timing the task. Also, once the play button is clicked, it is replaced by a pause button. Once the pause button is clicked, this button is again replaced by a play button, but the time on the chronometer doesn"t reset. To reset the time to zero, the user has to go into the extended view. 
- Completed tasks can be either set as completed or their checkmark checked, both actions will set the task to be completed. Completed tasks will have a strikethrough font and be greyed out. Also, the clock will stop once a task is marked complete.
- Buckets contain task cards. They can be added new, removed and renamed. On the bottom of a bucket is an area for completed tasks which are hidden underneath a text "Completed (X)", with X denoting the number of tasks collapsed inside it. The collapsed tasks can be expanded and collapsed through clicking on this text. Once expanded, the task cards can be clicked on.
- Boards contain buckets. They can be added new, removed or renamed. Before a board is removed, a warning message comes up and says that everything inside the board will be permanently deleted.
- Task cards can be dragged and dropped between buckets, but not boards. To move a task card to a different board, the user has to click on the task card and change the value in the variable "Board".
- User is greeted through the board view first, where all the boards are displayed, and boards can be added, edited or removed. A user can click on a board to see its contents. Once in a board, there is a back arrow on the top left that can be clicked to return to the board view.
- There is also a dashboard view that can be accessed on the top pane. Once clicked, dashboards are revealed that analyze the tasks that are done. These are completed tasks by category (pie chart), incomplete tasks by category, late tasks, time spent on category and effectiveness.

- The visual language should look clean, but nice. You can imitate the visual language of Microsoft Planner.
- A dark mode option should also be offered.

### Preferred technology
- The simplest way to post the website without extra configuration is preferred. Github pages can be an example.

### What it doesn't do
- No login functionality is needed, since the tool will run offline.
- User data won't be saved remotely, but rather in a local file, so that when the page is closed and reopened, the data is not lost.