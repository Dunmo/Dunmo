
var btnLoading = new ReactiveVar();
var googleBtnLoading = new ReactiveVar();

function synchronize(src, dest) {
  $('.nav-tabs > li').removeClass('active');
  $('.notice').html('');
  $(dest + '-link').addClass('active');
  $('form' + src).hide();
  $('form' + dest).show();
  var $src = $('form' + src);
  var email = $src.find('input.email').val();
  var password = $src.find('input.password').val();
  var $dest = $('form' + dest);
  $dest.find('input.email').val(email);
  $dest.find('input.password').val(password);
}

Template.login.onCreated(function () {
  btnLoading.set(false);
  googleBtnLoading.set(false);
});

Template.login.helpers({
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

Template.login.events({

  'click .signup-link': function (e) {
    synchronize('.login', '.signup');
  },

  'click .login-link': function (e) {
    synchronize('.signup', '.login');
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
          $('.notice').html(err.reason);
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

  'click .btn-gplus': function (e) {
    googleBtnLoading.set(true);

    var options = {
      requestPermissions: ['email', 'profile', 'https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/tasks'],
      requestOfflineToken: true,
      loginStyle: 'popup'
    };

    function callback(err) {
      if(err) {
        $('.notice').html(err.reason);
        googleBtnLoading.set(false);
      } else {
        Router.go('app');
      }
    }

    if(Meteor.user()) {
      Meteor.connectWith('google', options, callback);
    } else {
      Meteor.loginWithGoogle(options, callback);
    }
  }

});
