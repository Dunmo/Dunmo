
Meteor.methods({
  'getCalendar': function(user) {
    var CalDAVApi = Meteor.npmRequire('dav');
    console.log("CalDAVApi: ", CalDAVApi);
    var caldav = new CalDAVApi({
        version: "1.7.6"
    });

    var Cals = Async.runSync(function(done) {
      caldav.calendarList.list(null, function(err, data) {
        done(null, data);
      });
    });

    var DunmoCal = Async.runSync(function(done) {
      var id = Cals.find({ summary: "Dunmo Tasks" }).id;
      caldav.calendars.get(id, function(err, data) {
        done(null, data);
      });
    });

    console.log("DunmoCal.result: ", DunmoCal.result);
    return DunmoCal.result;
  }
});