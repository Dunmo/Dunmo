/*
 * Task
 * =========
 * ownerId         : String
 * appleReminderId : String
 * calendarId      : String
 * title           : String
 * importance      : <1,2,3>
 * dueAt           : String
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

    Tasks.update(this._id, data);
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
    // firstTask.id = this._id;
    // firstTask._id = new Mongo.ObjectID();

    var secondTask = R.cloneDeep(this);
    var remaining  = this.remaining - milliseconds;
    secondTask.remaining =  remaining;
    // secondTask.id = this._id;
    // secondTask._id = new Mongo.ObjectID();

    // TODO: set timeSpent also

    return [ firstTask, secondTask ];
  }
});

// input: obj OR str, obj
// if `str` is given, attrs will be parsed
// otherwise, all attrs must be present in `obj`
Tasks.create = function(str, obj) {
  if(typeof(str) === 'object') obj = str;
  else                         obj.title = obj.title || str;

  console.log('str: ', str);

  obj.ownerId         = obj.ownerId;         //|| Meteor.userId();
  obj.appleReminderId = obj.appleReminderId || null;
  obj.calendarId      = obj.calendarId      || null;
  obj.title           = obj.title           || "";
  obj.importance      = obj.importance      || Natural.parseImportance(str);
  obj.dueAt           = obj.dueAt           || Natural.parseDueAt(str);
  obj.remaining       = obj.remaining       || Natural.parseDuration(str).asMilliseconds();
  obj.spent           = obj.spent           || 0;
  obj.snoozedUntil    = obj.snoozedUntil    || null;
  obj.description     = obj.description     || "";
  obj.isDone          = obj.isDone          || false;
  obj.isRemoved       = obj.isRemoved       || false;

  return Tasks.insert(obj);
};

Tasks.basicSort = function(tasks) {
  tasks = _.sortBy(tasks, 'remaining');
  tasks = _.sortBy(tasks, 'importance');
  tasks = _.sortBy(tasks, 'dueAt');
  return tasks;
};
