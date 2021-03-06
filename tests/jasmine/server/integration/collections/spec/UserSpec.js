
describe('user', function () {
  var user;

  var defaultTask = {
    title: 'req',
    importance: 1,      // required
    remaining: 1*HOURS, // required
    dueAt: moment().add(1, 'days').toDate(), // required
  };

  var defaultCalendar = {
    ownerId: 'req',
    googleCalendarId: 'req',
    summary: 'req',
  };

  beforeEach(function () {
    user = TestHelpers.fakeUser();
  });

  // TODO: settings setters and filters

  describe('primaryEmailAddress', function () {

    it('should work when there\'s no services property', function () {
      user.services = null;
      user.primaryEmailAddress(); // shouldn't throw an error

      delete user.services;
      user.primaryEmailAddress(); // shouldn't throw an error
    });

    it('should work when there\'s no services.google property', function () {
      user.services = { google: null };
      user.primaryEmailAddress(); // shouldn't throw an error

      if(user.services && user.services.google) delete user.services.google;
      user.primaryEmailAddress(); // shouldn't throw an error
    });

    it('should return the gmail address by default', function () {
      var expected = user.services.google.email;
      var email    = user.primaryEmailAddress();
      expect(email).toEqual(expected);
    });

  });

  xdescribe('hasOnboarded', function () {

    it('should return the hasOnboarded object when no input is given', function () {
      user.setHasOnboarded('taskView', true);
      var onboardedObject = user.hasOnboarded();
      expect(onboardedObject).toEqual({ taskView: true });
    });

    it('should return the value for the given onboarding view', function () {
      user.setHasOnboarded('taskView', true);
      var onboardedObject = user.hasOnboarded('taskView');
      expect(onboardedObject).toBeTruthy();
    });

    it('should be falsy when the given onboarding view doesn\'t exist', function () {
      var onboardedObject = user.hasOnboarded('taskView');
      expect(onboardedObject).toBeFalsy();
    });

  });

  xdescribe('addReferral', function () {

    it('should insert the email', function () {
      var email = "test@example.com";
      user.addReferral(email);
      expect(user.referrals()).toContain(email);
    });

    it('shouldn\'t insert the email twice', function () {
      var email = "test@example.com";

      user.addReferral(email);
      var expected = user.referrals();

      user.addReferral(email);
      var actual = user.referrals();

      expect(actual.sort()).toEqual(expected.sort());
    });

  });

  xdescribe('removeReferral', function () {

    it('should work', function () {
      var email = "test@example.com";
      user.addReferral(email);
      user.removeReferral(email);
      expect(user.referrals()).not.toContain(email);
    });

  });

  describe('tasks', function () {

    beforeEach(function () {
      var userId = user._id;
      var tasks  = [
        { id: 1, ownerId: userId   },
        { id: 2, ownerId: 'someId' },
      ];
      tasks.forEach(function (task) {
        task = _.defaults(task, defaultTask);
        Tasks.insert(task);
      });
    });

    it('should only return tasks owned by this user', function () {
      var tasks = user.tasks();
      tasks     = tasks.fetch();

      tasks.forEach(function (task) {
        expect(task.ownerId).toEqual(user._id);
      });
    });

  });

  describe('todos', function () {

    beforeEach(function () {
      var userId = user._id;
      var tasks  = [
        { id: 1, ownerId: userId,   isDone: true  },
        { id: 2, ownerId: userId,   isDone: false },
        { id: 3, ownerId: 'someId', isDone: false },
      ];
      tasks.forEach(function (task) {
        task = _.defaults(task, defaultTask);
        Tasks.insert(task);
      });
    });

    it('should only return tasks owned by this user', function () {
      var tasks = user.todos();
      tasks     = tasks.fetch();

      tasks.forEach(function (task) {
        expect(task.ownerId).toEqual(user._id);
      });
    });

    it('should only return tasks for which isDone is false', function () {
      var tasks = user.todos();
      tasks     = tasks.fetch();

      tasks.forEach(function (task) {
        expect(task.isDone).toBeFalsy();
      });
    });

  });

  xdescribe('onboardingTasks', function () {

    beforeEach(function () {
      var userId = user._id;
      var tasks  = [
        { id: 1, ownerId: userId, isOnboardingTask: true  },
        { id: 2, ownerId: userId, isOnboardingTask: false }
      ];
      tasks.forEach(function (task) {
        task = _.defaults(task, defaultTask);
        Tasks.insert(task);
      });
    });

    it('should return the correct tasks', function () {
      var tasks   = user.onboardingTasks();
      tasks.forEach(function (task) {
        expect(task.id).toEqual(2);
      });
    });

    it('should only return tasks for which isOnboardingTask is true', function () {
      var tasks   = user.onboardingTasks();
      tasks.forEach(function (task) {
        expect(task.isOnboardingTask).toBeTruthy();
      });
    });

  });

  xdescribe('freetimes', function () {

    beforeEach(function () {
      var userId = user._id;
      var freetimes  = [
        { id: 1, ownerId: userId },
        { id: 2, ownerId: userId }
      ];
      freetimes.forEach(function (task) { Freetimes.insert(task); });
    });

    it('should return freetimes', function () {
      var freetimes = user.freetimes();
      expect(freetime.length).toBeGreaterThan(0);
    });

    it('should only return freetimes for this user', function () {
      var userId = user._id;
      var freetimes = user.freetimes();
      freetimes.forEach(function (freetime) {
        expect(freetime.ownerId).toEqual(userId);
      });
    });

  });

  describe('calendars', function () {

    beforeEach(function () {
      var userId    = user._id;
      var calendars = [
        { id: 1, ownerId: userId   },
        { id: 2, ownerId: 'someId' },
      ];
      calendars.forEach(function (calendar) {
        calendar = _.defaults(calendar, defaultCalendar);
        Calendars.insert(calendar);
      });
    });

    it('should return calendars', function () {
      var calendars = user.calendars();
      expect(calendars.count()).toBeGreaterThan(0);
    });

    it('should only return calendars for this user', function () {
      var userId = user._id;
      var calendars = user.calendars();
      calendars.forEach(function (calendar) {
        expect(calendar.ownerId).toEqual(userId);
      });
    });

  });

  describe('activeCalendars', function () {

    beforeEach(function () {
      var calendars = [
        { id: 1, ownerId: user._id, active: true  },
        { id: 2, ownerId: user._id, active: false }
      ];
      calendars.forEach(function (calendar) {
        calendar = _.defaults(calendar, defaultCalendar);
        Calendars.insert(calendar);
      });
    });

    it('should return calendars', function () {
      var calendars = user.activeCalendars();
      expect(calendars.count()).toBeGreaterThan(0);
    });

    it('should only return calendars that are active', function () {
      var calendars = user.activeCalendars().fetch();
      calendars.forEach(function (calendar) {
        expect(calendar.active).toBeTruthy();
      });
    });

  });

  describe('calendarIdObjects', function () {

    beforeEach(function () {
      var calendars = [
        { id: 1, googleCalendarId: 'gcalId' },
      ];
      calendars.forEach(function (calendar) {
        calendar = _.defaults(calendar, defaultCalendar);
        Calendars.insert(calendar);
      });
    });

    it('should return calendarIdObjects', function () {
      var objects = user.calendarIdObjects();
      objects.forEach(function (obj) {
        expect(obj.id).not.toBeFalsy();
      });
    });

  });

  describe('tags', function () {

    beforeEach(function () {
      var userId = user._id;
      var tasks = [
        { id: 1, ownerId: userId, tags: []               },
        { id: 2, ownerId: userId, tags: ['tag1']         },
        { id: 3, ownerId: userId, tags: ['tag1', 'tag2'] },
      ];
      tasks.forEach(function (task) {
        task = _.defaults(task, defaultTask);
        Tasks.insert(task);
      });
    });

    it('should return tags', function () {
      var tags = user.tags();
      expect(tags.count()).toBeGreaterThan(0);
    });

    it('should return the correct tags', function () {
      var tags = user.tags();
      expect(tags.sort()).toEqual(['tag1', 'tag2'].sort());
    });

  });

  describe('activeTags', function () {

    beforeEach(function () {
      var userId = user._id;
      var tasks = [
        { id: 1, ownerId: userId, isDone: true,  tags: ['tag1']         },
        { id: 2, ownerId: userId, isDone: true,  tags: ['tag2']         },
        { id: 3, ownerId: userId, isDone: false, tags: ['tag2', 'tag3'] },
      ];
      tasks.forEach(function (task) {
        task = _.defaults(task, defaultTask);
        Tasks.insert(task);
      });
    });

    it('should return tags', function () {
      var tags = user.activeTags();
      expect(tags.count()).toBeGreaterThan(0);
    });

    it('should only return tags that are active', function () {
      var tags = user.activeTags();
      expect(tags.sort()).toEqual(['tag2', 'tag3'].sort());
    });

  });

  describe('latestTodoTime', function () {
    var laterDate;

    beforeEach(function () {
      var userId = user._id;
      laterDate = moment().add(1, 'days').toDate();
      var tasks = [
        { id: 1, ownerId: userId, dueAt: new Date() },
        { id: 2, ownerId: userId, dueAt: laterDate },
      ];
      tasks.forEach(function (task) {
        task = _.defaults(task, defaultTask);
        Tasks.insert(task);
      });
    });

    it('should return the value of dueAt for the latest due task', function () {
      var latestTodoTime = user.latestTodoTime();
      expect(latestTodoTime).toEqual(laterDate);
    });

  });

  describe('events', function () {

    beforeEach(function () {
      var userId = user._id;
      var events = [
        { id: 1, ownerId: userId },
        { id: 2, ownerId: userId, isRemoved: false },
        { id: 3, ownerId: userId, isRemoved: true },
        { id: 4, ownerId: 'someId' }
      ];
      events.forEach(function (event) { Events.insert(event); });
    });

    it('should return events', function () {
      var events = user.events();
      expect(events.count()).toBeGreaterThan(0);
    });

    it('should return events owned by this user', function () {
      var events = user.events();
      events.forEach(function (event) {
        expect(event.ownerId).toEqual(user._id);
      });
    });

    it('should return events for which isRemoved is falsy', function () {
      var events = user.events();
      events.forEach(function (event) {
        expect(event.isRemoved).toBeFalsy();
      });
    });

  });

  describe('calendarEvents', function () {

    beforeEach(function () {
      var userId = user._id;
      var events = [
        { id: 1, ownerId: userId },
        { id: 2, ownerId: userId, taskId: null },
        { id: 3, ownerId: userId, taskId: undefined },
        { id: 4, ownerId: userId, taskId: false },
        { id: 5, ownerId: userId, taskId: 'someId' }
      ];
      events.forEach(function (event) { Events.insert(event); });
    });

    it('should return calendarEvents', function () {
      var calendarEvents = user.calendarEvents();
      expect(calendarEvents.count()).toBeGreaterThan(0);
    });

    it('should return all calendarEvents for which the taskId is not set', function () {
      var calendarEvents   = user.calendarEvents().fetch();
      var calendarEventIds = _.pluck(calendarEvents, 'id');
      expect(calendarEventIds.sort()).toEqual([1, 2, 3, 4].sort());
    });

  });

  describe('taskEvents', function () {

    beforeEach(function () {
      var userId = user._id;
      var events = [
        { id: 1, ownerId: userId },
        { id: 2, ownerId: userId, taskId: null },
        { id: 3, ownerId: userId, taskId: undefined },
        { id: 4, ownerId: userId, taskId: false },
        { id: 5, ownerId: userId, taskId: 'someId' }
      ];
      events.forEach(function (event) { Events.insert(event); });
    });

    it('should return taskEvents', function () {
      var taskEvents = user.taskEvents();
      expect(taskEvents.count()).toBeGreaterThan(0);
    });

    it('should return all taskEvents for which the taskId is not set', function () {
      var taskEvents   = user.taskEvents().fetch();
      var taskEventIds = _.pluck(taskEvents, 'id');
      expect(taskEventIds).toEqual([5]);
    });

  });

  describe('fetchTaskEventsInRange', function () {

    beforeEach(function () {
      var userId = user._id;
      var events = [
        { id: 1, ownerId: userId, taskId: 'someId', start: -5,  end: 5   },
        { id: 2, ownerId: userId, taskId: null,     start: 15,  end: 25  },
        { id: 3, ownerId: userId, taskId: 'someId', start: 25,  end: 50  },
        { id: 4, ownerId: userId, taskId: 'someId', start: 90,  end: 105 },
        { id: 5, ownerId: userId, taskId: 'someId', start: 105, end: 115 }
      ];
      events.forEach(function (event) { Events.insert(event); });
    });

    it('should return task events', function () {
      var fetchTaskEventsInRange = user.fetchTaskEventsInRange(0, 100);
      expect(fetchTaskEventsInRange.count()).toBeGreaterThan(0);
    });

    it('should return all task events within the range', function () {
      var taskEvents   = user.fetchTaskEventsInRange(0, 100);
      var taskEventIds = _.pluck(taskEvents, 'id');
      expect(taskEventIds.sort()).toEqual([1, 3, 4].sort());
    });

  });

  describe('lengthOfWorkday', function () {
    var customUser;

    beforeEach(function () {
      customUser = {
        startOfDay: UserHelpers.startOfDay,
        endOfDay:  UserHelpers.endOfDay,
        lengthOfWorkday: UserHelpers.lengthOfWorkday,
      }
    });

    it('should work', function () {
      customUser.profile = {
        settings: {
          startOfDay: Date.parseTime('09:30'),
          endOfDay: Date.parseTime('17:30'),
        }
      };
      var actual = customUser.lengthOfWorkday();
      expect(actual).toEqual(8*HOURS);
    });

  });

  xdescribe('workTimeInRange', function () {
    var customUser;

    beforeEach(function () {
      customUser = {
        profile: {
          settings: {
            startOfDay: Date.parseTime('09:30'),
            endOfDay:   Date.parseTime('17:30'),
          }
        },
        startOfDay: UserHelpers.startOfDay,
        endOfDay:   UserHelpers.endOfDay,
        _lastStart: UserHelpers._lastStart,

        _isOutsideDay:     UserHelpers._isOutsideDay,
        _nextStart:        UserHelpers._nextStart,
        _lastEnd:          UserHelpers._lastEnd,
        _isSameWorkday:    UserHelpers._isSameWorkday,
        _numberOfWorkdaysInRangeInclusive: UserHelpers._numberOfWorkdaysInRangeInclusive,
        lengthOfWorkday:   UserHelpers.lengthOfWorkday,
        _beginningSegment: UserHelpers._beginningSegment,
        _endSegment:       UserHelpers._endSegment,

        workTimeInRange: UserHelpers.workTimeInRange,

      }
    });

    describe('for one workday', function () {

      it('should work within a workday', function () {
        var start  = new Date('Wed Jun 24 2015 12:30:00 GMT-0400 (EDT)');
        var end    = new Date('Wed Jun 24 2015 15:30:00 GMT-0400 (EDT)');
        var actual = user.workTimeInRange(start, end);
        expect(actual).toEqual(3*HOURS);
      });

      xit('should work when start is outside the workday', function () {
        var start  = new Date('Wed Jun 24 2015 7:30:00 GMT-0400 (EDT)');
        var end    = new Date('Wed Jun 24 2015 10:30:00 GMT-0400 (EDT)');
        var actual = user.workTimeInRange(start, end);
        expect(actual).toEqual(3*HOURS);
      });

      xit('should work when end is outside the workday', function () {
        var start  = new Date('Wed Jun 24 2015 15:30:00 GMT-0400 (EDT)');
        var end    = new Date('Wed Jun 24 2015 18:30:00 GMT-0400 (EDT)');
        var actual = user.workTimeInRange(start, end);
        expect(actual).toEqual(3*HOURS);
      });

      xit('should work when start and end are outside the workday', function () {
        var start  = new Date('Wed Jun 24 2015 8:30:00 GMT-0400 (EDT)');
        var end    = new Date('Wed Jun 24 2015 18:30:00 GMT-0400 (EDT)');
        var actual = user.workTimeInRange(start, end);
        expect(actual).toEqual(8*HOURS);
      });

    });

  });

  xdescribe('productivityPercentage', function () {

    beforeEach(function () {
      var userId = user._id;
      var events = [
        { id: 1, ownerId: userId, taskId: 'someId', start: -5,  end: 5   },
        { id: 2, ownerId: userId, taskId: null,     start: 15,  end: 25  },
        { id: 3, ownerId: userId, taskId: 'someId', start: 25,  end: 50  },
        { id: 4, ownerId: userId, taskId: 'someId', start: 90,  end: 105 },
        { id: 5, ownerId: userId, taskId: 'someId', start: 105, end: 115 }
      ];
      events.forEach(function (event) { Events.insert(event); });
    });

    it('should return the correct value', function () {
      var actual   = user.productivityPercentage(0, 100);
      var taskTime = (5-0)+(50-25)+(100-90);
      var expected = taskTime/100;
      expect(actual).toEqual(expected);
    });

  });

});

describe('Users', function () {

  describe('findByEmail', function () {

    it('should', function () {
      pending();
    });

  });

  describe('create', function () {

    it('should', function () {
      pending();
    });

  });

});
