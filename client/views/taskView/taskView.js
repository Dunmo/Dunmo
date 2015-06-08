
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
  Session.set('snoozeActive', '');
  resetTaskListItemWidths();

  function rerender () {
    Session.set('renderTasks', true);
    resetTaskListItemWidths();
  };

  function setTime () {
    var time = Date.floorMinute(Date.now());
    if(Session.get('currentMinute') !== time) {
      Session.set('renderTasks', false);
      Session.set('currentMinute', time);
      window.setTimeout(rerender, 1);
    }
    window.setTimeout(setTime, 1000)
  };

  window.setTimeout(setTime, 1000);
});

Template.taskView.helpers({
  tasks: function () {
    return Meteor.user().sortedTodos();
  },

  noTasks: function () {
    return Meteor.user().sortedTodos().count() == 0;
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
