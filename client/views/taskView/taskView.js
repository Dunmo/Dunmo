
Template.calendarSettings.rendered = function () {
  heap.identify({ name: Meteor.user().profile.name,
                  email: Meteor.user().services.google.email });
};

Template.taskView.helpers({
  tasks: function() {
    return Meteor.user().sortedTodos();
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

  'click #syncWithCalendar': gapi.handleAuthClick(gapi.syncTasksWithCalendar)
});
