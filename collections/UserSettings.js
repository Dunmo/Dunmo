
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

  obj.startOfDay      = obj.startOfDay      || Date.parseTime('08:00');
  obj.endOfDay        = obj.endOfDay        || Date.parseTime('22:00');
  obj.maxTaskInterval = obj.maxTaskInterval || 2*HOURS;
  // obj.maxTimePerTaskPerDay = obj.maxTimePerTaskPerDay || 4*HOURS;
  // obj.taskBreakInterval    = obj.taskBreakInterval    || 30*MINUTES;
  obj.referrals  = obj.referrals  || []

  var curr = UserSettings.findOne({ userId: obj.userId });
  if(curr) {
    curr.update(obj);
    return curr._id;
  }
  else return UserSettings.insert(obj);
};
