
describe('Date', function () {
  var dateString, isoString, startOfDayString, endOfDayString;

  dateString       = 'Fri Jun 19 2015 10:23:27 GMT-0400 (EDT)';
  startOfDayString = 'Fri Jun 19 2015 00:00:00 GMT-0400 (EDT)';
  endOfDayString   = 'Fri Jun 19 2015 23:59:00 GMT-0400 (EDT)';
  isoString        = '2015-06-19T14:23:27.000Z';

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

  describe('timeString', function () {

    describe('given a number of milliseconds', function () {

      it('should return the correct time string', function () {
        var ret = Date.timeString(14*HOURS + 4*MINUTES);
        expect(ret).toEqual('14:04');
      });

    });

  });

  describe('startOfDay', function () {

    describe('given a date in the middle of a day', function () {

      it('should return the date for 12:00am on that day', function () {
        var ret = Date.startOfDay(dateString);
        expect(ret).toEqual(new Date(startOfDayString));
      });

    });

    describe('given a date at 11:59pm of a day', function () {

      it('should return the date for 12:00am on that day', function () {
        var ret = Date.startOfDay(endOfDayString);
        expect(ret).toEqual(new Date(startOfDayString));
      });

    });

  });

  describe('endOfDay', function () {

    describe('given a date in the middle of a day', function () {

      it('should return the date for 11:59pm on that day', function () {
        var ret = Date.endOfDay(dateString);
        expect(ret).toEqual(new Date(endOfDayString));
      });

    });

    describe('given a date at 12:00am of a day', function () {

      it('should return the date for 11:59pm on that day', function () {
        var ret = Date.endOfDay(startOfDayString);
        expect(ret).toEqual(new Date(endOfDayString));
      });

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
