
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

      location.href = '/gettingStarted';
    });
  },

  // 'click .btn-appl': function (e) {
  //   // update the user object with the username and password
  //   Meteor.user().setAppleCredentials({
  //     appleId:  'jjman505@gmail.com',
  //     password: 'hesus to the rescue G 23'
  //   });

  //   var user = Meteor.user();
  //   user.loginWithApple();
  //   console.log('tasks: ', user.tasks());
  // },
});
