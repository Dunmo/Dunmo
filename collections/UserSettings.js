
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

  obj.referrals  = obj.referrals  || []

  var curr = UserSettings.findOne({ userId: obj.userId });
  if(curr) {
    curr.update(obj);
    return curr._id;
  }
  else return UserSettings.insert(obj);
};
