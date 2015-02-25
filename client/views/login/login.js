
Template.login.events({
  'click .btn-goog': function (e) {
    Meteor.loginWithGoogle({
      requestPermissions: ["email", "profile", "https://www.googleapis.com/auth/calendar", "https://www.googleapis.com/auth/tasks"],
      requestOfflineToken: true,
      loginStyle: "popup"
    }, function (err) {
      if (err)
        Session.set('errorMessage', err.reason || 'Unknown error');
    });
  },

  'click .btn-appl': function (e) {
    // update the user object with the username and password
    Meteor.user().updateAppleCredentials({
      email: 'jjman505@gmail.com',
      password: 'hesus to the rescue G 23'
    });
    Meteor.user().loginWithApple();
  }
});
