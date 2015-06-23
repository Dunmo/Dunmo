/*
 * Task
 * ==========
 * ownerId            : String
 * projectId          : String
 * title              : String
 * importance         : <1,2,3>
 * dueAt              : DateTime
 * remaining          : Number<milliseconds>
 * spent              : Number<milliseconds>
 * snoozedUntil       : DateTime
 * needsReviewed      : Boolean
 * willBeOverdue      : Boolean
 * isDone             : Boolean
 * isOnboardingTask   : Boolean
 * timeLastMarkedDone : DateTime
 * description        : String
 * dependencyIds      : String[]
 * tags               : String[]
 * assigneeIds        : String[]
 * recurrenceRule     : RRule
 *
 */

var props = [
  'projectId',
  'title',
  'importance',
  'dueAt',
  'remaining',
  'spent',
  'snoozedUntil',
  'timeLastMarkedDone',
  'description',
  'recurrenceRule'
];

var boolProps = [
  'needsReviewed',
  'willBeOverdue',
  'isDone',
  'isOnboardingTask'
];

var setters = {};

props.forEach(function (prop) {
  var setterName      = 'set' + prop.capitalize();
  setters[setterName] = Setters.setProp(prop);
});

boolProps.forEach(function (prop) {
  var setterName      = 'set' + prop.capitalize();
  setters[setterName] = Setters.setBool(prop);
});

Tasks.helpers(setters);

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

  addDependency: function (dependencyIds) {
    return this.update({ $addToSet: { dependencyIds: dependencyIds } });
  },

  removeDependency: function (dependencyIds) {
    return this.update({ $pullAll: { dependencyIds: dependencyIds } });
  },

  removeAllDependencies: function () {
    return this.update({ dependencyIds: [] });
  },

  dependsOn: function (task) {
    var taskId;
    if(typeof task === 'string') taskId = task;
    else                         taskId = task._id;
    return _.include(this.dependencyIds, taskId);
  },

  dependencies: function () {
    return Tasks.find({ _id: { $in: this.dependencyIds } });
  },

  fetchDependencies: function () {
    return this.dependencies().fetch();
  },

  markDone: function (bool) {
    return this.setIsDone(bool);
  },

  split: function (milliseconds) {
    milliseconds = _.bound(milliseconds, 0, this.remaining);

    var firstTask = _.cloneDeep(this);
    firstTask.remaining = milliseconds;

    var secondTask = _.cloneDeep(this);
    var remaining  = this.remaining - milliseconds;
    secondTask.remaining =  remaining;

    // TODO: set timeSpent also

    return [ firstTask, secondTask ];
  },

  isInProgress: function () {
    return this.spent > 0;
  },

  isSnoozed: function () {
    return this.snoozedUntil > Date.now();
  },

  isTodo: function () {
    return !this.isDone;
  },

  addTag: function (tag) {
    if(tag.charAt(0) === '#') tag = tag.slice(1);
    if(tag.length === 0) return 0;
    return this.update({ $addToSet: { tags: tag } });
  },

  removeTag: function (tag) {
    if(tag.charAt(0) === '#') tag = tag.slice(1);
    if(tag.length === 0) return 0;
    return this.update({ $pullAll: { tags: tag } });
  },

  assignees: function () {
    return Users.find({ _id: { $in: this.assigneeIds } });
  },

  fetchAssignees: function () {
    return this.assignees().fetch();
  },

  addAssignee: function (user) {
    var userId;
    if(typeof user === 'string') userId = user;
    else                         userId = user._id;
    return this.update({ $addToSet: { assigneeIds: userId } });
  },

  removeAssignee: function (user) {
    var userId;
    if(typeof user === 'string') userId = user;
    else                         userId = user._id;
    return this.update({ $pullAll: { assigneeIds: userId } });
  },

  isUnassigned: function () {
    return this.assignees.length === 0;
  },

  project: function () {
    return Projects.findOne(this.projectId);
  },

  hasProject: function () {
    return !!this.projectId;
  }

  // dueAtString
  // needs to handle relative dates

});

Tasks.advancedSort = function (tasks) {
  tasks = Tasks.basicSort(tasks);
  tasks = Tasks.topologicalSort(tasks);
  return tasks;
};

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
  if(Array.isArray(str)) {
    return str.map(function(taskStr) {
      return Tasks.create(taskStr, obj);
    });
  } else if(typeof(str) === 'object') {
    obj = str;
    str = '';
  }
  if(!obj) obj = {};
  obj = _.cloneDeep(obj);

  var res = Natural.parseTask(str);

  obj.ownerId          = obj.ownerId          || null; // Meteor.userId();
  obj.inputString      = obj.inputString      || str;
  obj.title            = obj.title            || res.title;
  obj.importance       = obj.importance       || res.importance;
  obj.dueAt            = obj.dueAt            || res.dueAt;
  obj.remaining        = obj.remaining        || res.remaining
  obj.spent            = obj.spent            || 0;
  obj.snoozedUntil     = obj.snoozedUntil     || 0;
  obj.dependencies     = obj.dependencies     || [];
  obj.isDone           = obj.isDone           || false;
  obj.isRemoved        = obj.isRemoved        || false;
  obj.isOnboardingTask = obj.isOnboardingTask || false;
  obj.lastUpdatedAt    = obj.lastUpdatedAt    || Date.now();

  var granularity = Users.findOne(obj.ownerId).taskGranularity();
  obj.remaining   = Date.nearest(obj.remaining, granularity);
  if(obj.remaining == 0) obj.remaining = granularity;

  if (!obj.title) {
    return { err: 'Title not found.' };
  } else if (typeof obj.importance !== 'number') {
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
  var tasks          = Tasks.find(selector, options);
  return tasks.fetch();
};

Tasks.fetchSnoozed = function (selector, options) {
  selector = selector || {};
  selector.snoozedUntil = { $ne: 0 };
  return Tasks.fetch(selector, options);
};

Tasks.getDependencyEdges = function (tasks) {
  var taskIds = _.pluck(tasks, '_id');
  var edges = tasks.map(function (task) {
    if(!task.dependencies) return [];
    return task.dependencies.map(function (depId) {
      if( ! taskIds.any(function (id) { return id === depId; }) ) return [];
      else return [task._id, depId];
    });
  });
  edges = _.flatten(edges);
  return edges;
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

Tasks.topologicalSort = function (tasks) {
  tasks = tasks.reverse();
  var nodes = _.pluck(tasks, '_id');
  var edges = Tasks.getDependencyEdges(tasks);
  var taskIds = Toposort.sortArray(nodes, edges);
  tasks = taskIds.map(function (taskId) {
    return _.find(tasks, { '_id': taskId });
  });
  return tasks.reverse();
};
