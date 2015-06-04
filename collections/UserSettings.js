
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

var _helpers = collectionsDefault.instanceMethods(UserSettings);

UserSettings.helpers(_.extend(_helpers, {

  user: function () {
    return Meteor.users.findOne(this.userId);
  }

}));

_.extend(UserSettings, collectionsDefault.collectionMethods(UserSettings));

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
