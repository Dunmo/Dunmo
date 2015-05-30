
describe('task', function () {

  var _task;

  beforeEach(function () {
    var taskId = Tasks.create('test task for 2 hours due next friday important');
    _task      = Tasks.findOne(taskId);
  });

  describe('reParse', function () {
    var expected, updatedTask;

    beforeEach(function () {
      var inputString = 'new task for 1 hour due next friday not important';
      expected        = Natural.parseTask(inputString);
      _task.reParse(inputString);
      updatedTask     = Tasks.findOne(_task._id);
    });

    it('should set title', function () {
      expect(_task.title).toEqual(expected.title);
      expect(updatedTask.title).toEqual(expected.title);
    });

    it('should set remaining', function () {
      expect(_task.remaining).toEqual(expected.remaining);
      expect(updatedTask.remaining).toEqual(expected.remaining);
    });

    it('should set dueAt', function () {
      expect(_task.dueAt).toEqual(expected.dueAt);
      expect(updatedTask.dueAt).toEqual(expected.dueAt);
    });

    it('should set importance', function () {
      expect(_task.importance).toEqual(expected.importance);
      expect(updatedTask.importance).toEqual(expected.importance);
    });

  });

  describe('setDone', function () {

    it('should default to setting .isDone = true', function () {
      _task.setDone();

      var expectedDefault = true;
      expect(_task.isDone).toEqual(expectedDefault);

      var updatedTask = Tasks.findOne(_task._id);
      expect(updatedTask.isDone).toEqual(expectedDefault);
    });

    it('should set .isDone to the given value', function () {
      var updatedTask, expectedDefault;

      expectedDefault = true;
      _task.setDone(expectedDefault);
      expect(_task.isDone).toEqual(expectedDefault);

      updatedTask = Tasks.findOne(_task._id);
      expect(updatedTask.isDone).toEqual(expectedDefault);

      expectedDefault = false;
      _task.setDone(expectedDefault);
      expect(_task.isDone).toEqual(expectedDefault);

      updatedTask = Tasks.findOne(_task._id);
      expect(updatedTask.isDone).toEqual(expectedDefault);
    });

  });

  describe('split', function () {

    it('should not alter the original task object', function () {
      var splitTime = 1*HOURS;
      var originalTimeRemaining = _task.remaining;
      _task.split(splitTime);
      expect(_task.remaining).toEqual(originalTimeRemaining);
    });

    it('should split on .remaining when given a number greater than .remaining', function () {
      var splitTime     = 3*HOURS;
      var timeRemaining = 0;
      var ret = _task.split(splitTime);
      var t1  = ret[0];
      var t2  = ret[1];
      var t1Remaining = t1.remaining;
      var t2Remaining = t2.remaining;
      var taskRemaining = _task.remaining;
      expect(t1Remaining).toEqual(taskRemaining);
      expect(t2Remaining).toEqual(timeRemaining);
    });

    it('should be able to split the _task on any time between zero and .remaining', function () {
      var splitTime     = 1*HOURS + 30*MINUTES;
      var timeRemaining = _task.remaining - splitTime;
      var ret = _task.split(splitTime);
      var t1  = ret[0];
      var t2  = ret[1];
      var t1Remaining = t1.remaining;
      var t2Remaining = t2.remaining;
      expect(t1Remaining).toEqual(splitTime);
      expect(t2Remaining).toEqual(timeRemaining);
    });

    it('should split the task on zero', function () {
      var splitTime     = 0;
      var timeRemaining = _task.remaining - splitTime;
      var ret = _task.split(splitTime);
      var t1  = ret[0];
      var t2  = ret[1];
      var t1Remaining = t1.remaining;
      var t2Remaining = t2.remaining;
      expect(t1Remaining).toEqual(splitTime);
      expect(t2Remaining).toEqual(timeRemaining);
    });

    it('should split on zero when given a negative number', function () {
      var splitTime     = -30*MINUTES;
      var timeRemaining = _task.remaining;
      var ret = _task.split(splitTime);
      var t1  = ret[0];
      var t2  = ret[1];
      var t1Remaining = t1.remaining;
      var t2Remaining = t2.remaining;
      expect(t1Remaining).toEqual(0);
      expect(t2Remaining).toEqual(timeRemaining);
    });

  });

});

describe('tasks', function () {

  describe('basicSort', function () {

    it('sorts by dueAt', function () {
      // TODO
      pending();
    });

    it('sorts by importance', function () {
      // TODO
      pending();
    });

    it('sorts by duration', function () {
      // TODO
      pending();
    });

    it('sorts by dueAt, importance, and duration, in that order', function () {
      // TODO
      pending();
    });

  });

  describe('create', function () {

    it('', function () {
      pending();
    });

  });

});
