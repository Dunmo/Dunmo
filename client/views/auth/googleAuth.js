
const options = {
  requestPermissions: ['email', 'profile', 'https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/tasks'],
  requestOfflineToken: true,
  loginStyle: 'popup',
};

function defaultErrCallback(err) {
  if(!err) return;
  console.log('err: ', err);
  let reason = err.reason || err.error || 'Unknown error';
  if(reason === 'User already exists') {
    reason = 'Google account has' +
      ' already been linked to a different Dunmo account. If you' +
      ' believe this is an error, send us an email at contact@dunmoapp.com.';
  }
  if(reason === 'No matching login attempt found') reason = '';
  Session.set('errorMessage', reason);
  Template.instance().googleBtnLoading.set(false);
}

function defaultCallback (err, res) {
  if(err) defaultErrCallback(err);
  else    Router.go('app');
}

function isGoogleAuthed () {
  const user = Meteor.user();
  return user && user.isGoogleAuthed();
}

function connectWithGoogle (callback = defaultCallback) {
  Meteor.connectWith('google', options, callback);
}

function loginWithGoogle (callback = defaultCallback) {
  Meteor.loginWithGoogle(options, callback);
}

function authWithGoogle (callback) {
  if(Meteor.user()) connectWithGoogle(callback);
  else              loginWithGoogle(callback);
}

function disconnectFromGoogle () {
  Meteor.call('accounts/disconnect', 'google', (err, res) => {
    Template.instance().googleBtnLoading.set(false);
  });
}

GoogleAuth = {
  defaultErrCallback:   defaultErrCallback,
  isGoogleAuthed:       isGoogleAuthed,
  connectWithGoogle:    connectWithGoogle,
  loginWithGoogle:      loginWithGoogle,
  authWithGoogle:       authWithGoogle,
  disconnectFromGoogle: disconnectFromGoogle,
};
