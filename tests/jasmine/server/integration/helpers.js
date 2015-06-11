
TestHelpers = {
  fakeUser: function () {
    var userId = Accounts.createUser({
      email: faker.internet.email(),
      password: 'password'
    });
    return Meteor.users.findOne(userId);
  }
};
