
describe('Freetimes', function () {
  var now, options, startOfDayNow;

  beforeEach(function () {
    now           = Number(Date.startOfToday()) + 12*HOURS;
    startOfDayNow = Number(Date.startOfDay(now));
    options = {
      granularity: 1*MINUTES,
      minTime:     now,
      maxTime:     now + 1*DAYS,
      startOfDay:  8*HOURS,
      endOfDay:    22*HOURS
    };
  });

  describe('_addStartEndTimes', function () {
    var busytimes, expected;

    describe('when busytimes is empty', function () {

      beforeEach(function () {
        busytimes = [];
        expected = {
          start: startOfDayNow + 22*HOURS,
          end:   startOfDayNow + 1*DAYS + 8*HOURS
        };
      });

      it('should work', function () {
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

    describe('when busytimes has one item', function () {
      var busytimes;

      beforeEach(function () {
        busytimes = [
          {
            start: startOfDayNow + 12*HOURS,
            end:   startOfDayNow + 14*HOURS
          }
        ];
        expected = [
          {
            start: startOfDayNow + 12*HOURS,
            end:   startOfDayNow + 14*HOURS
          }
        ];
      });

      it('should not alter the array', function () {
        var ret = Freetimes._coalesceBusytimes(busytimes);
        expect(ret).toEqual(expected);
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

    describe('when busytimes does not have overlapping stuff', function () {
      var busytimes;

      beforeEach(function () {
        busytimes = [
          {
            start: startOfDayNow + 12*HOURS,
            end:   startOfDayNow + 13*HOURS
          },
          {
            start: startOfDayNow + 14*HOURS,
            end:   startOfDayNow + 15*HOURS
          }
        ];
        expected = [
          {
            start: startOfDayNow + 12*HOURS,
            end:   startOfDayNow + 13*HOURS
          },
          {
            start: startOfDayNow + 14*HOURS,
            end:   startOfDayNow + 15*HOURS
          }
        ];
      });

      it('should not coalesce them', function () {
        var ret = Freetimes._coalesceBusytimes(busytimes);
        expect(ret.sort()).toEqual(expected.sort());
      });

    });

  });

  describe('_invertBusytimes', function () {
    var busytimes, expected;

    describe('when busytimes is empty', function () {

      beforeEach(function () {
        busytimes = [];
      });

      it('should return the entire range min to max', function () {
        var ret = Freetimes._invertBusytimes(busytimes, options);
        expect(ret).toEqual([{ start: options.minTime, end: options.maxTime }]);
      });

    });

    describe('when busytimes has one item', function () {
      var anotherThing;

      beforeEach(function () {
        anotherThing = {
          start: startOfDayNow + 13*HOURS,
          end:   startOfDayNow + 14*HOURS
        };
        busytimes = [anotherThing];
        expected = [
          {
            start: options.minTime,
            end:   anotherThing.start
          },
          {
            start: anotherThing.end,
            end:   options.maxTime
          }
        ];
      });

      it('should return the opposite', function () {
        var ret = Freetimes._invertBusytimes(busytimes, options);

        expect(ret.sort()).toEqual(expected.sort());
      });

    });

    describe('when busytimes has two items', function () {

      beforeEach(function () {
        busytimes = [
          {
            start: startOfDayNow + 13*HOURS,
            end:   startOfDayNow + 14*HOURS
          },
          {
            start: startOfDayNow + 15*HOURS,
            end:   startOfDayNow + 16*HOURS
          }
        ];
        expected = [
          {
            start: options.minTime,
            end:   busytimes[0].start
          },
          {
            start: busytimes[0].end,
            end:   busytimes[1].start
          },
          {
            start: busytimes[1].end,
            end:   options.maxTime
          }
        ];
      });

      it('should return the opposite', function () {
        var ret = Freetimes._invertBusytimes(busytimes, options);

        expect(ret.sort()).toEqual(expected.sort());
      });

    });

  });

  describe('fromBusytimes', function () {
    var busytimes, expected, filter;

    filter = function (arg) {
      if(Array.isArray(arg)) {
        return arg.map(function (timerange) { return filter(timerange); });
      }
      else return {
        start: arg.start,
        end:   arg.end
      };
    };

    describe('when busytimes is empty', function () {

      beforeEach(function () {
        busytimes = [];
        expected  = [
          {
            start: options.minTime,
            end:   startOfDayNow + 22*HOURS
          },
          {
            start: startOfDayNow + 1*DAYS + 8*HOURS,
            end:   options.maxTime
          }
        ];
      });

      it('should work', function () {
        var ret = Freetimes.fromBusytimes(busytimes, options);
        ret     = filter(ret);
        expect(ret.sort()).toEqual(expected.sort());
      });

    });

    describe('when busytimes has one item', function () {
      var anotherThing;

      beforeEach(function () {
        anotherThing = {
          start: startOfDayNow + 13*HOURS,
          end:   startOfDayNow + 14*HOURS
        };
        busytimes = [anotherThing];
        expected  = [
          {
            start: options.minTime,
            end:   anotherThing.start
          },
          {
            start: anotherThing.end,
            end:   startOfDayNow + 22*HOURS
          },
          {
            start: startOfDayNow + 1*DAYS + 8*HOURS,
            end:   options.maxTime
          }
        ];
      });

      it('should work', function () {
        var ret = Freetimes.fromBusytimes(busytimes, options);
        ret     = filter(ret);
        expect(ret.sort()).toEqual(expected.sort());
      });

    });

    describe('when busytimes has two items', function () {

      beforeEach(function () {
        busytimes = [
          {
            start: startOfDayNow + 13*HOURS,
            end:   startOfDayNow + 14*HOURS
          },
          {
            start: startOfDayNow + 15*HOURS,
            end:   startOfDayNow + 16*HOURS
          }
        ];
        expected = [
          {
            start: options.minTime,
            end:   busytimes[0].start
          },
          {
            start: busytimes[0].end,
            end:   busytimes[1].start
          },
          {
            start: busytimes[1].end,
            end:   startOfDayNow + 22*HOURS
          },
          {
            start: startOfDayNow + 1*DAYS + 8*HOURS,
            end:   options.maxTime
          }
        ];
      });

      it('should work', function () {
        var ret = Freetimes.fromBusytimes(busytimes, options);
        ret     = filter(ret);
        expect(ret.sort()).toEqual(expected.sort());
      });

    });

  });

});
