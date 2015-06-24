
/*
 * User
 * =========
 * appleCredentialsId          : String
 * emails                      : [{ address : String, verified : Boolean }]
 * profile.name                : String
 * services.google.id          : String
 * services.google.accessToken : String
 *
 * Meteor.logoutOtherClients
 *
 */

var settingsPropsAndDefaults = [
  ['startOfDay', Date.parseTime('08:00')],
  ['endOfDay', Date.parseTime('22:00')],
  ['taskCalendarId', null],
  ['referrals', []],
  ['isReferred', false],
  ['lastReviewed', 0],
  ['maxTaskInterval', 2*HOURS],
  ['maxTimePerTaskPerDay', 6*HOURS],
  ['taskBreakInterval', 30*MINUTES],
  ['taskGranularity', 5*MINUTES],
  ['onboardingIndex', 0],
  ['lastDayOfWeek', 'monday']
];

var settingsGetters = {};
settingsPropsAndDefaults.forEach(function (pair) {
  var prop       = pair[0];
  var defaultVal = pair[1];
  settingsGetters[prop] = function () {
    var settings = this.settings();
    if(!settings[prop]) return defaultVal;
    else                return settings[prop];
  };
});

Users.helpers(settingsGetters);

var settingsSettersAndFilters = [
  ['lastReviewed', function (time) { return Number(new Date(time)); }],
  ['endOfDay', function (str, settings) {
    if(!str || str === '') str = '22:00';
    var time = Date.parseTime(str);
    if(time < settings.startOfDay) {
      Session.set('errorMessage', 'You can\'t end before you start!');
      $('.message').show();
      return { err: true };
    }
    return time;
  }],
  ['startOfDay', function (str, settings) {
    if(!str || str === '') str = '08:00';
    var time = Date.parseTime(str);
    if(time > settings.endOfDay) {
      Session.set('errorMessage', 'You can\'t start after you end!');
      $('.message').show();
      return { err: true };
    }
  }],
  ['onboardingIndex', function (index) { return _.bound(index, 0, Infinity); }],
  ['maxTaskInterval', function (time) {
    if(!time) time = 24*HOURS;
    return _.bound(time, 0, 24*HOURS);
  }],
  ['maxTimePerTaskPerDay', function (time) {
    if(!time) time = 24*HOURS;
    return _.bound(time, 0, 24*HOURS);
  }],
  ['taskBreakInterval', function (time) {
    if(!time) time = 0;
    return _.bound(time, 0, 24*HOURS);
  }],
  ['taskGranularity', function (time) {
    if(!time) time = 0;
    return _.bound(time, 0, 24*HOURS);
  }],
  ['lastDayOfWeek', function (number) {
    return _.bound(number, 0, 6);
  }],
  ['workWeek', function (numbers) {
    numbers = numbers.map(_.bound(0, 6));
    return _.uniq(numbers);
  }],
  ['isReferred', function (bool) { return bool; }]
];

var settingsSetters = {};
settingsSettersAndFilters.forEach(function (pair) {
  var prop       = pair[0];
  var filter     = pair[1];
  var setterName = 'set' + prop.capitalize();
  settingsSetters[setterName] = function (value) {
    var settings = this.settings();
    value = filter(value, settings);
    if(value && value.err) return false;
    var obj = {};
    obj[prop] = value;
    return settings.update(obj);
  };
});

Users.helpers(settingsSetters);

