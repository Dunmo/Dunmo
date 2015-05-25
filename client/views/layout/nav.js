
Template.nav.events({
  'click .logout': function (e) {
    var _ = Meteor.logout();
    FlowRouter.go('/index.html');
  }
});
