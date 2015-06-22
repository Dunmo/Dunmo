
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

  });

  describe('settings', function () {

    it('should', function () {
      pending();
    });

  });

  describe('endOfDay', function () {

    it('should', function () {
      pending();
    });

  });

  describe('startOfDay', function () {

    it('should', function () {
      pending();
    });

  });

  describe('referred', function () {

    it('should', function () {
      pending();
    });

  });

  describe('addReferral', function () {

    it('should', function () {
      pending();
    });

  });

  describe('referrals', function () {

    it('should', function () {
      pending();
    });

  });

  describe('removeReferral', function () {

    it('should', function () {
      pending();
    });

  });

  describe('taskCalendarId', function () {

    it('should', function () {
      pending();
    });

  });

  describe('tasks', function () {

    var user;

    var pickId = function (task) { return task.id; };

    beforeEach(function () {
      user      = TestHelpers.fakeUser();
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

    var user;

    beforeEach(function () {
      user      = TestHelpers.fakeUser();
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

    var user;

    beforeEach(function () {
      user      = TestHelpers.fakeUser();
      var userId = user._id;
      var tasks  = [
        { id: 1, ownerId: userId },
        { id: 2, ownerId: userId }
      ];
      tasks.forEach(function (task) { Tasks.insert(task); });
      var recentTask = Tasks.findOne();

      // Events.insert({
      //   taskId:
      // });
    });

    it('should only return tasks owned by this user', function () {
      var tasks   = user.todos();
      tasks       = tasks.fetch();

      tasks.forEach(function (task) {
        expect(task.ownerId).toEqual(user._id);
      });
    });

    it('should only return tasks for which isRemoved is false', function () {
      var tasks   = user.todos();
      tasks       = tasks.fetch();

      tasks.forEach(function (task) {
        expect(task.isRemoved).toBeFalsy();
      });
    });

    it('should only return tasks for which isDone is false', function () {
      var tasks   = user.todos();
      tasks       = tasks.fetch();

      tasks.forEach(function (task) {
        expect(task.isDone).toBeFalsy();
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
