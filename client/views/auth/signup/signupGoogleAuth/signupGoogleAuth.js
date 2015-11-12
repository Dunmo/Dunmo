
var View = Template.signupGoogleAuth;

var googleBtnLoading = new ReactiveVar();

function isGmailAddress (email) {
  return email.substring(email.length-10, email.length) === '@gmail.com';
}

var options = {
  requestPermissions: ['email', 'profile', 'https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/tasks'],
  requestOfflineToken: true
};

function setPassword () {
  var password = Session.get('password');
  Meteor
  var user =
  Accounts.setPassword(, newPassword);
}

function callback (err) {
  if(err) {
    $('.notice').html(err.reason);
    googleBtnLoading.set(false);
  } else {
    setPassword();
    Router.go('app');
  }
}

function connectWithGoogle () {
  Meteor.connectWith('google', options, callback);
}

function loginWithGoogle () {
  Meteor.loginWithGoogle(options, callback);
}

function authWithGoogle () {
  if(Meteor.user()) {
    connectWithGoogle();
  } else {
    loginWithGoogle();
  }
}

View.onCreated(function () {
  googleBtnLoading.set(false);
});

View.helpers({
  loggedIn: function () {
    return Meteor.userId();
  },

  googleBtnLoading: function () {
    return googleBtnLoading.get();
  }
});

View.events({

  'click .btn-gplus': function (e) {
    googleBtnLoading.set(true);
    authWithGoogle();
  }

});
