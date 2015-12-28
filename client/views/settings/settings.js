const defaultErrCallback   = GoogleAuth.defaultErrCallback;
const isGoogleAuthed       = GoogleAuth.isGoogleAuthed;
const connectWithGoogle    = GoogleAuth.connectWithGoogle;
const disconnectFromGoogle = GoogleAuth.disconnectFromGoogle;

const View  = Template.settings;
const delay = 500;

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
    const numHoursStr = $parent.find(`input[name="${inputNamePrefix}-hours"]`).val();
    const numHours = Number(numHoursStr);
    const numMinutesStr = $parent.find(`input[name="${inputNamePrefix}-minutes"]`).val();
    const numMinutes = Number(numMinutesStr);
    const newDurationSetting = numHours*HOURS + numMinutes*MINUTES;
    const ret = user[setterName](newDurationSetting);
    if(ret) gapi.syncTasksWithCalendar();
  }, 0);
}

View.onCreated(function () {
  const instance = Template.instance();
  instance.btnLoading       = new ReactiveVar(false);
  instance.googleBtnLoading = new ReactiveVar(false);
  instance.resetBtnLoading  = new ReactiveVar(false);
  instance.resetBtnDone     = new ReactiveVar(false);

  this.autorun( () => this.profileSubscription = this.subscribe('myProfile') );
  this.autorun( () => this.subscribe('myCalendars') );
});

View.onRendered(function () {
  // TODO: where do these go?
  Session.set('task-filter', '');
  Session.set('active-sidebar-section', '');

  $('[data-toggle="tooltip"]').tooltip();

  gapi.syncCalendars();
});

View.helpers({
  btnLoading             () { return Template.instance().btnLoading.get()       },
  googleBtnLoading       () { return Template.instance().googleBtnLoading.get() },
  googleBtnDisabledClass () { return isGoogleAuthed() ? 'disabled' : ''         },
  resetBtnLoading        () { return Template.instance().resetBtnLoading.get()  },
  resetBtnDone           () { return Template.instance().resetBtnDone.get()     },
  errorMessage           () { return Session.get('errorMessage')                },

  startOfWorkday              () { return Date.timeString(Meteor.user().startOfDay())          },
  endOfWorkday                () { return Date.timeString(Meteor.user().endOfDay())            },

  maxTaskIntervalHours        () { return Date.hours(Meteor.user().maxTaskInterval())          },
  maxTaskIntervalMinutes      () { return minutesPortion(Meteor.user().maxTaskInterval())      },

  maxTimePerTaskPerDayHours   () { return Date.hours(Meteor.user().maxTimePerTaskPerDay())     },
  maxTimePerTaskPerDayMinutes () { return minutesPortion(Meteor.user().maxTimePerTaskPerDay()) },

  taskBreakIntervalHours      () { return Date.hours(Meteor.user().taskBreakInterval())        },
  taskBreakIntervalMinutes    () { return minutesPortion(Meteor.user().taskBreakInterval())    },

  hasCalendars () {
    const calendars = Meteor.user().fetchCalendars({ summary: { $not: 'Dunmo Tasks' } });
    return calendars.length > 0;
  },

  calendars () {
    let calendars = Meteor.user().fetchCalendars({ summary: { $not: 'Dunmo Tasks' } });
    calendars = _.sortBy(calendars, cal => cal.summary.toLowerCase());
    calendars = _.sortBy(calendars, cal => !cal.active);
    return calendars;
  },
});

View.events({
  'click .btn-reset' (e, t) {
    e.preventDefault();
    const resetBtnLoading = Template.instance().resetBtnLoading;
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
          Template.instance().resetBtnDone.set(true);
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
    const btnLoading = Template.instance().btnLoading;
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
    Template.instance().googleBtnLoading.set(true);

    Meteor.setTimeout(() => {
      if(isGoogleAuthed()) {
        disconnectFromGoogle();
      } else {
        connectWithGoogle(err => {
          if(err) defaultErrCallback(err);
          else    location.reload();
        });
      }
    }, delay);
  }

});
