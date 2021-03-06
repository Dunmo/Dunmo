
let View = Template.login;

let btnLoading        = new ReactiveVar();
let resetBtnDone      = new ReactiveVar();
let usedGmailForReset = new ReactiveVar();
let savedPassword     = '';
const delay           = 500;

function synchronize(src, dest) {
  $('.nav-tabs > li').removeClass('active');
  $('.notice').html('');
  $(`${dest}-link`).addClass('active');
  $(`form${src}`).hide();
  if(dest === '.reset') {
    $('.social-login').hide();
    $('.reset-header').show();
  }
  else if(src === '.reset') {
    $('.social-login').show();
    $('.reset-header').hide();
  }
  $('form' + dest).show();
  const $src   = $(`form${src}`);
  const $dest  = $(`form${dest}`);
  const email  = $src.find('input.email').val();
  let password = $src.find('input.password').val();
  if(_.isUndefined(password)) password = savedPassword;
  else                        savedPassword = password;
  $dest.find('input.email').val(email);
  $dest.find('input.password').val(password);
}

View.onCreated(function () {
  btnLoading.set(false);
  resetBtnDone.set(false);
  usedGmailForReset.set(false);
});

View.onRendered(function () {
  if(window.location.hash === '#reset') synchronize('.login', '.reset');
});

View.helpers({
  loggedIn          () { return Meteor.userId()         },
  btnLoading        () { return btnLoading.get()        },
  resetBtnDone      () { return resetBtnDone.get()      },
  usedGmailForReset () { return usedGmailForReset.get() },
});

View.events({

  'click .login-link': e => {
    if( $('.login-link').hasClass('active') ) return false;
    synchronize('.reset', '.login');
  },

  'click .reset-link': e => {
    synchronize('.login', '.reset');
  },

  'submit form.login, click form.login button.login': (e, t) => {
    e.preventDefault();
    btnLoading.set(true);

    Meteor.setTimeout(() => {
      if(Meteor.userId() || Meteor.loggingIn()) {
        btnLoading.set(false);
        return false;
      }

      const $parent  = $('form.login');
      const email    = $parent.find('input.email').val();
      const password = $parent.find('input.password').val();

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

      Meteor.loginWithPassword(email, password, err => {
        if(err) {
          let reason = err.reason;
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

  'submit form.reset, click form.reset button.reset': (e, t) => {
    e.preventDefault();
    btnLoading.set(true);

    Meteor.setTimeout(() => {
      const email = $('form.reset').find('input.email').val();

      if( ! RFC5322.isValidAddress(email) ) {
        $('.notice').html('Please enter a valid email address.');
        btnLoading.set(false);
        return;
      }

      Accounts.forgotPassword({ email: email }, err => {
        btnLoading.set(false);
        if(err) {
          $('.notice').html(err.reason);
        } else {
          $('.notice').html('');
          resetBtnDone.set(true);
          if(Helpers.isGmailAddress(email)) usedGmailForReset.set(true);
        }
      });
    }, delay);
  },
});
