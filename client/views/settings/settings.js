
var btnLoading = new ReactiveVar();
var googleBtnLoading = new ReactiveVar();
var resetBtnLoading = new ReactiveVar();
var resetBtnDone = new ReactiveVar();

function hoursAndMinutes(milliseconds) {
  var hours     = Date.hours(milliseconds);
  milliseconds -= hours*HOURS;
  var mins      = Date.minutes(milliseconds);
  var str       = '';
  if(hours > 0) str += hours + ' hours';
  if(hours > 0 && mins > 0) str += ' and ';
  if(mins  > 0) str += mins + ' minutes';
  return str;
}

function minutesPortion (total) {
  total -= Date.hours(total)*HOURS;
  return Date.minutes(total);
}

function setTimeSetting (target, setterName) {
  Meteor.setTimeout(function () {
    var user = Meteor.user();
    Session.set('errorMessage', '');
    var newTimeSetting = $(target).val();
    var ret = user[setterName](newTimeSetting);
    if(ret) gapi.syncTasksWithCalendar();
  }, 0);
}

function setDurationSetting (target, inputNamePrefix, setterName) {
  Meteor.setTimeout(function () {
    var user = Meteor.user();
    Session.set('errorMessage', '');
    var $parent = $(target).parents('.setting');
    var numHoursStr = $parent.find('input[name="'+inputNamePrefix+'-hours"]').val();
    var numHours = Number(numHoursStr);
    console.log('numHours: ', numHours);
    var numMinutesStr = $parent.find('input[name="'+inputNamePrefix+'-minutes"]').val();
    var numMinutes = Number(numMinutesStr);
    console.log('numMinutes: ', numMinutes);
    var newDurationSetting = numHours*HOURS + numMinutes*MINUTES;
    console.log('newDurationSetting: ', newDurationSetting);
    var ret = user[setterName](newDurationSetting);
    if(ret) gapi.syncTasksWithCalendar();
  }, 0);
}

function isGoogleAuthed () {
  var user = Meteor.user();
  return user && user.isGoogleAuthed();
}

var View = Template.settings;

View.onCreated(function () {
  btnLoading.set(false);
  googleBtnLoading.set(false);
  resetBtnLoading.set(false);
  resetBtnDone.set(false);
});

View.onRendered(function () {
  // TODO: where do these go?
  Session.set('task-filter', '');
  Session.set('active-sidebar-section', '');

  $(function () {
    $('[data-toggle="tooltip"]').tooltip();
  });

  var user = Meteor.user();
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
  btnLoading: function () {
    return btnLoading.get();
  },

  googleBtnLoading: function () {
    return googleBtnLoading.get();
  },

  googleBtnDisabledClass: function () {
    return isGoogleAuthed() ? 'disabled' : '';
  },

  resetBtnLoading: function () {
    return resetBtnLoading.get();
  },

  resetBtnDone: function () {
    return resetBtnDone.get();
  },

  errorMessage: function () {
    return Session.get('errorMessage');
  },

  isGoogleAuthed: isGoogleAuthed,

  hasCalendars: function () {
    var calendars = Meteor.user().fetchCalendars({ summary: { $not: 'Dunmo Tasks' } });
    return calendars.length > 0;
  },

  calendars: function () {
    var calendars = Meteor.user().fetchCalendars({ summary: { $not: 'Dunmo Tasks' } });
    calendars = _.sortBy(calendars, function(cal) {
      return cal.summary.toLowerCase();
    });
    calendars = _.sortBy(calendars, function(cal) {
      return !cal.active;
    });
    return calendars;
  },

  hasOnboarded: function () {
    return Meteor.user().hasOnboarded('calendarSettings');
  }
});

View.events({
  'click .btn-reset': function (e, t) {
    e.preventDefault();
    resetBtnLoading.set(true);

    var delay = 500;
    Meteor.setTimeout(function () {
      var user = Meteor.user();
      var email = user.primaryEmailAddress();

      Accounts.forgotPassword({ email: email }, function (err) {
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

  'keydown input[type="number"]': function (event) {
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

  'keydown input[name="start-of-workday"]': function (e) {
    setTimeSetting(e.target, 'setStartOfDay');
  },

  'keydown input[name="end-of-workday"]': function (e) {
    setTimeSetting(e.target, 'setEndOfDay');
  },

  'keydown input[name^="max-task-interval"]': function (e) {
    setDurationSetting(e.target, 'max-task-interval', 'setMaxTaskInterval');
  },

  'keydown input[name^="max-time-per-task-per-day"]': function (e) {
    setDurationSetting(e.target, 'max-time-per-task-per-day', 'setMaxTimePerTaskPerDay');
  },

  'keydown input[name^="task-break-interval"]': function (e) {
    setDurationSetting(e.target, 'task-break-interval', 'setTaskBreakInterval');
  },

  'click .btn-logout': function (e) {
    Session.set('errorMessage', '');
    btnLoading.set(true);

    var delay = 500;
    Meteor.setTimeout(function () {
      Meteor.logout(function (err) {
        if(err) {
          console.log('err: ', err);
          var reason = err.reason || err.error || 'Unknown error';
          Session.set('errorMessage', reason);
          btnLoading.set(false);
        } else {
          Router.go('login');
        }
      });
    }, delay);
  },

  'click .btn-gplus': function (e) {
    Session.set('errorMessage', '');
    googleBtnLoading.set(true);

    var delay = 500;
    Meteor.setTimeout(function () {
      if(isGoogleAuthed()) {
        Meteor.call('accounts/disconnect', 'google', function (err, res) {
          googleBtnLoading.set(false);
        });
        return;
      }

      Meteor.connectWith('google', {
        requestPermissions: ["email", "profile", "https://www.googleapis.com/auth/calendar", "https://www.googleapis.com/auth/tasks"],
        requestOfflineToken: true,
        loginStyle: "popup"
      }, function (err) {
        if(err) {
          console.log('err: ', err);
          var reason = err.reason || err.error || 'Unknown error';
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
