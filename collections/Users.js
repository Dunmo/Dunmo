
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

 Meteor.users.helpers({

  setRemoved: function (bool) {
    return this.settings().setRemoved(bool);
  },

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

  endOfDay: function () {
    var defaultEndOfDay = '22:00';
    var settings = this.settings();
    if(!settings.endOfDay) return Date.parseTime(defaultEndOfDay);
    else                   return settings.endOfDay;
  },

  setEndOfDay: function (str) {
    var defaultEndOfDay = '22:00';
    var settings = this.settings();
    if(!str || str === '') str = defaultEndOfDay;
    var time = Date.parseTime(str);
    return settings.update({ endOfDay: time });
  },

  startOfDay: function () {
    var defaultStartOfDay = '08:00';
    var settings = this.settings();
    if(!settings.startOfDay) return Date.parseTime(defaultStartOfDay);
    else                     return settings.startOfDay;
  },

  setStartOfDay: function (str) {
    var defaultStartOfDay = '08:00';
    var settings = this.settings();
    if(!str || str === '') str = defaultStartOfDay;
    var time = Date.parseTime(str);
    return settings.update({ startOfDay: time });
  },

  lastReviewed: function (date) {
    var settings = this.settings();
    if(!settings.lastReviewed) return 0;
    else                     return settings.lastReviewed;
  },

  setLastReviewed: function (date) {
    var settings = this.settings();
    var time = Number(new Date(date));
    return settings.update({ lastReviewed: time });
  },

  maxTaskInterval: function () {
    var settings = this.settings();
    return settings.maxTaskInterval;
  },

  setMaxTaskInterval: function (str) {
    var settings = this.settings();
    var time = Date.parseDuration(str);
    return settings.update({ maxTaskInterval: time });
  },

  maxTimePerTaskPerDay: function (str) {
    var settings = this.settings();
    return settings.maxTimePerTaskPerDay;
  },

  setMaxTimePerTaskPerDay: function (str) {
    var settings = this.settings();
    var time = Date.parseDuration(str);
    return settings.update({ maxTimePerTaskPerDay: time });
  },

  taskBreakInterval: function (str) {
    var settings = this.settings();
    return settings.taskBreakInterval;
  },

  setTaskBreakInterval: function (str) {
    var settings = this.settings();
    var time = Date.parseDuration(str);
    return settings.update({ taskBreakInterval: time });
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

  taskCalendarId: function (str) {
    var settings = this.settings();
    if(str && str === settings.taskCalendarId) return false;
    if(str) return settings.update({ taskCalendarId: str });
    else    return settings.taskCalendarId;
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
    todos     = Tasks.basicSort(todos);
    return todos;
  },

  recentTodos: function () {
    var recentTodos = this.sortedTodos({ needsReviewed: true });
    return recentTodos;
  },

  upcomingTodos: function () {
    var upcomingTodos = this.sortedTodos({ needsReviewed: { $ne: true } });
    return upcomingTodos;
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
      algorithm: 'greedy',
      maxTaskInterval: this.maxTaskInterval();
      maxTimePerTaskPerDay: this.maxTimePerTaskPerDay();
    });
    return todoList;
  }

};

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
