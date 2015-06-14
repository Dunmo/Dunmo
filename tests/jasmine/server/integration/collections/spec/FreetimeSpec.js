
describe('Freetimes', function () {

  describe('_addStartEndTimes', function () {
    var busytimes, expected, now, options, startOfDayNow;

    beforeEach(function () {
      now = Number(Date.startOfDay()) + 12*HOURS;
      startOfDayNow = Number(Date.startOfDay(now));
      busytimes = [];
      options = {
        minTime:    now,
        maxTime:    now + 1*DAYS,
        startOfDay: 8*HOURS,
        endOfDay:   22*HOURS
      };
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

    it('', function () {

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
