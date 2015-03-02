
Template.calendarSettings.helpers({
  calendars: function() {
    return Calendars.find({ ownerId: Meteor.userId() });
  }
});

Template.calendarSettings.events({
  'click #cal': function (e) {
    Calendars.sync(Meteor.userId());
  }
});
