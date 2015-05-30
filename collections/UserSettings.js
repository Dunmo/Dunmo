
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

  // Should only be called by its user's setRemoved method
  _setRemoved: collectionsDefault.setRemoved(UserSettings),

  update: collectionsDefault.update(UserSettings),

  user: function () {
    return Meteor.users.findOne(this.userId);
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
