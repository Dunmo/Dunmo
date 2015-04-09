
/*
 * UserSettings
 * ==================
 * userId         : String
 * startOfDay     : Number (Duration)
 * endOfDay       : Number (Duration)
 * taskCalendarId : String
 *
 */

UserSettings = new Mongo.Collection('userSettings');

UserSettings.helpers({
  update: function (data) {
    if( _.keys(data).every(function(k) { return k.charAt(0) !== '$'; }) )
      data = { $set: data };

    return UserSettings.update(this._id, data);
  }
});

UserSettings.create = function(obj) {
  if(Array.isArray(obj)) {
    var ary = obj;
    ary.forEach(function(o) {
      UserSettings.create(o);
    });
  }

  obj.startOfDay = obj.startOfDay || Date.parseTime('08:00');
  obj.endOfDay   = obj.endOfDay   || Date.parseTime('22:00');
  // obj.maxTaskInterval      = obj.maxTaskInterval      || Date.parseDuration('2 hours');
  // obj.maxTimePerTaskPerDay = obj.maxTimePerTaskPerDay || Date.parseDuration('4 hours');

  var curr = UserSettings.findOne({ userId: obj.userId });
  if(curr) return curr.update(obj);
  else     return UserSettings.insert(obj);
};
