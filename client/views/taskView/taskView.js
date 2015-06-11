
function rerender () {
  Session.set('renderTasks', true);
  resetTaskListItemWidths();
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

    if(user.lastReviewed() < Date.startOfToday()) {
      console.log('setting tasks to review...');
      Tasks.setNeedsReviewed();
      user.setLastReviewed(Date.now());
    }

    $(document).on("onboarded:flow:afterComplete", function (e, flow, step) {
      $(".overlay").addClass("hidden")
    });
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
