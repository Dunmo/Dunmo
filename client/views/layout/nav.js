
Template.nav.events({
  'click .logout': function (e) {
    var _ = Meteor.logout();
    location.href = '/index.html';
  },

  'click .taskView': function (e) {
    location.href = '/taskView';
  },

  'click .snoozedTaskView': function (e) {
    location.href = '/snoozedTaskView';
  },

  'click .calendarSettings': function (e) {
    location.href = '/calendarSettings';
  }
});
