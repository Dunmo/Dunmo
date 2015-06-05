
Template.calendarSettings.rendered = function () {
  gapi.syncCalendars();
};

Template.calendarSettings.helpers({
  calendars: function() {
    var calendars = Calendars.find({ ownerId: Meteor.userId(), summary: { $not: 'Dunmo Tasks' }, isRemoved: { $not: true } }).fetch();
    calendars = lodash.sortBy(calendars, function(cal) {
      return cal.summary.toLowerCase();
    });
    calendars = lodash.sortBy(calendars, function(cal) {
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
  }
});

Template.calendarSettings.events({
  'keydown .start-time.form-control, click button.start-time': function (e) {
    if(e.which && ! (e.which == 13 || e.which == 1) ) return;
    var $input = $(e.target).parents('.input-group').find('input.start-time');
    var val = $input.val();
    console.log('val: ', val);
    var ret = Meteor.user().setStartOfDay(val);
    if(ret) gapi.syncTasksWithCalendar();
  },

  'keydown .end-time.form-control, click button.end-time': function (e) {
    if(e.which && ! (e.which == 13 || e.which == 1) ) return;
    var $input = $(e.target).parents('.input-group').find('input.end-time');
    var val = $input.val();
    var ret = Meteor.user().setEndOfDay(val);
    if(ret) gapi.syncTasksWithCalendar();
  }
});
