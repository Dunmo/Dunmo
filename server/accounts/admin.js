
var admin = {
  username: process.env.ADMIN_USERNAME,
  password: process.env.ADMIN_PASSWORD
};

Meteor.methods({
  'accounts/admin/set-password': function (username, password, options) {
    check(options.userId, String);
    check(options.newPassword, String);

    if(username !== admin.username || password !== admin.password) {
      throw new Meteor.Error(403, '[accounts/admin/set-password] Unauthorized.',
        'Only a Dunmo admin may use this method.');
    }

    Accounts.setPassword(options.userId, options.newPassword, options.options);
  }
});
