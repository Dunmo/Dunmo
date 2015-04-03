
Template.nav.events({
  'click .sync': function () {
    gapi.syncTasksWithCalendar();
  },

  'click .logout': function (e) {
    Meteor.logout();
    FlowRouter.go('/');
  }
});
