
var View = Template.topbar;

View.helpers({
  spinClass: function () {
    return Session.get('isSyncing') ? 'spin' : '';
  }
});

View.events({
  'click .app-topbar__button--sync': function () {
    gapi.syncTasksWithCalendar();
  }
});
