
Template.taskView.helpers({
  tasks: function() {
    return Meteor.user().sortedTodos();
  }
});

Template.taskView.events({
  'click #submit': function (e) {
    var str = $('#input').val();
    Tasks.create(str, { ownerId: Meteor.userId() });
  },

  'click #syncWithCalendar': gapi.handleAuthClick(gapi.syncTasksWithCalendar)
});
