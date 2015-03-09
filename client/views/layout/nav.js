
Template.nav.events({
  'click .sync': function() {
    gapi.syncTasksWithCalendar();
  }
});
