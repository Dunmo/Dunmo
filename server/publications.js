
// when publication name is null, automatically publishes to all clients
var allClients = null;

Meteor.publish(allClients, function () {
  var currentUser  = Meteor.users.find({ _id: this.userId });
  var userSettings = UserSettings.find({ userId: this.userId });
  var calendars    = Calendars.find({ ownerId: this.userId });
  var tasks        = Tasks.find({ ownerId: this.userId });
  var events       = Events.find({ ownerId: this.userId });
  return [currentUser, calendars, tasks, events];
});
