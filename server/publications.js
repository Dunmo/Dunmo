
// when publication name is null, automatically publishes to all clients
var allClients = null;

Meteor.publish(allClients, function () {
  var userId = this.userId;
  var publications = [];
  publications.push(Users.find({ _id: userId }));
  [Calendars, Events, Projects, Tasks, TaskComments].forEach(function (collection) {
    publications.push(collection.findAll({ ownerId: userId }));
  });
  return publications;
});
