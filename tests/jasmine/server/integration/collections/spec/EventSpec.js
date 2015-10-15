
describe('event', function () {
  // No Instance Methods
});

describe('Events', function () {
  var now, startOfDayNow;

  beforeEach(function () {
    now = new Date();
    startOfDayNow = Number(now.startOfDay());
  });

  describe('createOrUpdate', function () {

    describe('when passed an empty array', function () {
      var events;

      beforeEach(function () {
        events = [];
        expected = [];
      });

      it('should return an empty array', function () {
        var ret = Events.createOrUpdate(events);
        expect(ret).toEqual([]);
      });

    });

    describe('when passed a correct event', function () {
      var event, expected;

      beforeEach(function () {
        var opt = {
          id:           'eventId-qwerty',
          status:       'confirmed',
          transparency: 'transparent',
          summary:      'event title',
          ownerId:      'userId-qwerty',
          start:        startOfDayNow + 12*HOURS,
          end:          startOfDayNow + 13*HOURS,
          created:      startOfDayNow + 10*HOURS,
          updated:      startOfDayNow + 10*HOURS
        };
        event = {
          id:            opt.id,
          status:        opt.status,
          transparency:  opt.transparency,
          summary:       opt.summary,
          ownerId:       opt.ownerId,
          start:         Date.formatGoog(opt.start),
          end:           Date.formatGoog(opt.end),
          created:       Date.formatGoog(opt.created),
          updated:       Date.formatGoog(opt.updated)
        };
        expected = {
          id:            opt.id,
          googleEventId: opt.id,
          status:        opt.status,
          _removed:      opt.status === 'cancelled' ? 'removed' : 'not removed',
          transparency:  opt.transparency,
          isTransparent: opt.transparency == 'transparent',
          title:         opt.summary,
          summary:       opt.summary,
          ownerId:       opt.ownerId,
          start:         opt.start,
          end:           opt.end,
          created:       opt.created,
          updated:       opt.updated
        };
      });

      it('should return the eventId', function () {
        var ret = Events.createOrUpdate(event);
        expect(typeof ret).toEqual('string');
      });

      it('should add that event to the database', function () {
        var ret = Events.createOrUpdate(event);
        var ret = Events.findOne(ret);
        delete ret._id;
        expect(TestHelpers.sortObj(ret)).toEqual(TestHelpers.sortObj(expected));
      });

    });

    describe('when passed an array of events', function () {
      var events;

      beforeEach(function () {
        var opt = {
          id:           'eventId-qwerty',
          status:       'confirmed',
          transparency: 'transparent',
          summary:      'event title',
          ownerId:      'userId-qwerty',
          start:        startOfDayNow + 12*HOURS,
          end:          startOfDayNow + 13*HOURS,
          created:      startOfDayNow + 10*HOURS,
          updated:      startOfDayNow + 10*HOURS
        };
        events = [{
          id:            opt.id,
          status:        opt.status,
          transparency:  opt.transparency,
          summary:       opt.summary,
          ownerId:       opt.ownerId,
          start:         Date.formatGoog(opt.start),
          end:           Date.formatGoog(opt.end),
          created:       Date.formatGoog(opt.created),
          updated:       Date.formatGoog(opt.updated)
        }];
        expected = {
          id:            opt.id,
          googleEventId: opt.id,
          status:        opt.status,
          _removed:      opt.status === 'cancelled' ? 'removed' : 'not removed',
          transparency:  opt.transparency,
          isTransparent: opt.transparency == 'transparent',
          title:         opt.summary,
          summary:       opt.summary,
          ownerId:       opt.ownerId,
          start:         opt.start,
          end:           opt.end,
          created:       opt.created,
          updated:       opt.updated
        };
      });

      it('should return an array', function () {
        var ret = Events.createOrUpdate(events);
        expect(Array.isArray(ret)).toBeTruthy();
      });

      it('should add those events to the database', function () {
        var ret = Events.createOrUpdate(events);
        var ret = Events.findOne(ret[0]);
        delete ret._id;
        expect(TestHelpers.sortObj(ret)).toEqual(TestHelpers.sortObj(expected));
      });

    });

  });

  describe('getTasks', function () {

    describe('when passed an empty array', function () {
      var events;

      beforeEach(function () {
        events = [];
      });

      it('should return an empty array', function () {
        var ret = Events.getTasks(events);
        expect(ret).toEqual([]);
      });

    });

    describe('when passed events', function () {
      var events;

      beforeEach(function () {
        events = [];
      });

      it('should return the corresponding tasks', function () {
        var ret = Events.getTasks(events);
        expect(ret).toEqual([]);
      });

    });

  });

});
