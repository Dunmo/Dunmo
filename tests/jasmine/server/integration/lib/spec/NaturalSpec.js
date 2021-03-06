
describe('Natural', function() {

  // everything is measured in milliseconds
  var SECONDS = 1000;
  var MINUTES = 60 * SECONDS;
  var HOURS   = 60 * MINUTES;

  describe('parseImportance', function () {

    it('should', function() {
      pending();
    });

  });

  describe('parseDueAt', function () {

    it('should', function() {
      pending();
    });

  });

  describe('parseDuration', function () {

    it('should be able to parse minutes', function() {
      var input = 'for 30 minutes';
      var ret   = Natural.parseDuration(input);
      var dur   = Date.toMilliseconds(30, 'minutes');
      expect(ret).toEqual( [ '', dur ] );
    });

    it('should be able to parse hours', function() {
      var input = 'for 2 hours';
      var ret   = Natural.parseDuration(input);
      var dur   = Date.toMilliseconds(2, 'hours');
      expect(ret).toEqual( [ '', dur ] );
    });

    it('should be able to parse hours and minutes', function() {
      var input   = 'for 2 hours and 30 minutes';
      var ret     = Natural.parseDuration(input);
      var hours   = Date.toMilliseconds(2, 'hours');
      var minutes = Date.toMilliseconds(30, 'minutes');
      var dur     = hours + minutes;
      expect(ret).toEqual( [ '', dur ] );
    });

    it('should be able to parse from a sentence', function() {
      var input = 'do the thing for 2 hours and 30 minutes before tonight at 7pm';
      var ret = Natural.parseDuration(input);
      var hours   = Date.toMilliseconds(2, 'hours');
      var minutes = Date.toMilliseconds(30, 'minutes');
      var dur     = hours + minutes;
      expect(ret).toEqual( [ 'do the thing before tonight at 7pm', dur ] );
    });

  });

  describe('parseTitle', function () {

    it('should', function() {
      pending();
    });

  });

  describe('parseTask', function () {

    it('should', function() {
      pending();
    });

  });

});
