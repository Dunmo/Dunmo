/*
 * Calendar
 * =========
 * ownerId          : String
 * googleCalendarId : String
 * title            : String
 * active           : Boolean
 *
 */

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
    var ary = _.cloneDeep(obj);
    return ary.map(function(cal) {
      return Calendars.updateOrCreate(cal);
    });
  } else if(typeof(obj) === 'object') {
    var doc = _.cloneDeep(obj);
    doc.googleCalendarId = doc.googleCalendarId || doc.id || null;
    delete doc.id;

    if(doc.googleCalendarId === null) throw new Meteor.error('Invalid googleCalendarId');

    var calendar = Calendars.findOne({ googleCalendarId: doc.googleCalendarId });
    if(calendar) {
      return calendar.update(doc);
    } else {
      return Calendars.insert(doc);
    }
  } else {
    console.error('type error, Calendar.updateOrCreate does not expect: ', typeof(obj));
    return false;
  }
};

// "ya29.KAHNrGk9bVgQmNZNEgBZJnYhNxdGjeQkCwxQHu2KCDHNFgwUSF3fVZXVY9K3EScLHqMEXX1iA2YiUQ"
// "ya29.KAED79aO5aTZ7Vn3lS7BDAL-R_LrG-HoPFw12YKFi39m35hbr6MsP9HptzOeCVu6r5Zf3vhdE3NF6g"
