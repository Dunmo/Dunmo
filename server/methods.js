
Meteor.methods({

  update (collectionName, docId, modifier) {
    let self = this;
    let collection = Collections[collectionName];
    var isSetOperation = _.keys(modifier).every(function(k) { return k.charAt(0) !== '$'; });
    if(isSetOperation) {
      _.forOwn(modifier, function(value, key) {
        self[key] = value;
      });
      modifier = { $set: modifier };
    }
    collection.update(docId, modifier);
  },

  createReferral: function (data) {
    var referrerEmail = data.referrerEmail;
    var userEmail     = data.userEmail;

    var users = Users.fetch();

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

  removeEvent: function (googleEventId) {
    var event = Events.findOne({ googleEventId: googleEventId });
    if(event) return Events.remove(event._id);
    else      return 0;
  },

  updateTask: function (id, modifier) {
    Tasks.update({_id: id}, modifier);
  },

});
