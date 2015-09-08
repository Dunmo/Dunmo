
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

var View = Template.settings;

View.rendered = function () {
  $(function () {
    $('[data-toggle="tooltip"]').tooltip();
  });
  gapi.syncCalendars();
};

View.helpers({
  errorMessage: function () {
    return Session.get('errorMessage');
  },

  disabledClass: function () {
    var user = Meteor.user();
    return user && user.isGoogleAuthed() ? 'disabled' : '';
  },

  isGoogleAuthed: function () {
    var user = Meteor.user();
    return user && user.isGoogleAuthed();
  },

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

  startTime: function () {
    var start = Meteor.user().startOfDay();
    var str   = Date.timeString(start);
    return str;
  },

  endTime: function () {
    var end = Meteor.user().endOfDay();
    var str = Date.timeString(end);
    return str;
  },

  hasOnboarded: function () {
    return Meteor.user().hasOnboarded('calendarSettings');
  },

  taskGranularityMinutes: function () {
    return Date.minutes(Meteor.user().taskGranularity());
  },

  taskGranularity: function () {
    return Date.minutes(Meteor.user().taskGranularity()) + ' minute';
  },

  maxTaskIntervalHours: function () {
    return Date.hours(Meteor.user().maxTaskInterval());
  },

  maxTaskIntervalMinutes: function () {
    var total = Meteor.user().maxTaskInterval();
    total    -= Date.hours(total)*HOURS;
    return Date.minutes(total);
  },

  maxTaskInterval: function () {
    var total = Meteor.user().maxTaskInterval();
    return hoursAndMinutes(total);
  },

  maxTimePerTaskPerDayHours: function () {
    return Date.hours(Meteor.user().maxTimePerTaskPerDay());
  },

  maxTimePerTaskPerDayMinutes: function () {
    var total = Meteor.user().maxTimePerTaskPerDay();
    total    -= Date.hours(total)*HOURS;
    return Date.minutes(total);
  },

  maxTimePerTaskPerDay: function () {
    var total = Meteor.user().maxTimePerTaskPerDay();
    return hoursAndMinutes(total);
  },

  taskBreakIntervalHours: function () {
    return Date.hours(Meteor.user().taskBreakInterval());
  },

  taskBreakIntervalMinutes: function () {
    var total = Meteor.user().taskBreakInterval();
    total    -= Date.hours(total)*HOURS;
    return Date.minutes(total);
  },

  taskBreakInterval: function () {
    var total = Meteor.user().taskBreakInterval();
    return hoursAndMinutes(total);
  }

});

View.events({
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

  'keydown .start-time.form-control, click button.start-time': function (e) {
    if(e.which && ! (e.which == 13 || e.which == 1) ) return;
    Session.set('errorMessage', '');
    var $input = $(e.target).parents('.input-group').find('input.start-time');
    var val = $input.val();
    var ret = Meteor.user().setStartOfDay(val);
    if(ret) gapi.syncTasksWithCalendar();
  },

  'keydown .end-time.form-control, click button.end-time': function (e) {
    if(e.which && ! (e.which == 13 || e.which == 1) ) return;
    Session.set('errorMessage', '');
    var $input = $(e.target).parents('.input-group').find('input.end-time');
    var val = $input.val();
    var ret = Meteor.user().setEndOfDay(val);
    if(ret) gapi.syncTasksWithCalendar();
  },

  'keydown form.inline-hrs-mins input, click form.inline-hrs-mins .btn.save': function (e) {
    if(e.which && ! (e.which == 13 || e.which == 1) ) return;
    Session.set('errorMessage', '');

    var $parent = $(e.target).parents('form');
    var prop  = $parent.attr('id');
    prop      = prop.substring(0, prop.length-4); // remove 'Form' from the end
    prop      = _.capitalize(prop);
    var hours = Number($parent.find('input.hours').val());
    var mins  = Number($parent.find('input.minutes').val());
    var val   = hours*HOURS + mins*MINUTES;

    var ret   = Meteor.user()['set' + prop](val);
    if(ret) gapi.syncTasksWithCalendar();
  },

  'keydown form.inline-mins input, click form.inline-mins .btn.save': function (e) {
    if(e.which && ! (e.which == 13 || e.which == 1) ) return;
    Session.set('errorMessage', '');

    var $parent = $(e.target).parents('form');
    var prop  = $parent.attr('id');
    prop      = prop.substring(0, prop.length-4); // remove 'Form' from the end
    prop      = _.capitalize(prop);
    // var hours = Number($parent.find('input.hours').val());
    var mins  = Number($parent.find('input.minutes').val());
    var val   = mins*MINUTES;

    var ret   = Meteor.user()['set' + prop](val);
    if(ret) gapi.syncTasksWithCalendar();
  },

  'click .btn-logout': function (e) {
    Meteor.logout(function (err) {
      if(err) console.log('err: ', err);
      else    Router.go('login');
    });
  },

  'click .btn-gplus': function (e) {
    Meteor.connectWith('google', {
      requestPermissions: ["email", "profile", "https://www.googleapis.com/auth/calendar", "https://www.googleapis.com/auth/tasks"],
      requestOfflineToken: true,
      loginStyle: "popup"
    }, function (err) {
      if (err) Session.set('errorMessage', err.reason || 'Unknown error');
      else     location.reload();
    });
  }

});
