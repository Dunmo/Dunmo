
var btnLoading = new ReactiveVar();

var View = Template.resetPassword;

View.onCreated(function () {
  btnLoading.set(false);
});

View.helpers({
  btnLoading: function () {
    return btnLoading.get();
  }
});

View.events({

  'submit form.reset-password, click form.reset-password button.reset-password': function (e, t) {
    e.preventDefault();
    btnLoading.set(true);

    var delay = 500;
    Meteor.setTimeout(function () {
      if(Meteor.userId() || Meteor.loggingIn()) {
        btnLoading.set(false);
        return false;
      }

      var $parent = $('form.reset-password');
      var password = $parent.find('input.password').val();
      var passwordConfirm = $parent.find('input.password-confirm').val();

      if( !(password && passwordConfirm) ) {
        $('.notice').html('Both fields are required.');
        btnLoading.set(false);
        return;
      }

      if( password !== passwordConfirm ) {
        $('.notice').html('Passwords must match.');
        btnLoading.set(false);
        return;
      }

      var token = Session.get('resetToken');

      Accounts.resetPassword(token, password, function (err) {
        if(err) {
          $('.notice').html(err.reason);
          btnLoading.set(false);
        } else {
          Router.go('app');
        }
      });
    }, delay);
  }
});
