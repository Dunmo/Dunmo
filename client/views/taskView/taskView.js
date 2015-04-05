
Template.calendarSettings.rendered = function () {
  heap.identify({ name: Meteor.user().profile.name,
                  email: Meteor.user().services.google.email });
  jQuery( function () {
    $(document).on("onboarded:flow:afterComplete", function (e, flow, step) {
      $(".overlay").addClass("hidden")
    });
  });


};

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
