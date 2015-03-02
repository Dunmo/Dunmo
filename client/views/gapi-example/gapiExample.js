
Template.gapiExample.helpers({
  'calendars' : function() {
    return Calendars.find({ ownerId: Meteor.userId() });
  },

  'tasks' : function() {
    return Tasks.find({ ownerId: Meteor.userId() })
  }
});

Template.gapiExample.events({
  'click #getCalendars' : gapi.handleAuthClick(gapi.getCalendars),
  'click #getFreetimes' : gapi.handleAuthClick(gapi.getFreetimes),
  'click #insertCalendar' : gapi.handleAuthClick(gapi.createCalendar('Dunmo Tasks')),
  'click #deleteCalendar' : gapi.handleAuthClick(gapi.deleteCalendar('Dunmo Tasks')),
  'click #addEvent' : gapi.handleAuthClick(gapi.addEventToCalendar('Dunmo Tasks')),
  'click #addTask' : function(e) {
    e.preventDefault();
    var str = $('#taskInput').val();
    console.log('str: ', str);
    Tasks.create(str, { ownerId: Meteor.userId() });
  }
});
