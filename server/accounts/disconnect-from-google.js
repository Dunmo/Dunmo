
Meteor.methods({
  'accounts/disconnect': function (serviceName) {
    var userId = this.userId;
    var unsetOptions = {};
    var servicePath = 'services.' + serviceName;
    var profilePath = 'profile.' + serviceName;
    unsetOptions[servicePath] = true;
    unsetOptions[profilePath] = true;
    Meteor.users.update(userId, { $unset: unsetOptions });
  }
});
