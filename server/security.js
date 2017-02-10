
Security.defineMethod("ifOwner", {
  fetch: ['ownerId'],
  transform: null,
  deny (type, arg, userId, doc, fields, modifier) { return doc.ownerId !== userId; },
});

// Calenders.permit(['insert', 'update', 'remove']).apply();
// Events.permit(['insert', 'update', 'remove']).apply();
// Projects.permit(['insert', 'update', 'remove']).apply();
// TaskComments.permit(['insert', 'update', 'remove']).apply();
Tasks.permit(['insert']).ifOwner().apply();
// Users.permit(['insert', 'update', 'remove']).apply();
