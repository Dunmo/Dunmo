/*
 * Task
 * =========
 * appleReminderId : String
 * ownerId         : String
 * calendarId      : String
 * title           : String
 * importance      : <1,2,3>
 * dueAt           : String
 * remaining       : Number<milliseconds>
 * spent           : Number<milliseconds>
 * snoozedUntil    : DateTime
 * description     : String
 *
 * TODO: hash apple passwords
 */

Tasks = new Mongo.Collection('tasks');

Tasks.before.insert(function(uid, doc) {

});

Tasks.helpers({
  'update': function (data) {
    Tasks.update(this._id, { $set: data });
  }
});

Tasks.create = function(str) {
  console.log('str: ', str);
};
