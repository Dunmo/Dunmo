
let View = Template.topbar;

View.helpers({
  spinClass () { return Session.get('isSyncing') ? 'spin' : '' },
});

View.events({
  'click .app-topbar__button--sync' (e, t) { return gapi.syncTasksWithCalendar() },
});
