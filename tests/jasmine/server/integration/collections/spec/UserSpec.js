
describe('user', function () {

  var _user, _userEmail;

  beforeEach(function () {
    // var taskId = Meteor.users.create();
    // _user      = Meteor.users.findOne(taskId);
    // _userEmail = 'test.dunmo@gmail.com';
    // _user = {
    //   services: {
    //     google: {
    //       email: _userEmail
    //     }
    //   }
    // };
  });

  describe('primaryEmailAddress', function () {

    it('should return the gmail address', function () {
      // var email = _user.primaryEmailAddress();
      // expect(email).toEqual(_userEmail);
      pending();
    });

    it('should return null when there is no gmail address', function () {
      // TODO
      pending();
    });

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

    var _user;

    var pickId = function (task) { return task.id; };

    beforeEach(function () {
      _user      = TestHelpers.fakeUser();
      var userId = _user._id;
      var tasks  = [
        { id: 1, ownerId: userId,   isRemoved: false },
        { id: 2, ownerId: userId,   isRemoved: true  },
        { id: 3, ownerId: 'someId', isRemoved: false }
      ];
      tasks.forEach(function (task) { Tasks.insert(task); });
    });

    it('should only return tasks owned by this user', function () {
      var tasks = _user.tasks();
      tasks     = tasks.fetch();

      tasks.forEach(function (task) {
        expect(task.ownerId).toEqual(_user._id);
      });
    });

    it('should only return tasks for which isRemoved is false', function () {
      var tasks = _user.tasks();
      tasks     = tasks.fetch();

      tasks.forEach(function (task) {
        expect(task.isRemoved).toBeFalsy();
      });
    });

  });

  describe('todos', function () {

    var _user;

    beforeEach(function () {
      _user      = TestHelpers.fakeUser();
      var userId = _user._id;
      var tasks  = [
        { id: 1, ownerId: userId,   isDone: true,  isRemoved: false },
        { id: 2, ownerId: userId,   isDone: false, isRemoved: true  },
        { id: 3, ownerId: userId,   isDone: false, isRemoved: false },
        { id: 4, ownerId: 'someId', isDone: false, isRemoved: false }
      ];
      tasks.forEach(function (task) { Tasks.insert(task); });
    });

    it('should only return tasks owned by this user', function () {
      var tasks = _user.todos();
      tasks     = tasks.fetch();

      tasks.forEach(function (task) {
        expect(task.ownerId).toEqual(_user._id);
      });
    });

    it('should only return tasks for which isRemoved is false', function () {
      var tasks = _user.todos();
      tasks     = tasks.fetch();

      tasks.forEach(function (task) {
        expect(task.isRemoved).toBeFalsy();
      });
    });

    it('should only return tasks for which isDone is false', function () {
      var tasks = _user.todos();
      tasks     = tasks.fetch();

      tasks.forEach(function (task) {
        expect(task.isDone).toBeFalsy();
      });
    });

  });

  describe('recentTodos', function () {

    var _user;

    beforeEach(function () {
      _user      = TestHelpers.fakeUser();
      var userId = _user._id;
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
      var tasks   = _user.todos();
      tasks       = tasks.fetch();

      tasks.forEach(function (task) {
        expect(task.ownerId).toEqual(_user._id);
      });
    });

    it('should only return tasks for which isRemoved is false', function () {
      var tasks   = _user.todos();
      tasks       = tasks.fetch();

      tasks.forEach(function (task) {
        expect(task.isRemoved).toBeFalsy();
      });
    });

    it('should only return tasks for which isDone is false', function () {
      var tasks   = _user.todos();
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

describe('Meteor.users', function () {

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
