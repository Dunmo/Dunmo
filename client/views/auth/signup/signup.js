
var btnLoading = new ReactiveVar();
var googleBtnLoading = new ReactiveVar();

function isGmailAddress(email) {
  return email.substring(email.length-10, email.length) === '@gmail.com';
}

var options = {
  requestPermissions: ['email', 'profile', 'https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/tasks'],
  requestOfflineToken: true
};

function callback(err) {
  if(err) {
    $('.notice').html(err.reason);
    googleBtnLoading.set(false);
  } else {
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

Template.signup.onCreated(function () {
  btnLoading.set(false);
  googleBtnLoading.set(false);
});

Template.signup.helpers({
  loggedIn: function () {
    return Meteor.userId();
  },

  googleBtnLoading: function () {
    return googleBtnLoading.get();
  },

  btnLoading: function () {
    return btnLoading.get();
  }
});

Template.signup.events({

  'submit form.signup, click form.signup button.signup': function (e, t) {
    e.preventDefault();
    btnLoading.set(true);

    var delay = 500;
    Meteor.setTimeout(function () {
      if(Meteor.userId() || Meteor.loggingIn()) {
        btnLoading.set(false);
        return false;
      }

      var $parent  = $('form.signup');
      var name     = $parent.find('input.name').val();
      var email    = $parent.find('input.email').val();
      var password = $parent.find('input.password').val();

      if( !(name && email && password) ) {
        $('.notice').html('All fields are required.');
        btnLoading.set(false);
        return;
      }

      if( ! RFC5322.isValidAddress(email) ) {
        $('.notice').html('Please enter a valid email address.');
        btnLoading.set(false);
        return;
      }

      Accounts.createUser({
        password: password,
        email: email,
        profile: {
          name: name
        }
      }, function (err) {
        if(err) {
          $('.notice').html(err.reason);
          btnLoading.set(false);
        } else {
          Router.go('app');
        }
      });
    }, delay);
  },

  'click .btn-gplus': function (e) {
    googleBtnLoading.set(true);

    var options = {
      requestPermissions: ['email', 'profile', 'https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/tasks'],
      requestOfflineToken: true
    };

    function callback(err) {
      if(err) {
        $('.notice').html(err.reason);
        googleBtnLoading.set(false);
      } else {
        Router.go('app');
      }
    }

    authWithGoogle();
  }

});
