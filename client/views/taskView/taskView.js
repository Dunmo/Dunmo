
Template.taskView.rendered = function () {
  if(Meteor.userId()){
    var user = Meteor.user();
    heap.identify({ name: user.profile.name,
                    email: user.primaryEmailAddress() });
  }
};

Template.taskView.helpers({
  tasks: function () {
    return Meteor.user().sortedTodos();
  },

  anyTasks: function () {
    return Meteor.user().sortedTodos().count() > 0;
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
