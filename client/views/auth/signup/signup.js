
let View = Template.signup;

let btnLoading = new ReactiveVar();
const delay    = 500;

View.onCreated(function () { return btnLoading.set(false) });

View.helpers({
  loggedIn:   () => { return Meteor.userId()  },
  btnLoading: () => { return btnLoading.get() },
});

View.events({

  'submit form.signup, click form.signup button.signup': (e, t) => {
    e.preventDefault();
    btnLoading.set(true);

    Meteor.setTimeout(() => {
      if(Meteor.userId() || Meteor.loggingIn()) {
        btnLoading.set(false);
        return false;
      }

      const $parent  = $('form.signup');
      const name     = $parent.find('input.name').val();
      const email    = $parent.find('input.email').val();
      const password = $parent.find('input.password').val();

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
        },
      }, err => {
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
