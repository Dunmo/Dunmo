/*
 * Task
 * ==========
 * ownerId            : String
 * title              : String
 * importance         : <1,2,3>
 * dueAt              : DateTime
 * remaining          : Number<milliseconds>
 * spent              : Number<milliseconds>
 * snoozedUntil       : DateTime
 * needsReviewed      : Boolean
 * isDone             : Boolean
 * isRemoved          : Boolean
 * timeLastMarkedDone : DateTime
 * description        : String
 *
 */

Tasks.helpers({

  reParse: function (str) {
    var res = Natural.parseTask(str);
    res.inputString = str;
    return this.update(res);
  },

  setIsDone: function (bool) {
    if(bool === undefined || bool === null) bool = true;
    if(bool === this.isDone) return 1;
    var selector = { isDone: bool };
    if(bool) selector.timeLastMarkedDone = Date.now();
    return this.update(selector);
  },

  setNeedsReviewed: Setters.setBool('needsReviewed'),

  setWillBeOverdue: Setters.setBool('willBeOverdue'),

  setSnoozedUntil: Setters.setProp('snoozedUntil'),

  markDone: function (bool) {
    return this.setIsDone(bool);
  },

  split: function (milliseconds) {
    milliseconds = _.bound(milliseconds, 0, this.remaining);

    var firstTask = R.cloneDeep(this);
    firstTask.remaining = milliseconds;

    var secondTask = R.cloneDeep(this);
    var remaining  = this.remaining - milliseconds;
    secondTask.remaining =  remaining;

    // TODO: set timeSpent also

    return [ firstTask, secondTask ];
  }

});

Tasks.basicSort = function (tasks) {
  tasks = _.sortBy(tasks, 'remaining').reverse();
  tasks = _.sortBy(tasks, 'importance').reverse();
  tasks = _.sortBy(tasks, 'dueAt');
  return tasks;
};

// input: obj OR str, obj
// if `str` is given, attrs will be parsed
// otherwise, all attrs must be present in `obj`
Tasks.create = function (str, obj) {
  if(typeof(str) === 'object') {
    obj = str;
    str = '';
  }
  if(!obj) obj = {};

  var res = Natural.parseTask(str);

  obj.ownerId         = obj.ownerId         || null; // Meteor.userId();
  obj.inputString     = obj.inputString     || str;
  obj.title           = obj.title           || res.title;
  obj.importance      = obj.importance      || res.importance;
  obj.dueAt           = obj.dueAt           || res.dueAt;
  obj.remaining       = obj.remaining       || res.remaining
  obj.spent           = obj.spent           || 0;
  obj.snoozedUntil    = obj.snoozedUntil    || 0;
  obj.description     = obj.description     || '';
  obj.isDone          = obj.isDone          || false;
  obj.isRemoved       = obj.isRemoved       || false;
  obj.lastUpdatedAt   = obj.lastUpdatedAt   || Date.now();

  var granularity = Meteor.users.findOne(obj.ownerId).taskGranularity();
  obj.remaining   = Date.nearest(obj.remaining, granularity);
  if(obj.remaining == 0) obj.remaining = granularity;

  if (!obj.title) {
    return { err: 'Title not found.' };
  } else if (!obj.importance) {
    return { err: 'Importance not found.' };
  } else if (!obj.dueAt) {
    return { err: 'Due date not found.' };
  } else if (!obj.remaining) {
    return { err: 'Duration not found.' };
  };

  return Tasks.insert(obj);
};

Tasks.fetch = function (selector, options) {
  selector           = selector || {};
  selector.isDone    = { $ne: true };
  selector.isRemoved = { $ne: true };
  var tasks          = Tasks.find(selector, options);
  return tasks.fetch();
};

Tasks.fetchSnoozed = function (selector, options) {
  selector = selector || {};
  selector.snoozedUntil = { $ne: 0 };
  return Tasks.fetch(selector, options);
};

Tasks.setNeedsReviewed = function () {
  var start      = Number(Date.startOfYesterday());
  var end        = Number(Date.endOfYesterday());
  var options   = { start: start, end: end };
  Events.fetchTaskEvents(options, function (events) {
    var tasks = Events.getTasks(events);
    if(tasks) {
      return tasks.map(function (task) {
        return task.setNeedsReviewed();
      });
    }
  });
};

