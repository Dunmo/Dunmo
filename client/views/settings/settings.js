
var View = Template.settings;

let btnLoading       = new ReactiveVar();
let googleBtnLoading = new ReactiveVar();
let resetBtnLoading  = new ReactiveVar();
let resetBtnDone     = new ReactiveVar();
const delay          = 500;

function hoursAndMinutes (milliseconds) {
  const hours     = Date.hours(milliseconds);
  milliseconds   -= hours*HOURS;
  const mins      = Date.minutes(milliseconds);
  let str         = '';
  if(hours > 0)             str += hours + ' hours';
  if(hours > 0 && mins > 0) str += ' and ';
  if(mins  > 0)             str += mins + ' minutes';
  return str;
}

function minutesPortion (total) {
  total -= Date.hours(total)*HOURS;
  return Date.minutes(total);
}

function setTimeSetting (target, setterName) {
  Meteor.setTimeout(function () {
    const user = Meteor.user();
    Session.set('errorMessage', '');
    const newTimeSetting = $(target).val();
    const ret = user[setterName](newTimeSetting);
    if(ret) gapi.syncTasksWithCalendar();
  }, 0);
}

function setDurationSetting (target, inputNamePrefix, setterName) {
  Meteor.setTimeout(() => {
    const user = Meteor.user();
    Session.set('errorMessage', '');
    const $parent = $(target).parents('.setting');
    const numHoursStr = $parent.find('input[name="'+inputNamePrefix+'-hours"]').val();
    const numHours = Number(numHoursStr);
    const numMinutesStr = $parent.find('input[name="'+inputNamePrefix+'-minutes"]').val();
    const numMinutes = Number(numMinutesStr);
    const newDurationSetting = numHours*HOURS + numMinutes*MINUTES;
    const ret = user[setterName](newDurationSetting);
    if(ret) gapi.syncTasksWithCalendar();
  }, 0);
}

function isGoogleAuthed () {
  const user = Meteor.user();
  return user && user.isGoogleAuthed();
}

View.onCreated(() => {
  btnLoading.set(false);
  googleBtnLoading.set(false);
  resetBtnLoading.set(false);
  resetBtnDone.set(false);
});

View.onRendered(() => {
  // TODO: where do these go?
  Session.set('task-filter', '');
  Session.set('active-sidebar-section', '');

  $('[data-toggle="tooltip"]').tooltip();

  const user = Meteor.user();
  $('input[name="start-of-workday"]').val(Date.timeString(user.startOfDay()));
  $('input[name="end-of-workday"]').val(Date.timeString(user.endOfDay()));
  $('input[name="max-task-interval-hours"]').val(Date.hours(user.maxTaskInterval()));
  $('input[name="max-task-interval-minutes"]').val(minutesPortion(user.maxTaskInterval()));
  $('input[name="max-time-per-task-per-day-hours"]').val(Date.hours(user.maxTimePerTaskPerDay()));
  $('input[name="max-time-per-task-per-day-minutes"]').val(minutesPortion(user.maxTimePerTaskPerDay()));
  $('input[name="task-break-interval-hours"]').val(Date.hours(user.taskBreakInterval()));
  $('input[name="task-break-interval-minutes"]').val(minutesPortion(user.taskBreakInterval()));

  gapi.syncCalendars();
});

View.helpers({
  btnLoading             () { btnLoading.get()                   },
  googleBtnLoading       () { googleBtnLoading.get()             },
  googleBtnDisabledClass () { isGoogleAuthed() ? 'disabled' : '' },
  resetBtnLoading        () { resetBtnLoading.get()              },
  resetBtnDone           () { resetBtnDone.get()                 },
  errorMessage           () { Session.get('errorMessage')        },

  hasCalendars () {
    const calendars = Meteor.user().fetchCalendars({ summary: { $not: 'Dunmo Tasks' } });
    return calendars.length > 0;
  },

  calendars () {
    let calendars = Meteor.user().fetchCalendars({ summary: { $not: 'Dunmo Tasks' } });
    calendars = _.sortBy(calendars, cal => { cal.summary.toLowerCase() });
    calendars = _.sortBy(calendars, cal => { !cal.active });
    return calendars;
  },
});

