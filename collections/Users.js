
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

Meteor.users.helpers(settingsGetters);

Meteor.users.helpers({

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

  setRemoved: function (bool) {
    this.settings().setRemoved(bool);
    return this.update({ isRemoved: bool });
  },

  setEndOfDay: function (str) {
    var defaultEndOfDay = '22:00';
    var settings = this.settings();
    if(!str || str === '') str = defaultEndOfDay;
    var time = Date.parseTime(str);
    if(time < settings.startOfDay) {
      Session.set('errorMessage', "You can't end before you start!");
      $('.message').show();
      return false;
    }
    return settings.update({ endOfDay: time });
  },

  setStartOfDay: function (str) {
    var defaultStartOfDay = '08:00';
    var settings = this.settings();
    if(!str || str === '') str = defaultStartOfDay;
    var time = Date.parseTime(str);
    if(time > settings.endOfDay) {
      Session.set('errorMessage', "You can't start after you end!");
      $('.message').show();
      return false;
    }
    return settings.update({ startOfDay: time });
  },

  setLastReviewed: function (date) {
    var settings = this.settings();
    var time = Number(new Date(date));
    return settings.update({ lastReviewed: time });
  },

  hasOnboarded: function (key) {
    var settings = this.settings();
    if(!settings.hasOnboarded) settings.hasOnboarded = {};
    if(key === null || key === undefined) return settings.hasOnboarded;
    else                                  return settings.hasOnboarded[key];
  },

  setHasOnboarded: function (key, bool) {
    if(bool === undefined || bool === null) bool = true;
    var settings = this.settings();
    key = 'hasOnboarded.' + key;
    var selector = {};
    selector[key] = bool;
    return settings.update(selector);
  },

  setOnboardingIndex: function (index) {
    var settings = this.settings();
    index = _.bound(index, 0, Infinity);
    return settings.update({ onboardingIndex: index });
  },

  setMaxTaskInterval: function (time) {
    var settings = this.settings();
    if(!time) time = 24*HOURS;
    time = _.bound(time, 0, 24*HOURS);
    return settings.update({ maxTaskInterval: time });
  },

  setMaxTimePerTaskPerDay: function (time) {
    var settings = this.settings();
    if(!time) time = 24*HOURS;
    time = _.bound(time, 0, 24*HOURS);
    return settings.update({ maxTimePerTaskPerDay: time });
  },

  setTaskBreakInterval: function (time) {
    var settings = this.settings();
    if(!time) time = 0;
    time = _.bound(time, 0, 24*HOURS);
    return settings.update({ taskBreakInterval: time });
  },

  setTaskGranularity: function (time) {
    var settings = this.settings();
    if(!time) time = 0;
    time = _.bound(time, 0, 24*HOURS);
    return settings.update({ taskGranularity: time });
  },

  setLastDayOfWeek: function (number) {
    var settings = this.settings();
    if(!number) return 0;
    number = _.bound(number, 0, 6);
    return settings.update({ lastDayOfWeek: number });
  },

  setWorkWeek: function (numbers) {
    var settings = this.settings();
    if(!numbers) return 0;
    numbers = numbers.map(_.bound(0, 6));
    numbers = _.uniq(numbers);
    return settings.update({ workWeek: numbers });
  },

  referred: function (bool) {
    var settings = this.settings();
    if(bool !== undefined && bool !== null) {
      if(bool === settings.bool) return false;
      return settings.update({ isReferred: bool });
    }
    return settings.isReferred;
  },

  addReferral: function (str) {
    var settings = this.settings();
    if(str) return settings.update({ $addToSet: { referrals: str } });
    else    return null;
  },

  referrals: function () {
    var settings = this.settings();
    return settings.referrals;
  },

  removeReferral: function (str) {
    var settings = this.settings();
    if(str) return settings.update({ $pull: { referrals: str } });
    else    return null;
  },

  tasks: function () {
    return Tasks.find({ ownerId: this._id, isRemoved: { $ne: true } });
  },

  sortedTasks: function () {
    var tasks = this.tasks().fetch();
    tasks     = Tasks.basicSort(tasks);
    return tasks;
  },

  todos: function (selector, options) {
    selector = selector || {};
    _.extend(selector, {
      ownerId: this._id,
      isRemoved: { $ne: true },
      isDone: { $ne: true }
    });
    return Tasks.find(selector, options);
  },

  sortedTodos: function (selector, options) {
    var todos = this.todos(selector, options).fetch();
    todos     = Tasks.advancedSort(todos);
    return todos;
  },

  unsnoozedTodos: function (selector, options) {
    selector = selector || {};
    selector.snoozedUntil = { $lt: Date.now() };
    return this.sortedTodos(selector, options);
  },

  recentTodos: function () {
    var recentTodos = this.unsnoozedTodos({ needsReviewed: true });
    return recentTodos;
  },

  upcomingTodos: function () {
    var upcomingTodos = this.unsnoozedTodos({ needsReviewed: { $ne: true } });
    return upcomingTodos;
  },

  onboardingTasks: function () {
    var onboardingTasks = this.unsnoozedTodos({ isOnboardingTask: true });
    return onboardingTasks;
  },

  freetimes: function () {
    return Freetimes.find({ ownerId: this._id });
  },

  calendars: function () {
    var uid = this._id;
    return Calendars.find({ ownerId: uid });
  },

  activeCalendars: function () {
    var uid = this._id;
    return Calendars.find({ ownerId: uid, active: true });
  },

  calendarIdObjects: function () {
    var calendars = this.activeCalendars();
    var idObjects = calendars.map(function(calendar) {
      return { id: calendar.googleCalendarId };
    });
    return idObjects;
  },

  tags: function (selector, options) {
    var _selector = { ownerId: this._id, isRemoved: false };
    selector = _.extend(_selector, selector);
    return Tags.find(selector, options);
  },

  activeTags: function (selector, options) {
    selector = selector || {};
    selector.isActive = true;
    return this.tags(selector, options)
  },

  latestTodoTime: function () {
    var latestTodo = lodash.max(this.todos().fetch(), 'dueAt');
    var maxTime    = latestTodo.dueAt;
    return maxTime;
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
    selector = selector || {};
    selector.ownerId = this._id;
    return Events.find(selector, options);
  },

  calendarEvents: function (selector, options) {
    selector = selector || {};
    selector.taskId = selector.taskId || { $ne: true };
    return this.events(selector, options);
  },

  taskEvents: function (selector, options) {
    selector = selector || {};
    selector.taskId = selector.taskId || { $exists: true };
    return this.events(selector, options);
  },

  fetchTaskEventsInRange: function (start, end) {
    start = Number(new Date(start));
    end   = Number(new Date(end));
    var selector = { $or: [ {start: { $lt: end }}, {end: { $gt: start }} ] };
    return this.taskEvents(selector).fetch();
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

    var numDays = Date.numberOfDaysInRange(Date.endOfDay(start), Date.startOfDay(end));

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

    var percentage = timeSpent / totalTime;

    return percentage;
  }

});

Meteor.users.findByEmail = function (email) {
  return Meteor.users.findBy({ email: email });
};

// Requires email & password, could be an array of new users
Meteor.users.create = function (obj) {
  if(Array.isArray(obj)) {
    var ary = obj;
    ary.forEach(function(user) {
      Meteor.users.create(user);
    });
  } else if(typeof(obj) === 'object') {
    var user = Meteor.users.findByEmail(obj.email);
    // if(!user) return Meteor.users.insert(user);
  } else {
    console.error('type error, Meteor.users.create does not expect: ', typeof(obj));
  }
};