Users.helpers({

  primaryEmailAddress: function () {
    return this.services && this.services.google && this.services.google.email;
  },

  createSettings: function () {
    var settingsId = UserSettings.create({ userId: this._id });
    return UserSettings.findOne(settingsId);
  },

  settings: function () {
    var settings = UserSettings.findOne({ userId: this._id });
    if(!settings) settings = this.createSettings();
    return settings;
  },

  hasOnboarded: function (key) {
    var settings = this.settings();
    if(!settings.hasOnboarded) settings.hasOnboarded = {};
    if(key === null || key === undefined) return settings.hasOnboarded;
    else                                  return settings.hasOnboarded[key];
  },

  setHasOnboarded: function (key, bool) {
    var settings = this.settings();
    if(bool === undefined || bool === null) bool = true;
    key = 'hasOnboarded.' + key;
    var selector = {};
    selector[key] = bool;
    return settings.update(selector);
  },

  addReferral: function (str) {
    var settings = this.settings();
    if(str) return settings.update({ $addToSet: { referrals: str } });
  },

  removeReferral: function (str) {
    var settings = this.settings();
    if(str) return settings.update({ $pull: { referrals: str } });
    else    return null;
  },

  // TODO: create custom selectors, i.e. selectors.todo = { isDone: { $ne: true } }
  tasks: function (selector, options) {
    selector = _.extend({}, { ownerId: this._id }, selector);
    return Tasks.find(selector, options);
  },

  fetchTasks: function (selector, options) {
    return this.tasks(selector, options).fetch();
  },

  sortedTasks: function (selector, options) {
    return Tasks.advancedSort(this.fetchTasks(selector, options));
  },

  todos: function (selector, options) {
    selector = _.extend({}, { isDone: { $ne: true } }, selector);
    return this.tasks(selector, options);
  },

  fetchTodos: function (selector, options) {
    return this.todos(selector, options).fetch();
  },

  sortedTodos: function (selector, options) {
    return Tasks.advancedSort(this.fetchTodos(selector, options));
  },

  fetchUnsnoozedTodos: function (selector, options) {
    selector = _.extend({}, { snoozedUntil: { $lt: Date.now() } }, selector);
    return this.sortedTodos(selector, options);
  },

  recentTodos: function (selector, options) {
    selector = _.extend({}, { needsReviewed: true }, selector);
    return this.fetchUnsnoozedTodos(selector, options);
  },

  upcomingTodos: function (selector, options) {
    selector = _.extend({}, { needsReviewed: { $ne: true } }, selector);
    return this.fetchUnsnoozedTodos(selector, options);
  },

  onboardingTasks: function (selector, options) {
    selector = _.extend({}, { isOnboardingTask: true }, selector);
    return this.fetchUnsnoozedTodos(selector, options);
  },

  // TODO: implement Freetimes.find
  // freetimes: function () {
  //   return Freetimes.find({ ownerId: this._id });
  // },

  calendars: function (selector, options) {
    selector = _.extend({}, { ownerId: this._id }, selector);
    return Calendars.find(selector, options);
  },

  fetchCalendars: function (selector, options) {
    return this.calendars(selector, options).fetch();
  },

  activeCalendars: function () {
    return this.calendars({ active: true });
  },

  fetchActiveCalendars: function () {
    return this.activeCalendars().fetch();
  },

  calendarIdObjects: function () {
    var calendars = this.fetchActiveCalendars();
    var idObjects = calendars.map(function(calendar) {
      return { id: calendar.googleCalendarId };
    });
    return idObjects;
  },

  tags: function (selector, options) {
    var tasks = this.fetchTasks(selector, options);
    return Tags.fromTasks(tasks);
  },

  activeTags: function (selector, options) {
    var tasks = this.fetchTodos(selector, options);
    return Tags.fromTasks(tasks);
  },

  _latestTodo: function () {
    return _.max(this.fetchTodos(), 'dueAt');
  },

  latestTodoTime: function () {
    return this._latestTodo().dueAt;
  },

  todoList: function (freetimes) {
    var todos, todoList;
    todos     = this.sortedTodos();
    freetimes = freetimes || this.freetimes();
    todoList  = Scheduler.generateTodoList(freetimes, todos, {
      algorithm:            'greedy',
      maxTaskInterval:      this.maxTaskInterval(),
      maxTimePerTaskPerDay: this.maxTimePerTaskPerDay(),
      taskBreakInterval:    this.taskBreakInterval()
    });
    return todoList;
  },

  events: function (selector, options) {
    selector = _.extend({}, { ownerId: this._id }, selector);
    return Events.find(selector, options);
  },

  calendarEvents: function (selector, options) {
    selector = _.extend({}, { taskId: { $ne: true } }, selector);
    return this.events(selector, options);
  },

  taskEvents: function (selector, options) {
    selector = _.extend({}, { taskId: { $exists: true } }, selector);
    return this.events(selector, options);
  },

  fetchTaskEvents: function (selector, options) {
    return this.taskEvents(selector, options).fetch();
  },

  fetchTaskEventsInRange: function (start, end) {
    start = Number(new Date(start));
    end   = Number(new Date(end));
    var selector = { $or: [ {start: { $lt: end }}, {end: { $gt: start }} ] };
    return this.fetchTaskEvents(selector);
  },

  taskTimeSpentInRange: function (start, end) {
    start = Number(new Date(start));
    end   = Number(new Date(end));

    var taskEvents = this.fetchTaskEventsInRange(start, end);

    var durations = taskEvents.map(function (taskEvent) {
      return taskEvent.durationWithinRange(start, end);
    });

    var timeSpent = _.sum(durations);

    return timeSpent;
  },

  lengthOfWorkday: function () {
    return this.endOfDay() - this.startOfDay();
  },

  workTimeInRange: function (start, end) {
    start = Number(new Date(start));
    end   = Number(new Date(end));

    var beginningSegment = 0;
    var endSegment       = 0;
    var startTime = Date.timeOfDay(start);
    var endTime   = Date.timeOfDay(end);
    var lengthOfWorkday = this.lengthOfWorkday();

    if(startTime > this.startOfDay() &&
    startTime < this.endOfDay()) {
      beginningSegment = this.endOfDay() - startTime;
    }
    else if(startTime < this.startOfDay()) {
      beginningSegment = lengthOfWorkday;
    }

    if(endTime > this.startOfDay() &&
    endTime < this.endOfDay()) {
      endSegment = endTime - this.startOfDay();
    }
    else if(endTime > this.endOfDay()) {
      endSegment = lengthOfWorkday;
    }

    var numDays = Date.numberOfDaysInRangeInclusive(Date.endOfDay(start), Date.startOfDay(end));

    var workTime = beginningSegment + numDays*lengthOfWorkday + endSegment;

    return workTime;
  },

  productiveTimeSpentInRange: function (start, end) {
    return this.taskTimeSpentInRange(start, end);
  },

  productivityPercentage: function (start, end) {
    start = Number(new Date(start));
    end   = Number(new Date(end));

    var productiveTime = this.productiveTimeSpentInRange(start, end);
    var totalTime = this.workTimeInRange(start, end);

    var percentage = productiveTime / totalTime;

    return percentage;
  }

});

Users.findByEmail = function (email) {
  return Users.findBy({ email: email });
};

// Requires email & password, could be an array of new users
Users.create = function (obj) {
  if(Array.isArray(obj)) {
    var ary = obj;
    ary.forEach(function(user) {
      Users.create(user);
    });
  } else if(typeof(obj) === 'object') {
    var user = Users.findByEmail(obj.email);
    // if(!user) return Users.insert(user);
  } else {
    console.error('type error, Users.create does not expect: ', typeof(obj));
  }
};
