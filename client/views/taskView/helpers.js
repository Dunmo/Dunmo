
resetTaskListItemWidths = function () {
  window.setTimeout(function () {
    $('.task .title').width(Math.ceil(_.max($('.task .title .task-text').toArray().map(function (obj) { return $(obj).width() })))+24);
  }, 100);
};

var onboardingTitles = [
  'Mark this task done by clicking the green check button',
  'Snooze this task by clicking the yellow button',
  'Delete this task by clicking the red button',
  'Edit this task by clicking the grey button',
  'Add more tasks using the inputs above',
  'Check your Google calendar to see your tasks',
  'Click the sync tasks action in the upper right if your calendar events change',
  'Check out the settings page for more options'
];

function onboardingTask (title) {
  return title + ' for 5 minutes due someday no importance';
};

setOnboardingTasks = function () {
  console.log('setting ob tasks...');
  var user = Meteor.user();

  var maxOnboardingTasks = 4;
  var numExistingTasks   = user.onboardingTasks().count();
  var numNewTasks        = maxOnboardingTasks - numExistingTasks;

  var start    = user.onboardingIndex();
  var end      = start + numNewTasks;
  var inBounds = _.bound(0, onboardingTitles.length);
  start        = inBounds(start);
  end          = inBounds(end);

  var titles = onboardingTitles.slice(start, end);
  var tasks  = titles.map(function (t) { return onboardingTask(t); });

  if(tasks.length > 0) {
    Tasks.create(tasks, { ownerId: user._id, isOnboardingTask: true });
  }

  if(start >= onboardingTitles.length) user.setHasOnboarded('taskView', true);

  user.setOnboardingIndex(end);

  resetTaskListItemWidths();
};
