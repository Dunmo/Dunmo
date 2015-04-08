/*
 * Task
 * =========
 * ownerId         : String
 * appleReminderId : String
 * calendarId      : String
 * title           : String
 * importance      : <1,2,3>
 * dueAt           : Number<milliseconds>
 * remaining       : Number<milliseconds>
 * spent           : Number<milliseconds>
 * snoozedUntil    : DateTime
 * description     : String
 *
 * TODO: hash apple passwords
 */

Tasks = new Mongo.Collection('tasks');

Tasks.before.insert(function(uid, doc) {
  return doc;
});

Tasks.helpers({
  update: function (data) {
    if( _.keys(data).every(function(k) { return k.charAt(0) !== '$'; }) )
      data = { $set: data };

    return Tasks.update(this._id, data);
  },

  reParse: function (str) {
    var res = Natural.parseTask(str);
    res.inputString = str;
    this.update(res);
  },

  markDone: function () {
    this.update({ isDone: true });
  },

  remove: function () {
    this.update({ isRemoved: true });
  },

  split: function(milliseconds) {
    if(milliseconds > this.remaining) {
      return [ null, R.cloneDeep(this) ];
    }

    var firstTask = R.cloneDeep(this);
    firstTask.remaining = milliseconds;

    var secondTask = R.cloneDeep(this);
    var remaining  = this.remaining - milliseconds;
    secondTask.remaining =  remaining;

    // TODO: set timeSpent also

    return [ firstTask, secondTask ];
  }
});

// input: obj OR str, obj
// if `str` is given, attrs will be parsed
// otherwise, all attrs must be present in `obj`
Tasks.create = function(str, obj) {
  if(typeof(str) === 'object') {
    obj = str;
    str = '';
  }

  var res = Natural.parseTask(str);

  obj.ownerId         = obj.ownerId         || null; // Meteor.userId();
  obj.appleReminderId = obj.appleReminderId || null;
  obj.calendarId      = obj.calendarId      || null;
  obj.inputString     = obj.inputString     || str;
  obj.title           = obj.title           || res.title;
  obj.importance      = obj.importance      || res.importance;
  obj.dueAt           = obj.dueAt           || res.dueAt;
  obj.remaining       = obj.remaining       || res.remaining
  obj.spent           = obj.spent           || 0;
  obj.snoozedUntil    = obj.snoozedUntil    || null;
  obj.description     = obj.description     || '';
  obj.isDone          = obj.isDone          || false;
  obj.isRemoved       = obj.isRemoved       || false;
  obj.lastUpdatedAt   = obj.lastUpdatedAt   || Date.now();

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

Tasks.basicSort = function(tasks) {
  tasks = _.sortBy(tasks, 'remaining');
  tasks = _.sortBy(tasks, 'importance').reverse();
  tasks = _.sortBy(tasks, 'dueAt');
  return tasks;
};

