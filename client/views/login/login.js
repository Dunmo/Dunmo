
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
};

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

  'click form.login button.login': function (e) {
    console.log('e: ', e);

  },

  'click form.signup button.signup': function (e) {
    console.log('e: ', e);

  },

  'click .btn-gplus': function (e) {
    Meteor.loginWithGoogle({
      requestPermissions: ["email", "profile", "https://www.googleapis.com/auth/calendar", "https://www.googleapis.com/auth/tasks"],
      requestOfflineToken: true,
      loginStyle: "popup"
    }, function (err) {
      if (err) Session.set('errorMessage', err.reason || 'Unknown error');
      else     location.href = '/taskView';
    });
  }

});
