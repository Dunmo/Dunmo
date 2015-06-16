
function rerender () {
  Session.set('renderTasks', true);
};

function setTime () {
  var time = Date.floorMinute(Date.now());
  if(Session.get('currentMinute') !== time) {
    Session.set('currentMinute', time);

    var lastRendered = Number(Session.get('lastRendered'));
    var tasks = Tasks.fetch({ snoozedUntil: { $gt: lastRendered } });
    if(tasks.any(function (t) { return t.snoozedUntil < time; })) {
      Session.set('renderTasks', false);
      window.setTimeout(rerender, 1);
      Session.set('lastRendered', time);
    }
  }
  window.setTimeout(setTime, 1000)
};

Template.taskView.onRendered(function () {
  if(Meteor.userId()){
    var user = Meteor.user();
    heap.identify({ name: user.profile.name,
                    email: user.primaryEmailAddress() });

    // if(!user.hasOnboarded('taskView')) {
    //   Tasks.create([
    //     'Mark this task done by clicking the green check button for 5 minutes due at midnight somewhat important',
    //     'Snooze this task by clicking the yellow button for 5 minutes due at midnight somewhat important',
    //     'Delete this task by clicking the red button for 5 minutes due at midnight somewhat important',
    //     'Edit this task by clicking the grey button for 5 minutes due at midnight somewhat important',
    //     'Add more tasks using the inputs above for 5 minutes due at midnight somewhat important',
    //     'Check your Google calendar to see your tasks for 5 minutes due at midnight somewhat important',
    //     'Click the sync tasks action in the upper right if your calendar events change for 5 minutes due at midnight somewhat important',
    //     'Check out the settings page for more options for 5 minutes due at midnight somewhat important'
    //   ], { ownerId: user._id });
    //   user.setHasOnboarded('taskView', true);
    // }

    if(user.lastReviewed() < Date.startOfToday()) {
      console.log('setting tasks to review...');
      Tasks.setNeedsReviewed();
      user.setLastReviewed(Date.now());
    }
  }

  Session.set('lastRendered', Date.floorMinute(Date.now()));
  Session.set('snoozeActive', '');

  rerender();

  window.setTimeout(setTime, 1000);
});

Template.taskView.helpers({
  tasks: function () {
    return Meteor.user().unsnoozedTodos();
  },

  noTasks: function () {
    return Meteor.user().unsnoozedTodos().count() == 0;
  },

  recentTasks: function () {
    return Meteor.user().recentTodos();
  },

  anyRecentTasks: function () {
    return Meteor.user().recentTodos().count() > 0;
  },

  upcomingTasks: function () {
    return Meteor.user().upcomingTodos();
  },

  anyUpcomingTasks: function () {
    return Meteor.user().upcomingTodos().count() > 0;
  },

  syncTitle: function () {
    return Session.get('isSyncing') ? 'Syncing Tasks...' : 'Sync Tasks';
  },

  faSpinClass: function () {
    return Session.get('isSyncing') ? 'fa-spin' : '';
  },

  hasOnboarded: function () {
    return Meteor.user().hasOnboarded('taskView');
  },

  renderTasks: function () {
    return Session.get('renderTasks');
  },

  anyActiveTags: function () {
    return user.activeTags().count();
  },

  activeTags: function () {
    return user.activeTags();
  }

});

Template.taskView.events({
  'click .sync': function () {
    gapi.syncTasksWithCalendar();
  },

  'click #submit': function (e) {
    var str = $('#input').val();
    Tasks.create(str, { ownerId: Meteor.userId() });
  },

  'click #syncWithCalendar': function () {
    gapi.syncTasksWithCalendar();
  }
});
