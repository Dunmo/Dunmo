
Template.taskView.helpers({
  tasks: function() {
    return Tasks.find({ ownerId: Meteor.userId() });
  }
});

Template.taskView.events({
  'click #submit': function (e) {
    var str = $('#input').val();
    Tasks.create(str, { ownerId: Meteor.userId() });
  },

  'click #syncWithCalendar': gapi.handleAuthClick(gapi.syncTasksWithCalendar)
});
