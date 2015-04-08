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

Calendars.before.insert(function(uid, doc) {
  // console.log('doc: ', doc);

  doc.ownerId = doc.ownerId || Meteor.userId();
  doc.googleCalendarId = doc.googleCalendarId || doc.id || null;
  doc.id = undefined;

  return doc;
});


Calendars.before.update(function(uid, doc, fieldNames, modifier, options) {
  // console.log('doc: ', doc);

  doc.googleCalendarId = doc.googleCalendarId || doc.id || null;
  doc.id = undefined;

  return doc;
});

// GET https://www.googleapis.com/calendar/v3/users/me/calendarList?key=185519853107-4u8h81a0ji0sc44c460guk6eru87h21g.apps.googleusercontent.com

// Calendars.sync = function(user) {
//   if(!user) user = Meteor.user();
//   var token = user.services.google.accessToken;
//   Meteor.call('getSync', 'https://www.googleapis.com/calendar/v3/users/me/calendarList?key=AIzaSyC08vzLejW5TM8sH00bGBNY4mJF__Abkyg', function(err, res) {
//     // console.log('res: ', res);
//     // console.log('err: ', err);
//   });
// };

Calendars.updateOrCreate = function(obj) {
  if(Array.isArray(obj)) {
    var ary = obj;
    ary.forEach(function(cal) {
      Calendars.updateOrCreate(cal);
    });
  } else if(typeof(obj) === 'object') {
    if(Calendars.findOne({ googleCalendarId: obj.id })) {
      Calendars.update(obj);
    } else {
      Calendars.insert(obj);
    }
  } else {
    // console.log('type error, updateOrCreate does not expect: ', typeof(obj));
  }
}

// "ya29.KAHNrGk9bVgQmNZNEgBZJnYhNxdGjeQkCwxQHu2KCDHNFgwUSF3fVZXVY9K3EScLHqMEXX1iA2YiUQ"
// "ya29.KAED79aO5aTZ7Vn3lS7BDAL-R_LrG-HoPFw12YKFi39m35hbr6MsP9HptzOeCVu6r5Zf3vhdE3NF6g"
