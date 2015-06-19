
describe('Date', function () {
  var dateString, isoString;

  beforeEach(function () {
    dateString = 'Fri Jun 19 2015 10:23:27 GMT-0400 (EDT)';
    isoString  = '2015-06-19T14:23:27.000Z';
  });

  describe('formatGoog', function () {

    describe('when given a number of milliseconds', function () {
      var input, expected;

      beforeEach(function () {
        input    = Number(new Date(dateString));
        expected = isoString;
      });

      it('should work', function () {
        var ret = Date.formatGoog(input);
        expect(ret).toEqual(expected);
      });

    })

    describe('when given a date', function () {
      var input, expected;

      beforeEach(function () {
        input    = new Date(dateString);
        expected = isoString;
      });

      it('should work', function () {
        var ret = Date.formatGoog(input);
        expect(ret).toEqual(expected);
      });

    })

  });

  describe('ISOToMilliseconds', function () {

    describe('when given an ISO string', function () {
      var input, expected;

      beforeEach(function () {
        input    = isoString;
        expected = Number(new Date(dateString));
      });

      it('should work', function () {
        var ret = Date.ISOToMilliseconds(input);
        expect(ret).toEqual(expected);
      });

    });

  });

  describe('toMilliseconds', function () {

    describe('given a number of hours', function () {

      it('should convert to milliseconds', function () {
        var ret = Date.toMilliseconds('4', 'hours');
        expect(ret).toEqual(4*HOURS);
      });

    });

    describe('given a number of minutes', function () {

      it('should convert to milliseconds', function () {
        var ret = Date.toMilliseconds('4', 'minutes');
        expect(ret).toEqual(4*MINUTES);
      });

    });

  });

  describe('parseTime', function () {

    it('should', function () {
      pending();
    });

  });

  describe('timeString', function () {

    it('should', function () {
      pending();
    });

  });

  describe('startOfDay', function () {

    it('should', function () {
      pending();
    });

  });

  describe('endOfDay', function () {

    it('should', function () {
      pending();
    });

  });

  describe('startOfToday', function () {

    it('should', function () {
      pending();
    });

  });

  describe('endOfToday', function () {

    it('should', function () {
      pending();
    });

  });

  describe('currentYear', function () {

    it('should', function () {
      pending();
    });

  });

  describe('create', function () {

    it('should', function () {
      pending();
    });

  });

  describe('nearest', function () {

    it('should', function () {
      pending();
    });

  });

  describe('nearestMinute', function () {

    it('should', function () {
      pending();
    });

  });

});
