
let btnLoading = new ReactiveVar();
const delay    = 500;

let View = Template.resetPassword;

View.onCreated(function () { btnLoading.set(false) });

View.helpers({
  btnLoading: () => { btnLoading.get() },
});

View.events({

  'submit form.reset-password, click form.reset-password button.reset-password': (e, t) => {
    e.preventDefault();
    btnLoading.set(true);

    Meteor.setTimeout(() => {
      if(Meteor.userId() || Meteor.loggingIn()) {
        btnLoading.set(false);
        return false;
      }

      const $parent = $('form.reset-password');
      const password = $parent.find('input.password').val();
      const passwordConfirm = $parent.find('input.password-confirm').val();

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

      const token = Session.get('resetToken');

      Accounts.resetPassword(token, password, err => {
        if(err) {
          $('.notice').html(err.reason);
          btnLoading.set(false);
        } else {
          Router.go('app');
        }
      });
    }, delay);
  },
});
