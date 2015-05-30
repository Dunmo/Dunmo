
describe('user', function () {

  var _user, _userEmail;
  var Users = Meteor.users;

  beforeEach(function () {
    // var taskId = Users.create();
    // _user      = Users.findOne(taskId);
    // _userEmail = 'test.dunmo@gmail.com';
    // _user = {
    //   services: {
    //     google: {
    //       email: _userEmail
    //     }
    //   }
    // };
  });

  describe('primaryEmailAddress', function () {

    it('should return the gmail address', function () {
      // var email = _user.primaryEmailAddress();
      // expect(email).toEqual(_userEmail);
      pending();
    });

    it('should return null when there is no gmail address', function () {
      // TODO
      pending();
    });

  });

});

describe('users', function () {
  // TODO
});
