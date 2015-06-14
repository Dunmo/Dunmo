
describe('Freetimes', function () {
  var now, options, startOfDayNow;

  beforeEach(function () {
    now = Number(Date.startOfDay()) + 12*HOURS;
    startOfDayNow = Number(Date.startOfDay(now));
    options = {
      minTime:    now,
      maxTime:    now + 1*DAYS,
      startOfDay: 8*HOURS,
      endOfDay:   22*HOURS
    };
  });

  describe('_addStartEndTimes', function () {
    var busytimes, expected;

    beforeEach(function () {
      busytimes = [];
      expected = {
        start: startOfDayNow + 22*HOURS,
        end:   startOfDayNow + 1*DAYS + 8*HOURS
      };
    });

    describe('when busytimes is empty', function () {

      it('should work', function () {
        console.log('busytimes: ', busytimes);
        var ret = Freetimes._addStartEndTimes(busytimes, options);
        expect(ret).toEqual([expected]);
      });

    });

    describe('when busytimes has stuff', function () {
      var anotherThing;

      beforeEach(function () {
        anotherThing = {
          start: startOfDayNow + 1*DAYS + 12*HOURS,
          end:   startOfDayNow + 1*DAYS + 13*HOURS
        };
        busytimes = [anotherThing];
      });

      it('should work', function () {
        var ret = Freetimes._addStartEndTimes(busytimes, options);
        expect(ret).toContain(expected);
      });

      it('shouldn\'t affect the other stuff', function () {
        var ret = Freetimes._addStartEndTimes(busytimes, options);
        expect(ret).toContain(anotherThing);
      });

      it('shouldn\'t add extra stuff', function () {
        var ret = Freetimes._addStartEndTimes(busytimes, options);
        expect(ret.length).toBe(2);
      });

    });

  });

  describe('_coalesceBusytimes', function () {

    describe('when busytimes is empty', function () {
      var busytimes;

      beforeEach(function () {
        busytimes = [];
      });

      it('should return an empty array', function () {
        var ret = Freetimes._coalesceBusytimes(busytimes);
        expect(ret).toEqual([]);
      });

    });

    describe('when busytimes has overlapping stuff', function () {
      var busytimes;

      beforeEach(function () {
        busytimes = [
          {
            start: startOfDayNow + 12*HOURS,
            end:   startOfDayNow + 14*HOURS
          },
          {
            start: startOfDayNow + 13*HOURS,
            end:   startOfDayNow + 15*HOURS
          }
        ];
        expected = [
          {
            start: startOfDayNow + 12*HOURS,
            end:   startOfDayNow + 15*HOURS
          }
        ];
      });

      it('should coalesce them', function () {
        var ret = Freetimes._coalesceBusytimes(busytimes);
        expect(ret).toEqual(expected);
      });

    });

  });

  describe('_invertBusytimes', function () {

    it('', function () {

    });

  });

  describe('_toFreetimes', function () {

    it('', function () {

    });

  });

});
