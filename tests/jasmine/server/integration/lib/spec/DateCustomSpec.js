
describe('Date', function () {
  var dateString, isoString, startOfDayString, endOfDayString;

  dateString       = 'Fri Jun 19 2015 10:23:00 GMT-0400 (EDT)';
  startOfDayString = 'Fri Jun 19 2015 00:00:00 GMT-0400 (EDT)';
  endOfDayString   = 'Fri Jun 19 2015 23:59:00 GMT-0400 (EDT)';
  thursDateString  = 'Thu Jun 25 2015 10:23:00 GMT-0400 (EDT)';
  saturDateString  = 'Sat Jun 20 2015 10:23:00 GMT-0400 (EDT)';
  isoString        = '2015-06-19T14:23:00.000Z';

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

  describe('create', function () {
    var _startOfDay = Date.startOfDay

    Date.startOfDay = function () { return new Date(startOfDayString); };

    describe('given a day of the week in the past', function () {

      it('should return the date for next week', function () {
        var ret = Date.create('thursday at 10:23am');
        expect(ret).toEqual(new Date(thursDateString));
      });

    });

    describe('given a day of the week in the future', function () {

      it('should return the date for this week', function () {
        var ret = Date.create('saturday at 10:23am');
        expect(ret).toEqual(new Date(saturDateString));
      });

    });

    describe('given today\'s day of the week', function () {

      it('should return the date for this week', function () {
        var ret = Date.create('friday at 10:23am');
        expect(ret).toEqual(new Date(dateString));
      });

    });

    Date.startOfDay = _startOfDay;

  });

  describe('floor', function () {

    describe('given an uneven number of minutes', function () {

      it('should floor it to the nearest minute', function () {
        var ret = Date.floor(3659999, MINUTES);
        expect(ret).toEqual(3600000);
      });

    });

  });

  describe('ceiling', function () {

    describe('given an uneven number of minutes', function () {

      it('should round up to the nearest minute', function () {
        var ret = Date.ceiling(3600001, MINUTES);
        expect(ret).toEqual(3660000);
      });

    });

  });

  describe('nearest', function () {

    describe('given an uneven number of minutes close to the last minute', function () {

      it('should round it down to the nearest minute', function () {
        var ret = Date.nearest(3600001, MINUTES);
        expect(ret).toEqual(3600000);
      });

    });

    describe('given an uneven number of minutes close to the next minute', function () {

      it('should round it up to the nearest minute', function () {
        var ret = Date.nearest(3659999, MINUTES);
        expect(ret).toEqual(3660000);
      });

    });

  });

  describe('durationWithinRange', function () {

    describe('given x1 > x2 && y1 > y2', function () {

      it('should work', function () {
        var ret = Date.durationWithinRange([100, 200], [50, 150]);
        expect(ret).toEqual(50);
      });

    });

    describe('given x1 < x2 && y1 > y2', function () {

      it('should work', function () {
        var ret = Date.durationWithinRange([50, 200], [100, 150]);
        expect(ret).toEqual(50);
      });

    });

    describe('given x1 > x2 && y1 < y2', function () {

      it('should work', function () {
        var ret = Date.durationWithinRange([100, 175], [50, 200]);
        expect(ret).toEqual(75);
      });

    });

    describe('given x1 < x2 && y1 < y2', function () {

      it('should work', function () {
        var ret = Date.durationWithinRange([50, 125], [100, 150]);
        expect(ret).toEqual(25);
      });

    });

  });

  describe('numberOfDaysInRangeInclusive', function () {

    describe('given two dates on the same day', function () {

      it('should return zero', function () {
        var start = new Date(startOfDayString);
        var end   = new Date(dateString);
        var ret   = Date.numberOfDaysInRangeInclusive(start, end);
        expect(ret).toEqual(0);
      });

    });

    describe('given a range starting thursday and ending saturday', function () {

      it('should return one', function () {
        var start = new Date(Number(new Date(dateString)) - 1*DAYS);
        var end   = new Date(saturDateString);
        var ret   = Date.numberOfDaysInRangeInclusive(start, end);
        expect(ret).toEqual(1);
      });

    });

  });

});
