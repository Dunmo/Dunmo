
Template.nav.events({
  'click .logout': function (e) {
    var _ = Meteor.logout();
    FlowRouter.go('/index.html');
  },

  'click .taskView': function (e) {
    csFlow.dismissFlow();
    location.href = '/taskView';
  },

  'click .calendarSettings': function (e) {
    tvFlow.dismissFlow();
    location.href = '/calendarSettings';
  }
});
