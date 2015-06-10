
/*
 * UserSettings
 * ==================
 * userId               : String
 * startOfDay           : Number<milliseconds>
 * endOfDay             : Number<milliseconds>
 * taskCalendarId       : String
 * referrals            : String[]
 * isReferred           : Boolean
 * lastReviewed         : Date
 * maxTaskInterval      : Number<milliseconds>
 * maxTimePerTaskPerDay : Number<milliseconds>
 * taskBreakInterval    : Number<milliseconds>
 * taskGranularity      : Number<milliseconds>
 *
 */

UserSettings.helpers({

  user: function () {
    return Meteor.users.findOne(this.userId);
  }

});

UserSettings.create = function(obj) {
  if(Array.isArray(obj)) {
    var ary = obj;
    return ary.forEach(function(o) {
      return UserSettings.create(o);
    });
  }

  var curr = UserSettings.findOne({ userId: obj.userId });
  if(curr) {
    curr.update(obj);
    return curr._id;
  }
  else return UserSettings.insert(obj);
};
