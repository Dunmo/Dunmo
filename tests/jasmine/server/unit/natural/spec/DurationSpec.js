(function () {
  "use strict";

  jasmine.DEFAULT_TIMEOUT_INTERVAL = jasmine.getEnv().defaultTimeoutInterval = 20000;

  describe('Natural', function() {
    // everything is measured in milliseconds
    var SECONDS = 1000;
    var MINUTES = 60 * SECONDS;
    var HOURS   = 60 * MINUTES;

    it('should be able to parse durations', function() {
      var input = '30 minutes';
      var ret = Natural.parseDuration(input);
      var dur = Moment.duration(30 * MINUTES);
      expect(ret).toEqual( [ '',  ] );
    });
  });

})();
