
Template.calendarSettings.helpers({
  calendars: function() {
    return Calendars.find({ ownerId: Meteor.userId() });
  }
});

Template.calendarSettings.events({
  'click #cal': function (e) {
    gapi.syncTasksWithCalendar();
  },

  'click .add-task': function (e) {
    var $input = $(e.target).parents('.input-group').find('.form-control');
    console.log('$input: ', $input);
    var val = $input.val();
    console.log('val: ', val);
    Tasks.create(val, { ownerId: Meteor.userId() });
    $input.val('');
    gapi.syncTasksWithCalendar();
  }
});
