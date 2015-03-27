
Template.login.helpers({
  'loggedIn': function() {
    return Meteor.userId();
  }
});

Template.login.events({
  'click .btn-gplus': function (e) {
    Meteor.loginWithGoogle({
      requestPermissions: ["email", "profile", "https://www.googleapis.com/auth/calendar", "https://www.googleapis.com/auth/tasks"],
      requestOfflineToken: true,
      loginStyle: "popup"
    }, function (err) {
      if (err) Session.set('errorMessage', err.reason || 'Unknown error');

      gapi.loadDunmoCalendar(function () {
        location.href = '/taskView';
      });
    });
  }
});
