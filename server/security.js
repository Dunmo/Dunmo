
Security.defineMethod("ifOwner", {
  fetch: ['ownerId'],
  transform: null,
  deny (type, arg, userId, doc, fields, modifier) { return doc.ownerId !== userId; },
});

Calendars   .permit(['insert', 'remove']).ifOwner().apply();
Events      .permit(['insert', 'remove']).ifOwner().apply();
Projects    .permit(['insert', 'remove']).ifOwner().apply();
TaskComments.permit(['insert', 'remove']).ifOwner().apply();
Tasks       .permit(['insert', 'remove']).ifOwner().apply();

Calendars   .permit(['update']).ifOwner().exceptProps(['ownerId']).apply();
Events      .permit(['update']).ifOwner().exceptProps(['ownerId']).apply();
Projects    .permit(['update']).ifOwner().exceptProps(['ownerId']).apply();
TaskComments.permit(['update']).ifOwner().exceptProps(['ownerId']).apply();
Tasks       .permit(['update']).ifOwner().exceptProps(['ownerId']).apply();

Users       .permit(['update']).onlyProps('profile').apply();
