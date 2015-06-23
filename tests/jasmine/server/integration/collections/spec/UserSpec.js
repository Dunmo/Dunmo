
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
        { id: 1, ownerId: userId,   isRemoved: false },
        { id: 2, ownerId: userId,   isRemoved: true  },
        { id: 3, ownerId: 'someId', isRemoved: false }
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

    it('should only return tasks for which isRemoved is false', function () {
      var tasks = user.tasks();
      tasks     = tasks.fetch();

      tasks.forEach(function (task) {
        expect(task.isRemoved).toBeFalsy();
      });
    });

  });

  describe('todos', function () {

    beforeEach(function () {
      var userId = user._id;
      var tasks  = [
        { id: 1, ownerId: userId,   isDone: true,  isRemoved: false },
        { id: 2, ownerId: userId,   isDone: false, isRemoved: true  },
        { id: 3, ownerId: userId,   isDone: false, isRemoved: false },
        { id: 4, ownerId: 'someId', isDone: false, isRemoved: false }
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

    it('should only return tasks for which isRemoved is false', function () {
      var tasks = user.todos();
      tasks     = tasks.fetch();

      tasks.forEach(function (task) {
        expect(task.isRemoved).toBeFalsy();
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
      tasks       = tasks.fetch();

      tasks.forEach(function (task) {
        expect(task.id).toEqual(1);
      });
    });

    it('should only return tasks for which needsReviewed is true', function () {
      var tasks   = user.recentTodos();
      tasks       = tasks.fetch();

      tasks.forEach(function (task) {
        expect(task.needsReviewed).toBeTruthy();
      });
    });

  });

  describe('freetimes', function () {

    it('should', function () {
      pending();
    });

  });

  describe('calendars', function () {

    it('should', function () {
      pending();
    });

  });

  describe('activeCalendars', function () {

    it('should', function () {
      pending();
    });

  });

  describe('calendarIdObjects', function () {

    it('should', function () {
      pending();
    });

  });

  describe('latestTodoTime', function () {

    it('should', function () {
      pending();
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
