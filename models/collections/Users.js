
Schemas.UserSettings = new SimpleSchema({
  startOfDay: {
    type:         Number,
    defaultValue: Date.parseTime('08:00'),
    min:          Date.parseTime('00:00'),
    max:          Date.parseTime('23:59'),
  },
  endOfDay: {
    type:         Number,
    defaultValue: Date.parseTime('22:00'),
    min:          Date.parseTime('00:00'),
    max:          Date.parseTime('23:59'),
  },
  taskCalendarId:       { type: String,   optional: true },
  referrals:            { type: [String], defaultValue: [] },
  isReferred:           { type: Boolean,  defaultValue: false },
  minTaskInterval:      { type: Number,   defaultValue: 15*MINUTES, min: 0, max: 24*HOURS },
  maxTaskInterval:      { type: Number,   defaultValue: 2*HOURS,    min: 0, max: 24*HOURS },
  maxTimePerTaskPerDay: { type: Number,   defaultValue: 6*HOURS,    min: 0, max: 24*HOURS },
  taskBreakInterval:    { type: Number,   defaultValue: 30*MINUTES, min: 0, max: 24*HOURS },
  // lastDayOfWeek:        { type: Number, min: 0, max: 6 }, // inclusive
  // workWeek:             { type: RRule },
  // "workWeek.$":         { type: Number, min: 0, max: 6},
});

Schemas.UserProfile = new SimpleSchema({
  givenName:  { type: String },
  familyName: { type: String },
  settings:   { type: Schemas.UserSettings },
});

Schemas.User = new SimpleSchema([Schemas.Default, {
  emails:              { type: [Object], optional: true },
  "emails.$":          { type: Object  },
  "emails.$.address":  { type: String,   regEx: SimpleSchema.RegEx.Email },
  "emails.$.verified": { type: Boolean },
  createdAt:           { type: Date    },
  services:            { type: Object,   optional: true, blackbox: true },
  profile:             { type: Schemas.UserProfile, optional: true },
}]);

