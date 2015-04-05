
Template.nav.events({
  'click .sync': function () {
    gapi.syncTasksWithCalendar();
  },

  'click .logout': function (e) {
    var _ = Meteor.logout();
    FlowRouter.go('/index.html');
  }
});
