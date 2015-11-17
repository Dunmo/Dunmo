
var btnLoading = new ReactiveVar();
var resetBtnDone = new ReactiveVar();
var usedGmailForReset = new ReactiveVar();
var googleBtnLoading = new ReactiveVar();
var savedPassword = '';

function isGmailAddress(email) {
  return email.substring(email.length-10, email.length) === '@gmail.com';
}

function synchronize(src, dest) {
  $('.nav-tabs > li').removeClass('active');
  $('.notice').html('');
  $(dest + '-link').addClass('active');
  $('form' + src).hide();
  if(dest === '.reset') {
    $('.social-login').hide();
    $('.reset-header').show();
  }
  else if(src === '.reset') {
    $('.social-login').show();
    $('.reset-header').hide();
  }
  $('form' + dest).show();
  var $src = $('form' + src);
  var $dest = $('form' + dest);
  var email = $src.find('input.email').val();
  var password = $src.find('input.password').val();
  if(password === undefined) password = savedPassword;
  else                       savedPassword = password;
  $dest.find('input.email').val(email);
  $dest.find('input.password').val(password);
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

Template.auth.onCreated(function () {
  btnLoading.set(false);
  resetBtnDone.set(false);
  usedGmailForReset.set(false);
  googleBtnLoading.set(false);
});

Template.auth.helpers({
  loggedIn: function () {
    return Meteor.userId();
  },

  googleBtnLoading: function () {
    return googleBtnLoading.get();
  },

  btnLoading: function () {
    return btnLoading.get();
  },

  resetBtnDone: function () {
    return resetBtnDone.get();
  },

  usedGmailForReset: function () {
    return usedGmailForReset.get();
  }
});

Template.auth.events({

  'click .signup-link': function (e) {
    if( $('.signup-link').hasClass('active') ) return false;
    else if( $('.login-link').hasClass('active') ) synchronize('.login', '.signup');
    else synchronize('.reset', '.signup');
  },

  'click .login-link': function (e) {
    if( $('.login-link').hasClass('active') ) return false;
    else if( $('.signup-link').hasClass('active') ) synchronize('.signup', '.login');
    else synchronize('.reset', '.login');
  },

  'click .reset-link': function (e) {
    synchronize('.login', '.reset');
  },

  'submit form.login, click form.login button.login': function (e, t) {
    e.preventDefault();
    btnLoading.set(true);

    var delay = 500;
    Meteor.setTimeout(function () {
      if(Meteor.userId() || Meteor.loggingIn()) {
        btnLoading.set(false);
        return false;
      }

      var $parent  = $('form.login');
      var email    = $parent.find('input.email').val();
      var password = $parent.find('input.password').val();

      if( !(email && password) ) {
        $('.notice').html('Email and Password are both required.');
        btnLoading.set(false);
        return;
      }

      if( ! RFC5322.isValidAddress(email) ) {
        $('.notice').html('Please enter a valid email address.');
        btnLoading.set(false);
        return;
      }

      Meteor.loginWithPassword(email, password, function (err) {
        if(err) {
          var reason = err.reason;
          if(reason === 'User has no password set') {
            reason = 'You used this address to authenticate with Google.' +
              ' Please log in with Google, or, if you create a password in' +
              ' the signup tab, the accounts will be linked automatically.';
          }
          $('.notice').html(reason);
          btnLoading.set(false);
        } else {
          Router.go('app');
        }
      });
    }, delay);
  },

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

  'submit form.reset, click form.reset button.reset': function (e, t) {
    e.preventDefault();
    btnLoading.set(true);

    var delay = 500;
    Meteor.setTimeout(function () {
      var email = $('form.reset').find('input.email').val();

      if( ! RFC5322.isValidAddress(email) ) {
        $('.notice').html('Please enter a valid email address.');
        btnLoading.set(false);
        return;
      }

      Accounts.forgotPassword({ email: email }, function (err) {
        btnLoading.set(false);
        if(err) {
          $('.notice').html(err.reason);
        } else {
          $('.notice').html('');
          resetBtnDone.set(true);
          if(isGmailAddress(email)) usedGmailForReset.set(true);
        }
      });
    }, delay);
  },

  'click .btn-gplus': function (e) {
    googleBtnLoading.set(true);
<<<<<<< HEAD:client/views/login/login.js

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

=======
>>>>>>> 552d00daa73471df503a67dda13a5af969e190c9:client/views/auth/auth.js
    authWithGoogle();
  }

});