UserHelpers = {
  gmailAddress: function () {
    return this.services && this.services.google && this.services.google.email;
  },

  primaryEmailAddress: function () {
    var email = this.gmailAddress();
    if(email) return email;
    else      return this.emails && this.emails[0] && this.emails[0].address;
  },

  allEmails: function () {
    var emails = this.emails && _.pluck(this.emails, 'address');
    var gmail  = this.gmailAddress();
    if(gmail) emails.push(gmail);
    return emails;
  },

  isGoogleAuthed: function () {
    return !!this.gmailAddress();
  },

  hasOnboarded: function (key) {
    var settings = this.profile.settings;
    if(!settings.hasOnboarded) settings.hasOnboarded = {};
    if(key === null || key === undefined) return settings.hasOnboarded;
    else                                  return settings.hasOnboarded[key];
  },

  setHasOnboarded: function (key, bool) {
    var settings = this.profile.settings;
    if(bool === undefined || bool === null) bool = true;
    key = 'profile.settings.hasOnboarded.' + key;
    var modifier = {};
    modifier[key] = bool;
    return this.update(modifier);
  },

  addReferral: function (str) {
    var settings = this.profile.settings;
    if(str) return settings.update({ $addToSet: { referrals: str } });
  },

  removeReferral: function (str) {
    var settings = this.profile.settings;
    if(str) return settings.update({ $pull: { referrals: str } });
    else    return null;
  },

  // TODO: create custom selectors, i.e. selectors.todo = { isDone: { $ne: true } }
  tasks: function (selector, options) {
    var defaults = { ownerId: this._id, isRemoved: false };
    selector = _.extend({}, defaults, selector);
    return Tasks.find(selector, options);
  },

  fetchTasks: function (selector, options) {
    return this.tasks(selector, options).fetch();
  },

  fetchSortedTasks: function (selector, options) {
    return Tasks.advancedSort(this.fetchTasks(selector, options));
  },

  doneTasks: function (selector, options) {
    selector = _.extend({}, { isDone: true }, selector);
    options  = _.extend({}, { sort: [['lastMarkedDoneAt', 'desc']] }, options);
    return this.tasks(selector, options);
  },

  fetchDoneTasks: function (selector, options) {
    return this.doneTasks(selector, options).fetch();
  },

  removedTasks: function (selector, options) {
    selector = _.extend({}, { ownerId: this._id, isRemoved: true }, selector);
    options  = _.extend({}, { sort: [['lastRemovedAt', 'desc']] }, options);
    return Tasks.direct.find(selector, options);
  },

  fetchRemovedTasks: function (selector, options) {
    return this.removedTasks(selector, options).fetch();
  },

  todos: function (selector, options) {
    selector = _.extend({}, { isDone: { $ne: true } }, selector);
    return this.tasks(selector, options);
  },

  fetchTodos: function (selector, options) {
    return this.todos(selector, options).fetch();
  },

  fetchSortedTodos: function (selector, options) {
    return Tasks.advancedSort(this.fetchTodos(selector, options));
  },

  fetchUnsnoozedTodos: function (selector, options) {
    selector = _.extend({}, { snoozedUntil: { $lte: Date.now() } }, selector);
    return this.fetchSortedTodos(selector, options);
  },

  fetchSnoozedTodos: function (selector, options) {
    selector = _.extend({}, { snoozedUntil: { $gt: Date.now() } }, selector);
    return this.fetchSortedTodos(selector, options);
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
    todos     = this.fetchSortedTodos();
    freetimes = freetimes || this.freetimes();
    todoList  = Scheduler.generateTodoList(freetimes, todos, {
      algorithm:            'greedy',
      minTaskInterval:      this.minTaskInterval(),
      maxTaskInterval:      this.maxTaskInterval(),
      maxTimePerTaskPerDay: this.maxTimePerTaskPerDay(),
      taskBreakInterval:    this.taskBreakInterval()
    });
    return todoList;
  },

  projects: function (selector, options) {
    selector = _.extend({}, { ownerId: this._id }, selector);
    return Projects.find(selector, options);
  },

  fetchProjects: function (selector, options) {
    return this.projects(selector, options).fetch();
  },

  currentProjects: function (selector, options) {
    selector = _.extend({}, { isArchived: { $ne: true } }, selector);
    return this.projects(selector, options);
  },

  fetchCurrentProjects: function (selector, options) {
    return this.currentProjects(selector, options).fetch();
  },

  archivedProjects: function (selector, options) {
    selector = _.extend({}, { isArchived: true }, selector);
    return this.projects(selector, options);
  },

  fetchArchivedProjects: function (selector, options) {
    return this.fetchArchivedProjects(selector, options).fetch();
  },

  events: function (selector, options) {
    selector = _.extend({}, { ownerId: this._id, isRemoved: { $ne: true } }, selector);
    return Events.find(selector, options);
  },

  calendarEvents: function (selector, options) {
    selector = _.extend({}, { $or: [
      { taskId: null },
      { taskId: false },
      { taskId: { $exists: false } }
    ] }, selector);
    return this.events(selector, options);
  },

  taskEvents: function (selector, options) {
    selector = _.extend({}, { taskId: { $type: 2 /*String*/ } }, selector);
    return this.events(selector, options);
  },

  fetchTaskEvents: function (selector, options) {
    return this.taskEvents(selector, options).fetch();
  },

  // also retrieves events that overlap boundaries
  fetchTaskEventsInRange: function (start, end) {
    start = Number(new Date(start));
    end   = Number(new Date(end));
    var selector = { $and: [ {start: { $lt: end }}, {end: { $gt: start }} ] };
    return this.fetchTaskEvents(selector);
  },

  lengthOfWorkday: function () {
    var startOfDay = this.startOfDay();
    var endOfDay   = this.endOfDay();
    if(startOfDay < endOfDay) return endOfDay - startOfDay;
    else                      return endOfDay + (24*HOURS - startOfDay);
  },

  _isOutsideDay: function (date) {
    date           = Number(new Date(date));
    var startOfDay = this.startOfDay();
    var endOfDay   = this.endOfDay();
    var timeOfDay  = Date.timeOfDay(date);
    if(startOfDay < endOfDay) return timeOfDay < startOfDay || timeOfDay > endOfDay;
    else                      return timeOfDay > startOfDay || timeOfDay < endOfDay;
  },

  _nextStart: function (date) {
    date           = Number(new Date(date));
    var startOfDay = this.startOfDay();
    var timeOfDay  = Date.timeOfDay(date);
    if(timeOfDay < startOfDay) return date + (startOfDay - timeOfDay);
    else                       return date - (timeOfDay - startOfDay) + 1*DAYS;
  },

  _lastStart: function (date) {
    if(Date.timeOfDay(date) === this.startOfDay()) return date - 1*DAYS;
    else return this._nextStart(date) - 1*DAYS;
  },

  _lastEnd: function (date) {
    date           = Number(new Date(date));
    var endOfDay   = this.endOfDay();
    var timeOfDay  = Date.timeOfDay(date);
    if(timeOfDay > endOfDay) return date - (timeOfDay - endOfDay);
    else                     return date + (endOfDay - timeOfDay) - 1*DAYS;
  },

  _isSameWorkday: function (dates) {
    var firstStart = this._nextStart(dates[0]);
    var self = this;
    return dates.every(function (date) {
      return self._nextStart(date) === firstStart;
    });
  },

  _beginningSegment: function (date) {
    date           = Number(new Date(date));
    var endOfDay   = this.endOfDay();
    var timeOfDay  = Date.timeOfDay(date);
    if(timeOfDay < endOfDay) return endOfDay - timeOfDay;
    else                     return endOfDay + (24*HOURS - timeOfDay);
  },

  _endSegment: function (date) {
    date           = Number(new Date(date));
    var startOfDay = this.startOfDay();
    var timeOfDay  = Date.timeOfDay(date);
    if(timeOfDay > startOfDay) return timeOfDay - startOfDay;
    else                       return timeOfDay + (24*HOURS - startOfDay);
  },

  _numberOfWorkdaysInRangeInclusive: function (start, end) {
    start = this._nextStart(start);
    end   = this._lastStart(start);
    var ret = Math.floor((end - start) / DAYS);
    ret = _.bound(ret, 0, Infinity);
    return ret;
  },

  workTimeInRange: function (start, end) {
    start = Number(new Date(start));
    end   = Number(new Date(end));

    if(this._isOutsideDay(start)) start = this._nextStart(start);
    if(this._isOutsideDay(end))   end   = this._lastEnd(end);

    if(this._isSameWorkday([start, end])) return end - start;

    var numDays = this._numberOfWorkdaysInRangeInclusive(start, end);
    var lengthOfWorkday  = this.lengthOfWorkday();

    var workTime = this._beginningSegment(start) +
                   numDays*lengthOfWorkday +
                   this._endSegment(end);

    return workTime;
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

};

var settingsPropsAndDefaults = [
  ['startOfDay', Date.parseTime('08:00')],
  ['endOfDay', Date.parseTime('22:00')],
  ['taskCalendarId', null],
  ['referrals', []],
  ['isReferred', false],
  ['minTaskInterval', 15*MINUTES],
  ['maxTaskInterval', 2*HOURS],
  ['maxTimePerTaskPerDay', 6*HOURS],
  ['taskBreakInterval', 30*MINUTES],
  ['lastDayOfWeek', 'monday']
];

settingsPropsAndDefaults.forEach(function (pair) {
  var prop       = pair[0];
  var defaultVal = pair[1];
  UserHelpers[prop] = function () {
    var settings = this.profile.settings;
    if(!settings[prop]) return defaultVal;
    else                return settings[prop];
  };
});

var settingsSettersAndFilters = [
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
    return time;
  }],
  ['minTaskInterval', function (time) {
    if(!time) time = 15*MINUTES;
    var granularity = Tasks.GRANULARITY;
    time = Math.round(time / granularity) * granularity;
    return _.bound(time, 0, 24*HOURS);
  }],
  ['maxTaskInterval', function (time) {
    if(!time) time = 24*HOURS;
    var granularity = Tasks.GRANULARITY;
    time = Math.round(time / granularity) * granularity;
    return _.bound(time, 0, 24*HOURS);
  }],
  ['maxTimePerTaskPerDay', function (time) {
    if(!time) time = 24*HOURS;
    var granularity = Tasks.GRANULARITY;
    time = Math.round(time / granularity) * granularity;
    return _.bound(time, 0, 24*HOURS);
  }],
  ['taskBreakInterval', function (time) {
    if(!time) time = 0;
    var granularity = Tasks.GRANULARITY;
    time = Math.round(time / granularity) * granularity;
    return _.bound(time, 0, 24*HOURS);
  }],
  // ['lastDayOfWeek', function (number) {
  //   return _.bound(number, 0, 6);
  // }],
  // ['workWeek', function (numbers) {
  //   numbers = numbers.map(_.bound(0, 6));
  //   return _.uniq(numbers);
  // }],
  ['isReferred', function (bool) { return bool; }]
];

settingsSettersAndFilters.forEach(function (pair) {
  var prop       = pair[0];
  var filter     = pair[1];
  var setterName = 'set' + prop.capitalize();
  UserHelpers[setterName] = function (value) {
    var settings = this.profile.settings;
    value = filter(value, settings);
    if(value && value.err) return false;
    var obj = {};
    obj['profile.settings.' + prop] = value;
    return this.update(obj);
  };
});

Users.helpers(UserHelpers);

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
