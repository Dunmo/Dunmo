
describe('user', function () {
  var user;

  beforeEach(function () {
    user = TestHelpers.fakeUser();
  });

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

  describe('createSettings', function () {

    it('should create a settings object', function () {
      user.createSettings();
      var settings = UserSettings.findOne({ userId: user._id });
      expect(settings).toBeTruthy();
    });

    it('should return the settings object', function () {
      var settings = user.createSettings();
      var expected = UserSettings.findOne({ userId: user._id });
      expect(settings).toEqual(expected);
    });

  });

  describe('settings', function () {

    it('should return the settings object', function () {
      var expected = user.createSettings();
      var settings = user.settings();
      expect(settings).toEqual(expected);
    });

    it('should create one if there is no settings object', function () {
      var settings = user.settings();
      expect(settings).toBeTruthy();
    });

  });

  describe('hasOnboarded', function () {

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

  describe('addReferral', function () {

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

  describe('removeReferral', function () {

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
        { id: 2, ownerId: 'someId' }
      ];
      tasks.forEach(function (task) { Tasks.insert(task); });
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
        { id: 3, ownerId: 'someId', isDone: false }
      ];
      tasks.forEach(function (task) { Tasks.insert(task); });
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

  describe('recentTodos', function () {

    beforeEach(function () {
      var userId = user._id;
      var tasks  = [
        { id: 1, ownerId: userId, needsReviewed: true  },
        { id: 2, ownerId: userId, needsReviewed: false }
      ];
      tasks.forEach(function (task) { Tasks.insert(task); });
    });

    it('should return the correct tasks', function () {
      var tasks   = user.recentTodos();
      tasks.forEach(function (task) {
        expect(task.id).toEqual(1);
      });
    });

    it('should only return tasks for which needsReviewed is true', function () {
      var tasks   = user.recentTodos();
      tasks.forEach(function (task) {
        expect(task.needsReviewed).toBeTruthy();
      });
    });

  });

  describe('upcomingTodos', function () {

    beforeEach(function () {
      var userId = user._id;
      var tasks  = [
        { id: 1, ownerId: userId, needsReviewed: true  },
        { id: 2, ownerId: userId, needsReviewed: false }
      ];
      tasks.forEach(function (task) { Tasks.insert(task); });
    });

    it('should return the correct tasks', function () {
      var tasks   = user.upcomingTodos();
      tasks.forEach(function (task) {
        expect(task.id).toEqual(2);
      });
    });

    it('should only return tasks for which needsReviewed is false', function () {
      var tasks   = user.upcomingTodos();
      tasks.forEach(function (task) {
        expect(task.needsReviewed).toBeFalsy();
      });
    });

  });

  describe('onboardingTasks', function () {

    beforeEach(function () {
      var userId = user._id;
      var tasks  = [
        { id: 1, ownerId: userId, isOnboardingTask: true  },
        { id: 2, ownerId: userId, isOnboardingTask: false }
      ];
      tasks.forEach(function (task) { Tasks.insert(task); });
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

  // describe('freetimes', function () {

  //   beforeEach(function () {
  //     var userId = user._id;
  //     var freetimes  = [
  //       { id: 1, ownerId: userId },
  //       { id: 2, ownerId: userId }
  //     ];
  //     freetimes.forEach(function (task) { Freetimes.insert(task); });
  //   });

  //   it('should return freetimes', function () {
  //     var freetimes = user.freetimes();
  //     expect(freetime.length).toBeGreaterThan(0);
  //   });

  //   it('should only return freetimes for this user', function () {
  //     var userId = user._id;
  //     var freetimes = user.freetimes();
  //     freetimes.forEach(function (freetime) {
  //       expect(freetime.ownerId).toEqual(userId);
  //     });
  //   });

  // });

  describe('calendars', function () {

    beforeEach(function () {
      var userId    = user._id;
      var calendars = [
        { id: 1, ownerId: userId   },
        { id: 2, ownerId: 'someId' }
      ];
      calendars.forEach(function (calendar) { Calendars.insert(calendar); });
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
      calendars.forEach(function (calendar) { Calendars.insert(calendar); });
    });

    it('should return calendars', function () {
      var calendars = user.calendars();
      expect(calendars.count()).toBeGreaterThan(0);
    });

    it('should only return calendars that are active', function () {
      var calendars = user.calendars().fetch();
      calendars.forEach(function (calendar) {
        expect(calendar.active).toBeTruthy();
      });
    });

  });

  describe('calendarIdObjects', function () {

    beforeEach(function () {
      var calendars = [
        { id: 1, googleCalendarId: 'gcalId' }
      ];
      calendars.forEach(function (calendar) { Calendars.insert(calendar); });
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
        { id: 3, ownerId: userId, tags: ['tag1', 'tag2'] }
      ];
      tasks.forEach(function (task) { Tasks.insert(task); });
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
        { id: 3, ownerId: userId, isDone: false, tags: ['tag2', 'tag3'] }
      ];
      tasks.forEach(function (task) { Tasks.insert(task); });
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

    beforeEach(function () {
      var userId = user._id;
      var tasks = [
        { id: 1, ownerId: userId, dueAt: 1 },
        { id: 2, ownerId: userId, dueAt: 2 }
      ];
      tasks.forEach(function (task) { Tasks.insert(task); });
    });

    it('should return the value of dueAt for the latest due task', function () {
      var latestTodoTime = user.latestTodoTime();
      expect(latestTodoTime).toEqual(2);
    });

  });

  describe('todoList', function () {

    it('should', function () {
      pending();
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
