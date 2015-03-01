/*
 * Calendar
 * =========
 * ownerId          : String
 * googleCalendarId : String
 * title            : String
 *
 * TODO: hash apple passwords
 */

Calendars = new Mongo.Collection('calendars');

Calendars.before.insert(function(uid, doc) {
  return doc;
});

Calendars.helpers({
  'update': function (data) {
    Calendars.update(this._id, { $set: data });
  }
});

// input: obj OR str, obj
// if `str` is given, attrs will be parsed
// otherwise, all attrs must be present in `obj`
Calendars.create = function(str, obj) {
  if(typeof(str) === 'object') obj = str;
  else                         obj.title = obj.title || str;

  console.log('str: ', str);

  obj.ownerId         = obj.ownerId         || Meteor.userId();
  obj.appleReminderId = obj.appleReminderId || null;
  obj.calendarId      = obj.calendarId      || null;
  obj.title           = obj.title           || "";
  obj.importance      = obj.importance      || Natural.parseImportance(str);
  obj.dueAt           = obj.dueAt           || Natural.parseDueAt(str);
  obj.remaining       = obj.remaining       || Natural.parseDuration(str).asMilliseconds();
  obj.spent           = obj.spent           || 0;
  obj.snoozedUntil    = obj.snoozedUntil    || null;
  obj.description     = obj.description     || "";

  return Tasks.insert(obj);
};

// GET https://www.googleapis.com/calendar/v3/users/me/calendarList?key=185519853107-4u8h81a0ji0sc44c460guk6eru87h21g.apps.googleusercontent.com
Calendars.sync = function(uid) {
  Meteor.call('getSync', 'https://www.googleapis.com/calendar/v3/users/me/calendarList?key=185519853107-4u8h81a0ji0sc44c460guk6eru87h21g.apps.googleusercontent.com', function(err, res) {
    console.log('res: ', res);
    console.log('err: ', err);
  });
};

