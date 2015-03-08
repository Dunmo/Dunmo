
Template.calendarSettings.helpers({
  calendars: function() {
    return Calendars.find({ ownerId: Meteor.userId() });
  }
});

Template.calendarSettings.events({
  // 'click #cal': function (e) {
  //   gapi.syncTasksWithCalendar();
  // },

  'click .add-task': function (e) {
    var $input = $(e.target).parents('.input-group').find('.form-control');
    console.log('$input: ', $input);
    var val = $input.val();
    console.log('val: ', val);
    Tasks.create(val, { ownerId: Meteor.userId() });
    $input.val('');
    gapi.syncTasksWithCalendar();
  },

  'submit .start-time.form-control, click button.start-time': function (e) {
    e.preventDefault();
    var $input = $(e.target).parents('.input-group').find('input.start-time');
    console.log('$input: ', $input);
    var val = $input.val();
    console.log('val: ', val);
    Meteor.user().update({ 'day_start_time': val });
    $input.val('');
    // CALL FUNCTION TO MAKE IMAGINARY NIGHT EVENT
    gapi.syncTasksWithCalendar();
  },

  'submit .end-time.form-control, click button.end-time': function (e) {
    e.preventDefault();
    var $input = $(e.target).parents('.input-group').find('input.end-time');
    console.log('$input: ', $input);
    var val = $input.val();
    console.log('val: ', val);
    Meteor.user().update({ 'day_end_time': val});
    $input.val('');
    // CALL FUNCTION TO MAKE IMAGINARY NIGHT EVENT
    gapi.syncTasksWithCalendar();
  }
});
