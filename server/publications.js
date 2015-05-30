
// when publication name is null, automatically publishes to all clients
var allClients = null;

Meteor.publish(allClients, function () {
  var currentUser = Meteor.users.find({ _id: this.userId });
  var calendars   = Calendars.find({ ownerId: this.userId });
  var tasks       = Tasks.find({ ownerId: this.userId });
  return [currentUser, calendars, tasks];
});
