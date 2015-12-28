
const View = Template.resetPassword;
const delay = 500;

View.onCreated(function () {
  Template.instance().btnLoading = new ReactiveVar(false);
});

View.helpers({
  btnLoading: () => { return Template.instance().btnLoading.get() },
});

View.events({

  'submit form.reset-password, click form.reset-password button.reset-password': (e, t) => {
    e.preventDefault();
    const btnLoading = Template.instance().btnLoading;
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
