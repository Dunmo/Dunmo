
Template.calendarSettings.rendered = function () {
  gapi.getCalendars();
};

var view = Template.calendarSettings;

// gapi.getCalendars() is called in router.js

view.helpers({
  calendars: function() {
    return Calendars.find({ ownerId: Meteor.userId(), summary: { $not: 'Dunmo Tasks' } });
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

view.events({
  'submit .start-time.form-control, click button.start-time': function (e) {
    e.preventDefault();
    var $input = $(e.target).parents('.input-group').find('input.start-time');
    var val = $input.val();
    if(val == '') val = '08:00';
    Meteor.user().startOfDay(val);
    $input.val('');
    gapi.syncTasksWithCalendar();
  },

  'submit .end-time.form-control, click button.end-time': function (e) {
    e.preventDefault();
    var $input = $(e.target).parents('.input-group').find('input.end-time');
    var val = $input.val();
    if(val == '') val = '22:00';
    Meteor.user().endOfDay(val);
    $input.val('');
    gapi.syncTasksWithCalendar();
  }
});
