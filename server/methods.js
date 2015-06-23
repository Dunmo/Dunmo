
Meteor.methods({

  createReferral: function (data) {
    var referrerEmail = data.referrerEmail;
    var userEmail     = data.userEmail;

    var users = Users.find().fetch();

    var referrer = _.find(users, function(user) {
      return user.primaryEmailAddress() === referrerEmail;
    });

    var user = _.find(users, function(user) {
      return user.primaryEmailAddress() === userEmail;
    });

    if(!referrer) return;

    var ret = referrer.addReferral(userEmail);
    if (ret == 1) user.referred(true);
  },

  fetchMailingList: function () {
    return Subscribers.fetch();
  },

  removeEvent: function (googleEventId) {
    var event = Events.findOne({ googleEventId: googleEventId });
    if(event) return Events.remove(event._id);
    else      return 0;
  }

});
