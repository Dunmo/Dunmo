
describe('subscriber', function () {

  var _subscriber;

  beforeEach(function () {
    var subscriberId = Subscribers.create('test@example.com');
    _subscriber      = Subscribers.findOne(subscriberId);
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
