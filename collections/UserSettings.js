
/*
 * UserSettings
 * ==================
 * userId         : String
 * startOfDay     : Number (Duration)
 * endOfDay       : Number (Duration)
 * taskCalendarId : String
 * referrals      : String[]
 * isReferred     : Boolean
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

  obj.referrals  = obj.referrals  || []

  var curr = UserSettings.findOne({ userId: obj.userId });
  if(curr) return curr.update(obj);
  else     return UserSettings.insert(obj);
};
