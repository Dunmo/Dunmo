
Template.gapiExample.helpers({
  'calendars' : function() {
    return Calendars.find({ ownerId: Meteor.userId() });
  },

  'tasks' : function() {
    return Tasks.find({ ownerId: Meteor.userId() })
  }
});

Template.gapiExample.events({
  'click #getCalendars' : gapi.getCalendars,
  'click #syncTasksWithCalendar' : function (e) {
    gapi.syncTasksWithCalendar();
  },
  'click #insertCalendar' : gapi.handleAuthClick(gapi.createDunmoCalendar()),
  'click #addTask' : function(e) {
    e.preventDefault();
    var str = $('#taskInput').val();
    console.log('str: ', str);
    Tasks.create(str, { ownerId: Meteor.userId() });
  }
});
