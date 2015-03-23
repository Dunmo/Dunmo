(function () {
  "use strict";

  jasmine.DEFAULT_TIMEOUT_INTERVAL = jasmine.getEnv().defaultTimeoutInterval = 20000;

  describe('Login view', function() {

    it('should allow login', function() {
      var input = 'for 30 minutes';
      var ret   = Natural.parseDuration(input);
      var dur   = Date.toMilliseconds(30, 'minutes');
      expect(ret).toEqual( [ '', dur ] );
    });
  });

})();
