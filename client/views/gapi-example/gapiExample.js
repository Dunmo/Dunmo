
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
  'click #syncTasksWithCalendar' : gapi.handleAuthClick(gapi.syncTasksWithCalendar),
  'click #insertCalendar' : gapi.handleAuthClick(gapi.createCalendar('Dunmo Tasks')),
  'click #deleteCalendar' : gapi.handleAuthClick(gapi.deleteCalendar('Dunmo Tasks')),
  'click #addTask' : function(e) {
    e.preventDefault();
    var str = $('#taskInput').val();
    console.log('str: ', str);
    Tasks.create(str, { ownerId: Meteor.userId() });
  }
});
