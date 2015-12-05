
let View = Template.topbar;

View.helpers({
  spinClass () { Session.get('isSyncing') ? 'spin' : '' },
});

View.events({
  'click .app-topbar__button--sync' (e, t) { gapi.syncTasksWithCalendar() },
});
