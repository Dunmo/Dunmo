const connectWithGoogle = GoogleAuth.connectWithGoogle;
const loginWithGoogle   = GoogleAuth.loginWithGoogle;
const authWithGoogle    = GoogleAuth.authWithGoogle;

const View  = Template.auth;
const delay = 500;


function synchronize(src, dest) {
//  $('.nav-tabs > li').removeClass('active');
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

View.onCreated(function () {
  const instance = Template.instance();
  instance.btnLoading        = new ReactiveVar(false);
  instance.resetBtnDone      = new ReactiveVar(false);
  instance.usedGmailForReset = new ReactiveVar(false);
  instance.googleBtnLoading  = new ReactiveVar(false);
  instance.savedPassword     = '';
});

View.helpers({
  loggedIn          () { return Meteor.userId()         },
  googleBtnLoading  () { return Template.instance().googleBtnLoading.get()  },
  btnLoading        () { return Template.instance().btnLoading.get()        },
  resetBtnDone      () { return Template.instance().resetBtnDone.get()      },
  usedGmailForReset () { return Template.instance().usedGmailForReset.get() },
});

View.onRendered(function () {
//  if(window.location.hash === '#reset') synchronize('.login', '.reset');

  $('.auth__tab').first().addClass('active').next().show().addClass('open');

  $('.auth__container').on('click', 'li > a.auth__tab', function(event) {
      event.preventDefault();
      if (!$(this).hasClass('active')) {
          $('.open').hide().removeClass('open');
          $(this).next().show().addClass('open');
          $('.active').removeClass('active');
          $(this).addClass('active');
      }
  });

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
    const btnLoading = Template.instance().btnLoading;
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
    const btnLoading = Template.instance().btnLoading;
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
    const btnLoading = Template.instance().btnLoading;
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
          Template.instance().resetBtnDone.set(true);
          if(Helpers.isGmailAddress(email)) {
            Template.instance().usedGmailForReset.set(true);
          }
        }
      });
    }, delay);
  },

  'click .btn-gplus': e => {
    Template.instance().googleBtnLoading.set(true);
    authWithGoogle();
  },

});
