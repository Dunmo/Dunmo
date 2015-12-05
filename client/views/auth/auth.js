
let View = Template.auth;

let btnLoading        = new ReactiveVar();
let resetBtnDone      = new ReactiveVar();
let usedGmailForReset = new ReactiveVar();
let googleBtnLoading  = new ReactiveVar();
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
  $(`form${dest}`).show();
  const $src = $(`form${src}`);
  const $dest = $(`form${dest}`);
  const email = $src.find('input.email').val();
  let password = $src.find('input.password').val();
  if(_.isUndefined(password)) password = savedPassword;
  else                        savedPassword = password;
  $dest.find('input.email').val(email);
  $dest.find('input.password').val(password);
}

var options = {
  requestPermissions: ['email', 'profile', 'https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/tasks'],
  requestOfflineToken: true,
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
  if(Meteor.user()) connectWithGoogle();
  else              loginWithGoogle();
}

View.onCreated(function () {
  btnLoading.set(false);
  resetBtnDone.set(false);
  usedGmailForReset.set(false);
  googleBtnLoading.set(false);
});

View.helpers({
  loggedIn          () { return Meteor.userId()         },
  googleBtnLoading  () { return googleBtnLoading.get()  },
  btnLoading        () { return btnLoading.get()        },
  resetBtnDone      () { return resetBtnDone.get()      },
  usedGmailForReset () { return usedGmailForReset.get() },
});

View.events({

  'click .signup-link': e => {
    if( $('.signup-link').hasClass('active') ) return false;
    else if( $('.login-link').hasClass('active') ) synchronize('.login', '.signup');
    else synchronize('.reset', '.signup');
  },

  'click .login-link': e => {
    if( $('.login-link').hasClass('active') ) return false;
    else if( $('.signup-link').hasClass('active') ) synchronize('.signup', '.login');
    else synchronize('.reset', '.login');
  },

  'click .reset-link': e => { synchronize('.login', '.reset') },

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

  'submit form.reset, click form.reset button.reset': (e, t) => {
    e.preventDefault();
    btnLoading.set(true);

    Meteor.setTimeout(function () {
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

  'click .btn-gplus': e => {
    googleBtnLoading.set(true);

    var options = {
      requestPermissions: ['email', 'profile', 'https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/tasks'],
      requestOfflineToken: true,
    };

    authWithGoogle();
  },

});
