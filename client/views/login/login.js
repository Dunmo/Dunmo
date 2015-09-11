
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

Template.login.helpers({
  'loggedIn': function() {
    return Meteor.userId();
  }
});

Template.login.events({

  'click .signup-link': function (e) {
    synchronize('.login', '.signup');
  },

  'click .login-link': function (e) {
    synchronize('.signup', '.login');
  },

  'submit form': function (e) {
    e.preventDefault();
  },

  'submit form.login, click form.login button.login': function (e, t) {
    if(Meteor.userId() || Meteor.loggingIn()) return false;
    console.log('logging in...');
    var $parent  = $('form.login');
    var email    = $parent.find('input.email').val();
    var password = $parent.find('input.password').val();

    if( !(email && password) ) {
      $('.notice').html('Email and Password are both required.');
      return;
    }

    Meteor.loginWithPassword(email, password, function (err) {
      if(err) $('.notice').html(err.reason);
      else    Router.go('app');
    });
  },

  'submit form.signup, click form.signup button.signup': function (e, t) {
    if(Meteor.userId() || Meteor.loggingIn()) return false;

    var $parent  = $('form.signup');
    var name     = $parent.find('input.name').val();
    var email    = $parent.find('input.email').val();
    var password = $parent.find('input.password').val();

    if( !(name && email && password) ) return;

    Accounts.createUser({
      password: password,
      email: email,
      profile: {
        name: name
      }
    }, function (err) {
      if(err) $('.notice').html(err.reason);
      else    Router.go('app');
    });
  },

  'click .btn-gplus': function (e) {
    var options = {
      requestPermissions: ['email', 'profile', 'https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/tasks'],
      requestOfflineToken: true,
      loginStyle: 'popup'
    };

    function callback(err) {
      if (err) Session.set('errorMessage', err.reason || 'Unknown error');
      else     Router.go('app');
    }

    if(Meteor.user()) {
      Meteor.connectWith('google', options, callback);
    } else {
      Meteor.loginWithGoogle(options, callback);
    }
  }

});