View.events({
  'click .btn-reset' (e, t) {
    e.preventDefault();
    resetBtnLoading.set(true);

    Meteor.setTimeout(() => {
      const user  = Meteor.user();
      const email = user.primaryEmailAddress();

      Accounts.forgotPassword({ email: email }, err => {
        resetBtnLoading.set(false);
        if(err) {
          $('.notice').html(err.reason);
        } else {
          $('.notice').html('');
          resetBtnDone.set(true);
        }
      });
    }, delay);
  },

  'keydown input[type="number"]' (event) {
    if (!(!event.shiftKey && //Disallow: any Shift+digit combination
      !(event.keyCode < 48 || event.keyCode > 57) || //Disallow: everything but digits
      !(event.keyCode < 96 || event.keyCode > 105) || //Allow: numeric pad digits
      event.keyCode == 46 || // Allow: delete
      event.keyCode == 8 || // Allow: backspace
      event.keyCode == 9 || // Allow: tab
      event.keyCode == 27 || // Allow: escape
      (event.keyCode == 65 && (event.ctrlKey === true || event.metaKey === true)) || // Allow: Ctrl+A
      (event.keyCode == 67 && (event.ctrlKey === true || event.metaKey === true)) || // Allow: Ctrl+C
      //Uncommenting the next line allows Ctrl+V usage, but requires additional code from you to disallow pasting non-numeric symbols
      //|| (event.keyCode == 86 && (event.ctrlKey === true || event.metaKey === true)) // Allow: Ctrl+Vpasting
      (event.keyCode >= 35 && event.keyCode <= 40) // Allow: Home, End, arrow keys
    )) {
      event.preventDefault();
    }
  },

  'keydown input[name="start-of-workday"]' (e) {
    setTimeSetting(e.target, 'setStartOfDay');
  },

  'keydown input[name="end-of-workday"]' (e) {
    setTimeSetting(e.target, 'setEndOfDay');
  },

  'keydown input[name^="max-task-interval"]' (e) {
    setDurationSetting(e.target, 'max-task-interval', 'setMaxTaskInterval');
  },

  'keydown input[name^="max-time-per-task-per-day"]' (e) {
    setDurationSetting(e.target, 'max-time-per-task-per-day', 'setMaxTimePerTaskPerDay');
  },

  'keydown input[name^="task-break-interval"]' (e) {
    setDurationSetting(e.target, 'task-break-interval', 'setTaskBreakInterval');
  },

  'click .btn-logout' (e) {
    Session.set('errorMessage', '');
    btnLoading.set(true);

    Meteor.setTimeout(() => {
      Meteor.logout(err => {
        if(err) {
          console.log('err: ', err);
          let reason = err.reason || err.error || 'Unknown error';
          Session.set('errorMessage', reason);
          btnLoading.set(false);
        } else {
          Router.go('login');
        }
      });
    }, delay);
  },

  'click .btn-gplus' (e) {
    Session.set('errorMessage', '');
    googleBtnLoading.set(true);

    Meteor.setTimeout(() => {
      if(isGoogleAuthed()) {
        Meteor.call('accounts/disconnect', 'google', (err, res) => {
          googleBtnLoading.set(false);
        });
        return;
      }

      Meteor.connectWith('google', {
        requestPermissions: ['email', 'profile', 'https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/tasks'],
        requestOfflineToken: true,
        loginStyle: 'popup',
      }, err => {
        if(err) {
          console.log('err: ', err);
          let reason = err.reason || err.error || 'Unknown error';
          if(reason === 'User already exists') {
            reason = 'Google account has' +
              ' already been linked to a different Dunmo account. If you' +
              ' believe this is an error, send us an email at contact@dunmoapp.com.';
          }
          if(reason === 'No matching login attempt found') reason = '';
          Session.set('errorMessage', reason);
          googleBtnLoading.set(false);
        } else {
          location.reload();
        }
      });
    }, delay);
  }

});
