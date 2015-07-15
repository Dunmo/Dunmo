
function rerender () {
  Session.set('renderTasks', true);
};

function setTime () {
  var time = Date.floorMinute(Date.now());
  if(Session.get('currentMinute') !== time) {
    Session.set('currentMinute', time);

    var lastRendered = Number(Session.get('lastRendered'));
    var tasks = Tasks.fetch({ snoozedUntil: { $gt: lastRendered, $lt: time } });
    if(tasks.length > 0) {
      Session.set('renderTasks', false);
      window.setTimeout(rerender, 1);
      Session.set('lastRendered', time);
    }
  }
  window.setTimeout(setTime, 1000)
};

Template.snoozedTaskView.onRendered(function () {
  if(Meteor.userId()){
    var user = Meteor.user();
    heap.identify({ name: user.profile.name,
                    email: user.primaryEmailAddress() });
  }

  Session.set('lastRendered', Date.floorMinute(Date.now()));

  rerender();

  window.setTimeout(setTime, 1000);
});

Template.snoozedTaskView.helpers({
  snoozedTodos: function () {
    return Meteor.user().fetchSnoozedTodos();
  },

  anySnoozedTodos: function () {
    return Meteor.user().fetchSnoozedTodos().count() > 0;
  },

  syncTitle: function () {
    return Session.get('isSyncing') ? 'Syncing Tasks...' : 'Sync Tasks';
  },

  faSpinClass: function () {
    return Session.get('isSyncing') ? 'fa-spin' : '';
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

Template.snoozedTaskView.events({
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
